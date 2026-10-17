import mongoose from 'mongoose';

const THIRTY_DAYS = 30 * 24 * 60 * 60;

/** In-app notifications. A TTL index deletes them automatically after 30 days. */
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['request', 'pledge', 'donation', 'camp', 'system'], default: 'system' },
    title: { type: String, required: true, maxlength: 120 },
    message: { type: String, maxlength: 400 },
    link: { type: String }, // frontend route to open, e.g. /requests/<id>
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: THIRTY_DAYS });

export const Notification = mongoose.model('Notification', notificationSchema);
