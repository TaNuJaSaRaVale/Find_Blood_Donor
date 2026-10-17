import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { pointSchema } from './pointSchema.js';
import { BLOOD_GROUPS } from '../utils/bloodCompatibility.js';

/**
 * Every person is a User. Donors are users with isDonor = true,
 * so one account can both donate and ask for blood.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'], select: false },
    phone: { type: String, required: [true, 'Phone is required'], trim: true, match: [/^\+?\d{10,13}$/, 'Phone must be 10-13 digits'] },
    gender: { type: String, enum: ['male', 'female', 'other'], required: [true, 'Gender is required'] },
    dateOfBirth: { type: Date, required: [true, 'Date of birth is required'] },
    weight: { type: Number, min: [30, 'Weight looks too low'], max: [250, 'Weight looks too high'] },
    bloodGroup: { type: String, enum: { values: BLOOD_GROUPS, message: 'Invalid blood group' }, required: [true, 'Blood group is required'] },

    isDonor: { type: Boolean, default: true },
    available: { type: Boolean, default: true }, // donor can pause themselves (travel, illness...)
    lastDonationDate: { type: Date, default: null },
    donationsCount: { type: Number, default: 0, min: 0 },
    reliabilityScore: { type: Number, default: 50, min: 0, max: 100 },

    location: { type: pointSchema, required: [true, 'Location is required'] },
    city: { type: String, required: [true, 'City is required'], trim: true },
    address: { type: String, trim: true, maxlength: 200 },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true },
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ bloodGroup: 1, isDonor: 1, available: 1 });
userSchema.index({ city: 1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
