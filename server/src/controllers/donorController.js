import { HttpError } from '../utils/httpError.js';
import { pointFromQuery, clampRadiusKm } from '../utils/geo.js';
import { BLOOD_GROUPS, donorGroupsFor, recipientGroupsFor } from '../utils/bloodCompatibility.js';
import { findMatchingDonors } from '../services/matching.js';

// GET /api/donors/search?bloodGroup=B%2B&lat=16.85&lng=74.58&radiusKm=10&mode=compatible|exact
export async function searchDonors(req, res) {
  const { bloodGroup, mode = 'compatible' } = req.query;
  if (!BLOOD_GROUPS.includes(bloodGroup)) throw new HttpError(400, 'Please choose a valid blood group');
  const point = pointFromQuery(req.query);
  if (!point) throw new HttpError(400, 'Location (lat, lng) is required to search nearby donors');

  const radiusKm = clampRadiusKm(req.query.radiusKm);
  const donors = await findMatchingDonors({
    point,
    bloodGroup,
    radiusKm,
    mode: mode === 'exact' ? 'exact' : 'compatible',
    excludeUserId: req.user?._id,
  });

  res.json({
    count: donors.length,
    radiusKm,
    searchedGroups: mode === 'exact' ? [bloodGroup] : donorGroupsFor(bloodGroup),
    donors,
  });
}

// GET /api/donors/compatibility?group=O-
export function compatibility(req, res) {
  const { group } = req.query;
  if (!BLOOD_GROUPS.includes(group)) throw new HttpError(400, 'Please choose a valid blood group');
  res.json({ group, canReceiveFrom: donorGroupsFor(group), canDonateTo: recipientGroupsFor(group) });
}
