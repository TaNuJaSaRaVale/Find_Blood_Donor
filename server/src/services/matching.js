import mongoose from 'mongoose';
import { User } from '../models/index.js';
import { donorGroupsFor } from '../utils/bloodCompatibility.js';
import { eligibleDonorFilter } from '../utils/eligibility.js';

/**
 * ⭐ The heart of RaktSetu - one aggregation pipeline that:
 *   1. $geoNear   → finds donors within the radius, nearest first (uses the 2dsphere index)
 *   2. query      → keeps only COMPATIBLE groups and donors ELIGIBLE today
 *   3. $addFields → computes a Match Score (distance 50 + reliability 30 + exact group 20)
 *   4. $sort / $limit / $project → best matches first, private fields hidden
 */
export async function findMatchingDonors({ point, bloodGroup, radiusKm = 10, mode = 'compatible', excludeUserId, limit = 50 }) {
  const groups = mode === 'exact' ? [bloodGroup] : donorGroupsFor(bloodGroup);
  const maxDistance = radiusKm * 1000;

  const query = { ...eligibleDonorFilter(), bloodGroup: { $in: groups } };
  if (excludeUserId) query._id = { $ne: new mongoose.Types.ObjectId(String(excludeUserId)) };

  return User.aggregate([
    {
      $geoNear: {
        near: point,
        distanceField: 'distance',
        maxDistance,
        spherical: true,
        query,
      },
    },
    {
      $addFields: {
        distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 1] },
        exactMatch: { $eq: ['$bloodGroup', bloodGroup] },
      },
    },
    {
      $addFields: {
        matchScore: {
          $round: [
            {
              $add: [
                { $multiply: [{ $max: [0, { $subtract: [1, { $divide: ['$distance', maxDistance] }] }] }, 50] },
                { $multiply: ['$reliabilityScore', 0.3] },
                { $cond: ['$exactMatch', 20, 0] },
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { matchScore: -1, distance: 1 } },
    { $limit: limit },
    // Privacy-first: phone & email are NEVER returned in search results
    {
      $project: {
        name: 1, bloodGroup: 1, city: 1, gender: 1, donationsCount: 1, reliabilityScore: 1,
        location: 1, distanceKm: 1, exactMatch: 1, matchScore: 1, lastDonationDate: 1,
      },
    },
  ]);
}
