import { Notification } from '../models/index.js';
import { HttpError } from '../utils/httpError.js';

// GET /api/notifications?unreadOnly=true
export async function listNotifications(req, res) {
  const filter = { user: req.user._id };
  if (req.query.unreadOnly === 'true') filter.read = false;
  const [notifications, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(50),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  res.json({ unread, notifications });
}

// GET /api/notifications/unread-count   (cheap call used by the navbar bell)
export async function unreadCount(req, res) {
  res.json({ unread: await Notification.countDocuments({ user: req.user._id, read: false }) });
}

// PATCH /api/notifications/:id/read
export async function markRead(req, res) {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
  if (!n) throw new HttpError(404, 'Notification not found');
  res.json({ notification: n });
}

// PATCH /api/notifications/read-all
export async function markAllRead(req, res) {
  const result = await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ updated: result.modifiedCount });
}

// DELETE /api/notifications/:id
export async function deleteNotification(req, res) {
  const result = await Notification.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!result.deletedCount) throw new HttpError(404, 'Notification not found');
  res.json({ message: 'Deleted' });
}
