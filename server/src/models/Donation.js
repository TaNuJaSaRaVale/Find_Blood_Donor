import mongoose from 'mongoose';

/**
 * One row per donation. Stored in its OWN collection (referencing the donor)
 * because a donor's history grows forever and is queried on its own for stats.
 */
const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', default: null },
    date: {
      type: Date,
      required: [true, 'Donation date is required'],
      validate: { validator: (d) => d <= new Date(), message: 'Donation date cannot be in the future' },
    },
    place: { type: String, required: [true, 'Place is required'], trim: true, maxlength: 120 },
    units: { type: Number, default: 1, min: 1, max: 3 },
    // true = confirmed by the patient's family through the app; false = self-reported
    verified: { type: Boolean, default: false },
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true },
);

donationSchema.index({ donor: 1, date: -1 });
donationSchema.index({ date: -1 });

export const Donation = mongoose.model('Donation', donationSchema);
