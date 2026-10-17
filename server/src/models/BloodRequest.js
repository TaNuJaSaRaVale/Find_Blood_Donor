import mongoose from 'mongoose';
import { pointSchema } from './pointSchema.js';
import { BLOOD_GROUPS } from '../utils/bloodCompatibility.js';

/** How long an OPEN request stays alive before MongoDB's TTL index deletes it. */
export const EXPIRY_HOURS = { critical: 24, urgent: 72, normal: 168 };

/** Radius (km) used to alert donors when a request is created. */
export const ALERT_RADIUS_KM = { critical: 25, urgent: 15, normal: 10 };

/**
 * Donor responses are EMBEDDED inside the request (not a separate collection)
 * because they are always read together with the request and stay small.
 */
const responseSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pledged', 'donated', 'withdrawn'], default: 'pledged' },
    respondedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, required: [true, 'Patient name is required'], trim: true, maxlength: 60 },
    bloodGroup: { type: String, enum: { values: BLOOD_GROUPS, message: 'Invalid blood group' }, required: [true, 'Blood group is required'] },
    unitsNeeded: { type: Number, required: [true, 'Units needed is required'], min: [1, 'At least 1 unit'], max: [10, 'At most 10 units'] },
    hospital: { type: String, required: [true, 'Hospital is required'], trim: true, maxlength: 120 },
    city: { type: String, required: [true, 'City is required'], trim: true },
    location: { type: pointSchema, required: [true, 'Location is required'] },
    urgency: { type: String, enum: ['critical', 'urgent', 'normal'], default: 'urgent' },
    contactPhone: { type: String, required: [true, 'Contact phone is required'], match: [/^\+?\d{10,13}$/, 'Phone must be 10-13 digits'] },
    requiredBy: { type: Date },
    note: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ['open', 'fulfilled', 'cancelled'], default: 'open' },
    responses: { type: [responseSchema], default: [] },
    notifiedCount: { type: Number, default: 0 },
    // Only OPEN requests have expiresAt. Closed requests unset it, so they are kept as history.
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ status: 1, bloodGroup: 1 });
bloodRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

bloodRequestSchema.methods.countResponses = function countResponses(status) {
  return this.responses.filter((r) => r.status === status).length;
};

bloodRequestSchema.methods.refreshExpiry = function refreshExpiry() {
  this.expiresAt = this.status === 'open'
    ? new Date(Date.now() + EXPIRY_HOURS[this.urgency] * 60 * 60 * 1000)
    : undefined;
};

export const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
