import { Notification, User } from '../models/index.js';

/** Sends the same notification to many users with ONE insertMany call. */
export async function notifyMany(userIds, { type, title, message, link }) {
  if (!userIds.length) return 0;
  const docs = userIds.map((user) => ({ user, type, title, message, link }));
  await Notification.insertMany(docs);
  return docs.length;
}

export const notify = (userId, payload) => notifyMany([userId], payload);

/**
 * Adds `delta` to a user's reliability score but keeps it between 0 and 100.
 * Uses an aggregation-pipeline update so the clamp happens atomically inside MongoDB.
 */
export function adjustReliability(userId, delta) {
  return User.updateOne({ _id: userId }, [
    { $set: { reliabilityScore: { $min: [100, { $max: [0, { $add: ['$reliabilityScore', delta] }] }] } } },
  ]);
}
