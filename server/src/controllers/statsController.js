import { User, BloodRequest, Donation } from '../models/index.js';
import { BLOOD_GROUPS, donorGroupsFor } from '../utils/bloodCompatibility.js';
import { eligibleDonorFilter } from '../utils/eligibility.js';
import { LIVES_PER_UNIT } from '../utils/gamification.js';

const exactCity = (city) => new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

// GET /api/stats/overview   - numbers + charts for the Insights page
export async function overview(_req, res) {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11, 1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [[userFacets], eligibleNow, requestsByStatus, donationTotals, donationsByMonth] = await Promise.all([
    // $facet = run several aggregations over the same collection in ONE query
    User.aggregate([
      {
        $facet: {
          totals: [{ $group: { _id: null, users: { $sum: 1 }, donors: { $sum: { $cond: ['$isDonor', 1, 0] } } } }],
          byGroup: [{ $match: { isDonor: true } }, { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }, { $sort: { _id: 1 } }],
          byCity: [{ $match: { isDonor: true } }, { $group: { _id: '$city', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }],
        },
      },
    ]),
    User.countDocuments(eligibleDonorFilter()),
    BloodRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, units: { $sum: '$unitsNeeded' } } }]),
    Donation.aggregate([{ $group: { _id: null, donations: { $sum: 1 }, units: { $sum: '$units' } } }]),
    Donation.aggregate([
      { $match: { date: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, donations: { $sum: 1 }, units: { $sum: '$units' } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const units = donationTotals[0]?.units ?? 0;
  const statusMap = Object.fromEntries(requestsByStatus.map((s) => [s._id, s.count]));
  res.json({
    totals: {
      users: userFacets.totals[0]?.users ?? 0,
      donors: userFacets.totals[0]?.donors ?? 0,
      eligibleNow,
      openRequests: statusMap.open ?? 0,
      fulfilledRequests: statusMap.fulfilled ?? 0,
      donations: donationTotals[0]?.donations ?? 0,
      livesSaved: units * LIVES_PER_UNIT,
    },
    donorsByGroup: userFacets.byGroup.map((g) => ({ group: g._id, count: g.count })),
    donorsByCity: userFacets.byCity.map((c) => ({ city: c._id, count: c.count })),
    requestsByStatus: requestsByStatus.map((s) => ({ status: s._id, count: s.count })),
    donationsByMonth: donationsByMonth.map((m) => ({ month: m._id, donations: m.donations, units: m.units })),
  });
}

/**
 * GET /api/stats/shortage?city=Sangli
 * ⭐ Shortage Radar: compares DEMAND (units in open requests) with SUPPLY
 * (donors who can donate TODAY, counting every compatible group) for each blood group.
 */
export async function shortage(req, res) {
  const city = req.query.city?.trim();
  const cityFilter = city ? { city: exactCity(city) } : {};

  const [demand, supply, cities] = await Promise.all([
    BloodRequest.aggregate([
      { $match: { status: 'open', ...cityFilter } },
      { $group: { _id: '$bloodGroup', units: { $sum: '$unitsNeeded' }, requests: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { ...eligibleDonorFilter(), ...cityFilter } },
      { $group: { _id: '$bloodGroup', donors: { $sum: 1 } } },
    ]),
    User.distinct('city'),
  ]);

  const demandMap = Object.fromEntries(demand.map((d) => [d._id, d]));
  const supplyMap = Object.fromEntries(supply.map((s) => [s._id, s.donors]));

  const groups = BLOOD_GROUPS.map((group) => {
    const unitsNeeded = demandMap[group]?.units ?? 0;
    const exactDonors = supplyMap[group] ?? 0;
    const compatibleDonors = donorGroupsFor(group).reduce((sum, g) => sum + (supplyMap[g] ?? 0), 0);
    const ratio = compatibleDonors ? unitsNeeded / compatibleDonors : unitsNeeded ? Infinity : 0;
    let level = 'healthy';
    if (unitsNeeded > 0 && ratio >= 1) level = 'critical';
    else if (unitsNeeded > 0 && ratio >= 0.4) level = 'low';
    else if (compatibleDonors < 3) level = 'watch';
    return { group, unitsNeeded, openRequests: demandMap[group]?.requests ?? 0, exactDonors, compatibleDonors, level };
  });

  res.json({ city: city || 'All cities', cities: cities.sort(), groups });
}
