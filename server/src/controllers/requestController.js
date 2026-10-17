import { BloodRequest, Donation, User } from '../models/index.js';
import { ALERT_RADIUS_KM } from '../models/BloodRequest.js';
import { HttpError, pick } from '../utils/httpError.js';
import { toPoint, pointFromQuery, clampRadiusKm, distanceKm } from '../utils/geo.js';
import { BLOOD_GROUPS, isCompatible, recipientGroupsFor, BLOOD_GROUP_LABELS } from '../utils/bloodCompatibility.js';
import { checkEligibility } from '../utils/eligibility.js';
import { RELIABILITY } from '../utils/gamification.js';
import { findMatchingDonors } from '../services/matching.js';
import { notify, notifyMany, adjustReliability } from '../services/notify.js';

const EDITABLE_FIELDS = ['patientName', 'bloodGroup', 'unitsNeeded', 'hospital', 'city', 'urgency', 'contactPhone', 'requiredBy', 'note'];
const URGENCY_RANK = { critical: 0, urgent: 1, normal: 2 };

/** What a viewer may see. Only the requester sees WHO pledged (and their phone numbers). */
function present(request, viewer) {
  const obj = request.toObject();
  const isOwner = viewer && String(request.requester?._id ?? request.requester) === String(viewer._id);
  const myResponse = viewer && request.responses.find((r) => String(r.donor?._id ?? r.donor) === String(viewer._id));

  obj.pledgedCount = request.countResponses('pledged');
  obj.donatedCount = request.countResponses('donated');
  obj.isOwner = Boolean(isOwner);
  obj.myResponse = myResponse?.status ?? null;
  if (!isOwner) delete obj.responses;
  if (viewer?.location && request.location) obj.distanceKm = distanceKm(viewer.location, request.location);
  return obj;
}

async function findOwnRequest(id, user) {
  const request = await BloodRequest.findById(id);
  if (!request) throw new HttpError(404, 'Request not found');
  if (String(request.requester) !== String(user._id)) throw new HttpError(403, 'Only the person who created this request can do that');
  return request;
}

// POST /api/requests   - create a request and alert matching donors nearby (SOS)
export async function createRequest(req, res) {
  const data = pick(req.body, EDITABLE_FIELDS);
  data.location = toPoint(req.body.lat, req.body.lng);
  data.requester = req.user._id;

  const request = new BloodRequest(data);
  request.refreshExpiry();
  await request.save();

  const matches = await findMatchingDonors({
    point: request.location,
    bloodGroup: request.bloodGroup,
    radiusKm: ALERT_RADIUS_KM[request.urgency],
    excludeUserId: req.user._id,
    limit: 30,
  });

  const icon = request.urgency === 'critical' ? '🚨' : '🩸';
  request.notifiedCount = await notifyMany(matches.map((d) => d._id), {
    type: 'request',
    title: `${icon} ${BLOOD_GROUP_LABELS[request.bloodGroup]} blood needed at ${request.hospital}`,
    message: `${request.unitsNeeded} unit(s) needed for ${request.patientName} in ${request.city}. You are a compatible donor nearby - can you help?`,
    link: `/requests/${request._id}`,
  });
  await request.save();

  res.status(201).json({ request: present(request, req.user), notifiedCount: request.notifiedCount, topMatches: matches.slice(0, 5) });
}

// GET /api/requests?status=open&bloodGroup=&city=&mine=true&lat=&lng=&radiusKm=
export async function listRequests(req, res) {
  const { status = 'open', bloodGroup, city, mine } = req.query;
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (BLOOD_GROUPS.includes(bloodGroup)) filter.bloodGroup = bloodGroup;
  if (city) filter.city = new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  if (mine === 'true') {
    if (!req.user) throw new HttpError(401, 'Please log in to continue');
    filter.requester = req.user._id;
  }

  const point = pointFromQuery(req.query);
  if (point) {
    filter.location = { $near: { $geometry: point, $maxDistance: clampRadiusKm(req.query.radiusKm, 50) * 1000 } };
  }

  let requests = await BloodRequest.find(filter).limit(100).populate('requester', 'name');
  if (!point) {
    // critical first, then newest
    requests = requests.sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || b.createdAt - a.createdAt);
  }
  res.json({ count: requests.length, requests: requests.map((r) => present(r, req.user)) });
}

// GET /api/requests/for-me  - open requests near me that MY blood group can help
export async function requestsForMe(req, res) {
  const me = req.user;
  const requests = await BloodRequest.find({
    status: 'open',
    requester: { $ne: me._id },
    bloodGroup: { $in: recipientGroupsFor(me.bloodGroup) },
    location: { $near: { $geometry: me.location, $maxDistance: clampRadiusKm(req.query.radiusKm, 50) * 1000 } },
  })
    .limit(30)
    .populate('requester', 'name');

  res.json({ count: requests.length, eligibility: checkEligibility(me), requests: requests.map((r) => present(r, me)) });
}

// GET /api/requests/:id
export async function getRequest(req, res) {
  const request = await BloodRequest.findById(req.params.id).populate('requester', 'name');
  if (!request) throw new HttpError(404, 'Request not found (it may have expired)');
  if (req.user && String(request.requester._id) === String(req.user._id)) {
    await request.populate('responses.donor', 'name phone bloodGroup city reliabilityScore donationsCount');
  }
  res.json({ request: present(request, req.user) });
}

// PUT /api/requests/:id
export async function updateRequest(req, res) {
  const request = await findOwnRequest(req.params.id, req.user);
  if (request.status !== 'open') throw new HttpError(400, 'Only open requests can be edited');

  const urgencyBefore = request.urgency;
  request.set(pick(req.body, EDITABLE_FIELDS));
  if (req.body.lat !== undefined && req.body.lng !== undefined) request.location = toPoint(req.body.lat, req.body.lng);
  if (request.urgency !== urgencyBefore) request.refreshExpiry();
  await request.save();
  res.json({ request: present(request, req.user) });
}

// PATCH /api/requests/:id/status   { status: 'open' | 'fulfilled' | 'cancelled' }
export async function updateStatus(req, res) {
  const request = await findOwnRequest(req.params.id, req.user);
  const { status } = req.body;
  if (!['open', 'fulfilled', 'cancelled'].includes(status)) throw new HttpError(400, 'Invalid status');

  request.status = status;
  request.refreshExpiry(); // closed requests lose expiresAt → TTL keeps them as history
  await request.save();

  const pledgedDonors = request.responses.filter((r) => r.status === 'pledged').map((r) => r.donor);
  if (status !== 'open') {
    await notifyMany(pledgedDonors, {
      type: 'request',
      title: status === 'fulfilled' ? '✅ Request fulfilled - thank you!' : 'Request cancelled',
      message: `The request for ${request.patientName} at ${request.hospital} is now ${status}. No action needed.`,
      link: `/requests/${request._id}`,
    });
  }
  res.json({ request: present(request, req.user) });
}

// DELETE /api/requests/:id
export async function deleteRequest(req, res) {
  const request = await findOwnRequest(req.params.id, req.user);
  await request.deleteOne();
  res.json({ message: 'Request deleted' });
}

// POST /api/requests/:id/respond   { action: 'pledge' | 'withdraw' }
export async function respond(req, res) {
  const me = req.user;
  const { action } = req.body;
  const request = await BloodRequest.findById(req.params.id);
  if (!request) throw new HttpError(404, 'Request not found');

  if (action === 'pledge') {
    if (String(request.requester) === String(me._id)) throw new HttpError(400, 'You cannot pledge to your own request');
    if (!isCompatible(me.bloodGroup, request.bloodGroup)) {
      throw new HttpError(400, `${BLOOD_GROUP_LABELS[me.bloodGroup]} cannot be given to a ${BLOOD_GROUP_LABELS[request.bloodGroup]} patient`);
    }
    const eligibility = checkEligibility(me);
    if (!eligibility.eligible) throw new HttpError(400, eligibility.reasons[0]);

    // Atomic: only succeeds if the request is still open AND I have not responded yet
    const updated = await BloodRequest.findOneAndUpdate(
      { _id: request._id, status: 'open', 'responses.donor': { $ne: me._id } },
      { $push: { responses: { donor: me._id, status: 'pledged' } } },
      { new: true },
    );
    if (!updated) {
      // maybe I withdrew earlier → pledge again
      const repledged = await BloodRequest.findOneAndUpdate(
        { _id: request._id, status: 'open', responses: { $elemMatch: { donor: me._id, status: 'withdrawn' } } },
        { $set: { 'responses.$.status': 'pledged', 'responses.$.respondedAt': new Date() } },
        { new: true },
      );
      if (!repledged) throw new HttpError(400, 'You already responded, or this request is closed');
    }
    await adjustReliability(me._id, RELIABILITY.PLEDGE);
    await notify(request.requester, {
      type: 'pledge',
      title: `🙌 ${me.name} pledged to donate for ${request.patientName}`,
      message: `${BLOOD_GROUP_LABELS[me.bloodGroup]} donor from ${me.city}. Phone: ${me.phone}. Open the request to confirm after donation.`,
      link: `/requests/${request._id}`,
    });
  } else if (action === 'withdraw') {
    const updated = await BloodRequest.findOneAndUpdate(
      { _id: request._id, responses: { $elemMatch: { donor: me._id, status: 'pledged' } } },
      { $set: { 'responses.$.status': 'withdrawn' } }, // $ = the array element matched above
      { new: true },
    );
    if (!updated) throw new HttpError(400, 'You have no active pledge on this request');
    await adjustReliability(me._id, RELIABILITY.WITHDRAW);
    await notify(request.requester, {
      type: 'pledge',
      title: `${me.name} withdrew their pledge`,
      message: `For ${request.patientName}. We are still showing your request to other donors.`,
      link: `/requests/${request._id}`,
    });
  } else {
    throw new HttpError(400, "action must be 'pledge' or 'withdraw'");
  }

  const fresh = await BloodRequest.findById(request._id).populate('requester', 'name');
  res.json({ request: present(fresh, me) });
}

// POST /api/requests/:id/confirm/:donorId  - requester confirms the donor actually donated
export async function confirmDonation(req, res) {
  const request = await findOwnRequest(req.params.id, req.user);
  const response = request.responses.find((r) => String(r.donor) === req.params.donorId && r.status === 'pledged');
  if (!response) throw new HttpError(400, 'This donor has no active pledge on your request');

  response.status = 'donated';
  if (request.countResponses('donated') >= request.unitsNeeded) request.status = 'fulfilled';
  request.refreshExpiry();
  await request.save();

  const now = new Date();
  await Donation.create({ donor: response.donor, request: request._id, date: now, place: request.hospital, units: 1, verified: true });
  await User.updateOne({ _id: response.donor }, { $set: { lastDonationDate: now }, $inc: { donationsCount: 1 } });
  await adjustReliability(response.donor, RELIABILITY.DONATE);
  await notify(response.donor, {
    type: 'donation',
    title: '❤️ Your donation was confirmed - you saved lives today!',
    message: `${request.patientName}'s family confirmed your donation at ${request.hospital}. It's now in your Donor Passport.`,
    link: '/passport',
  });

  await request.populate([
    { path: 'requester', select: 'name' },
    { path: 'responses.donor', select: 'name phone bloodGroup city reliabilityScore donationsCount' },
  ]);
  res.json({ request: present(request, req.user) });
}
