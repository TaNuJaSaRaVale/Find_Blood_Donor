import { Donation, User } from '../models/index.js';
import { HttpError, pick } from '../utils/httpError.js';

const FIELDS = ['date', 'place', 'units', 'notes'];

/** Re-calculates donationsCount and lastDonationDate from the Donation collection. */
async function recomputeDonorStats(donorId) {
  const [stats] = await Donation.aggregate([
    { $match: { donor: donorId } },
    { $group: { _id: '$donor', count: { $sum: 1 }, last: { $max: '$date' } } },
  ]);
  await User.updateOne({ _id: donorId }, { $set: { donationsCount: stats?.count ?? 0, lastDonationDate: stats?.last ?? null } });
}

async function findOwnDonation(id, user) {
  const donation = await Donation.findById(id);
  if (!donation) throw new HttpError(404, 'Donation not found');
  if (String(donation.donor) !== String(user._id)) throw new HttpError(403, 'Not your donation');
  if (donation.verified) throw new HttpError(400, 'Verified donations (confirmed through a request) cannot be changed');
  return donation;
}

// GET /api/donations/me
export async function myDonations(req, res) {
  const donations = await Donation.find({ donor: req.user._id }).sort({ date: -1 }).populate('request', 'patientName hospital');
  res.json({ count: donations.length, donations });
}

// POST /api/donations   - log a donation made outside the app (blood bank, camp...)
export async function createDonation(req, res) {
  const donation = await Donation.create({ ...pick(req.body, FIELDS), donor: req.user._id, verified: false });
  await recomputeDonorStats(req.user._id);
  res.status(201).json({ donation });
}

// PUT /api/donations/:id
export async function updateDonation(req, res) {
  const donation = await findOwnDonation(req.params.id, req.user);
  donation.set(pick(req.body, FIELDS));
  await donation.save();
  await recomputeDonorStats(req.user._id);
  res.json({ donation });
}

// DELETE /api/donations/:id
export async function deleteDonation(req, res) {
  const donation = await findOwnDonation(req.params.id, req.user);
  await donation.deleteOne();
  await recomputeDonorStats(req.user._id);
  res.json({ message: 'Donation removed' });
}
