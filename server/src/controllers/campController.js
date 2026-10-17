import { Camp, User } from '../models/index.js';
import { HttpError, pick } from '../utils/httpError.js';
import { toPoint, pointFromQuery, clampRadiusKm, distanceKm } from '../utils/geo.js';
import { notifyMany } from '../services/notify.js';

const FIELDS = ['name', 'description', 'date', 'startTime', 'endTime', 'venue', 'city', 'capacity', 'contactPhone'];

function present(camp, viewer) {
  const obj = camp.toObject();
  obj.isOrganizer = Boolean(viewer && String(camp.organizer?._id ?? camp.organizer) === String(viewer._id));
  obj.isRegistered = Boolean(viewer && camp.participants.some((p) => String(p?._id ?? p) === String(viewer._id)));
  obj.seatsLeft = Math.max(0, camp.capacity - camp.registeredCount);
  if (!obj.isOrganizer) delete obj.participants; // participant list is private to the organizer
  if (viewer?.location) obj.distanceKm = distanceKm(viewer.location, camp.location);
  return obj;
}

async function findOwnCamp(id, user) {
  const camp = await Camp.findById(id);
  if (!camp) throw new HttpError(404, 'Camp not found');
  if (String(camp.organizer) !== String(user._id)) throw new HttpError(403, 'Only the organizer can do that');
  return camp;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// GET /api/camps?when=upcoming|past|all&lat=&lng=&radiusKm=&mine=true
export async function listCamps(req, res) {
  const { when = 'upcoming', mine } = req.query;
  const filter = {};
  if (when === 'upcoming') filter.date = { $gte: startOfToday() };
  if (when === 'past') filter.date = { $lt: startOfToday() };
  if (mine === 'true' && req.user) filter.organizer = req.user._id;

  const point = pointFromQuery(req.query);
  let query;
  if (point) {
    filter.location = { $near: { $geometry: point, $maxDistance: clampRadiusKm(req.query.radiusKm, 100) * 1000 } };
    query = Camp.find(filter);
  } else {
    query = Camp.find(filter).sort({ date: when === 'past' ? -1 : 1 });
  }
  const camps = await query.limit(100).populate('organizer', 'name');
  res.json({ count: camps.length, camps: camps.map((c) => present(c, req.user)) });
}

// GET /api/camps/:id
export async function getCamp(req, res) {
  const camp = await Camp.findById(req.params.id).populate('organizer', 'name phone');
  if (!camp) throw new HttpError(404, 'Camp not found');
  if (req.user && String(camp.organizer._id) === String(req.user._id)) {
    await camp.populate('participants', 'name phone bloodGroup');
  }
  res.json({ camp: present(camp, req.user) });
}

// POST /api/camps   - create a camp and tell donors within 20 km
export async function createCamp(req, res) {
  const camp = await Camp.create({
    ...pick(req.body, FIELDS),
    location: toPoint(req.body.lat, req.body.lng),
    organizer: req.user._id,
  });

  const nearbyDonors = await User.find({
    _id: { $ne: req.user._id },
    isDonor: true,
    location: { $near: { $geometry: camp.location, $maxDistance: 20_000 } },
  }).limit(100).select('_id');

  await notifyMany(nearbyDonors.map((d) => d._id), {
    type: 'camp',
    title: `🏕️ New donation camp near you: ${camp.name}`,
    message: `${camp.venue}, ${camp.city} on ${camp.date.toDateString()}. Book a slot before seats run out!`,
    link: '/camps',
  });

  res.status(201).json({ camp: present(camp, req.user), notified: nearbyDonors.length });
}

// PUT /api/camps/:id
export async function updateCamp(req, res) {
  const camp = await findOwnCamp(req.params.id, req.user);
  const updates = pick(req.body, FIELDS);
  if (updates.capacity !== undefined && Number(updates.capacity) < camp.registeredCount) {
    throw new HttpError(400, `Capacity cannot be less than the ${camp.registeredCount} people already registered`);
  }
  camp.set(updates);
  if (req.body.lat !== undefined && req.body.lng !== undefined) camp.location = toPoint(req.body.lat, req.body.lng);
  await camp.save();
  res.json({ camp: present(camp, req.user) });
}

// DELETE /api/camps/:id
export async function deleteCamp(req, res) {
  const camp = await findOwnCamp(req.params.id, req.user);
  await notifyMany(camp.participants, {
    type: 'camp',
    title: `Camp cancelled: ${camp.name}`,
    message: `The camp on ${camp.date.toDateString()} at ${camp.venue} was cancelled by the organizer.`,
    link: '/camps',
  });
  await camp.deleteOne();
  res.json({ message: 'Camp deleted' });
}

// POST /api/camps/:id/register
export async function registerForCamp(req, res) {
  // ⭐ Atomic seat booking: the filter checks "seats left" AND "not already registered"
  // in the SAME operation as the update, so two people can never take the last seat.
  const camp = await Camp.findOneAndUpdate(
    {
      _id: req.params.id,
      date: { $gte: startOfToday() },
      participants: { $ne: req.user._id },
      $expr: { $lt: ['$registeredCount', '$capacity'] },
    },
    { $push: { participants: req.user._id }, $inc: { registeredCount: 1 } },
    { new: true },
  );
  if (!camp) {
    const exists = await Camp.findById(req.params.id);
    if (!exists) throw new HttpError(404, 'Camp not found');
    if (exists.participants.some((p) => String(p) === String(req.user._id))) throw new HttpError(400, 'You are already registered');
    if (exists.date < startOfToday()) throw new HttpError(400, 'This camp is already over');
    throw new HttpError(400, 'Sorry, this camp is full');
  }
  res.json({ camp: present(camp, req.user) });
}

// DELETE /api/camps/:id/register
export async function unregisterFromCamp(req, res) {
  const camp = await Camp.findOneAndUpdate(
    { _id: req.params.id, participants: req.user._id },
    { $pull: { participants: req.user._id }, $inc: { registeredCount: -1 } },
    { new: true },
  );
  if (!camp) throw new HttpError(400, 'You are not registered for this camp');
  res.json({ camp: present(camp, req.user) });
}
