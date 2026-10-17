import { User, Donation, BloodRequest, Camp, Notification } from '../models/index.js';
import { HttpError, pick } from '../utils/httpError.js';
import { toPoint } from '../utils/geo.js';
import { checkEligibility } from '../utils/eligibility.js';
import { computeBadges, levelFor, LIVES_PER_UNIT } from '../utils/gamification.js';
import { recipientGroupsFor, donorGroupsFor } from '../utils/bloodCompatibility.js';

const PROFILE_FIELDS = ['name', 'phone', 'gender', 'dateOfBirth', 'weight', 'bloodGroup', 'isDonor', 'available', 'city', 'address'];

// PUT /api/users/me
export async function updateMe(req, res) {
  const updates = pick(req.body, PROFILE_FIELDS);
  if (req.body.lat !== undefined && req.body.lng !== undefined) {
    updates.location = toPoint(req.body.lat, req.body.lng);
  }
  req.user.set(updates);
  await req.user.save(); // save() runs the schema validators
  res.json({ user: req.user });
}

// PATCH /api/users/me/availability   { available: true|false }
export async function setAvailability(req, res) {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { available: Boolean(req.body.available) } },
    { new: true },
  );
  res.json({ user });
}

// PATCH /api/users/me/password   { currentPassword, newPassword }
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword || ''))) throw new HttpError(400, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
}

// DELETE /api/users/me  - removes the account and cleans up everything linked to it
export async function deleteMe(req, res) {
  const userId = req.user._id;
  await Promise.all([
    Donation.deleteMany({ donor: userId }),
    Notification.deleteMany({ user: userId }),
    BloodRequest.updateMany({ requester: userId, status: 'open' }, { $set: { status: 'cancelled' }, $unset: { expiresAt: '' } }),
    Camp.updateMany({ participants: userId }, { $pull: { participants: userId }, $inc: { registeredCount: -1 } }),
    Camp.deleteMany({ organizer: userId }),
  ]);
  await User.deleteOne({ _id: userId });
  res.json({ message: 'Account deleted' });
}

// GET /api/users/me/passport  - the Donor Passport (eligibility, badges, history)
export async function passport(req, res) {
  const user = req.user;
  const [donations, totals, myRequests, pledges] = await Promise.all([
    Donation.find({ donor: user._id }).sort({ date: -1 }).populate('request', 'patientName hospital'),
    Donation.aggregate([
      { $match: { donor: user._id } },
      { $group: { _id: null, units: { $sum: '$units' }, verified: { $sum: { $cond: ['$verified', 1, 0] } } } },
    ]),
    BloodRequest.countDocuments({ requester: user._id }),
    BloodRequest.find({ responses: { $elemMatch: { donor: user._id, status: 'pledged' } }, status: 'open' })
      .select('patientName bloodGroup hospital city urgency'),
  ]);

  const units = totals[0]?.units ?? 0;
  res.json({
    user,
    eligibility: checkEligibility(user),
    badges: computeBadges(user),
    level: levelFor(user.donationsCount),
    stats: {
      donations: user.donationsCount,
      units,
      verifiedDonations: totals[0]?.verified ?? 0,
      livesSaved: units * LIVES_PER_UNIT,
      reliabilityScore: user.reliabilityScore,
      requestsCreated: myRequests,
    },
    compatibility: { canDonateTo: recipientGroupsFor(user.bloodGroup), canReceiveFrom: donorGroupsFor(user.bloodGroup) },
    activePledges: pledges,
    donations,
  });
}
