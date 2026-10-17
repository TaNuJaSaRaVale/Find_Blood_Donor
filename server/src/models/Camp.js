import mongoose from 'mongoose';
import { pointSchema } from './pointSchema.js';

/** A blood donation camp. Participants are an embedded array of user ids. */
const campSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Camp name is required'], trim: true, maxlength: 100 },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, trim: true, maxlength: 500 },
    date: { type: Date, required: [true, 'Date is required'] },
    startTime: { type: String, default: '09:00', match: [/^\d{2}:\d{2}$/, 'Time must be HH:MM'] },
    endTime: { type: String, default: '17:00', match: [/^\d{2}:\d{2}$/, 'Time must be HH:MM'] },
    venue: { type: String, required: [true, 'Venue is required'], trim: true, maxlength: 150 },
    city: { type: String, required: [true, 'City is required'], trim: true },
    location: { type: pointSchema, required: [true, 'Location is required'] },
    capacity: { type: Number, required: [true, 'Capacity is required'], min: 1, max: 1000 },
    registeredCount: { type: Number, default: 0, min: 0 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    contactPhone: { type: String, match: [/^\+?\d{10,13}$/, 'Phone must be 10-13 digits'] },
  },
  { timestamps: true },
);

campSchema.index({ location: '2dsphere' });
campSchema.index({ date: 1 });

export const Camp = mongoose.model('Camp', campSchema);
