import mongoose from 'mongoose';

/**
 * Reusable GeoJSON Point sub-document: { type: 'Point', coordinates: [lng, lat] }.
 * Any field using it gets a 2dsphere index in its model so we can run
 * $near / $geoNear distance queries.
 */
export const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (c) => c.length === 2 && Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90,
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
  },
  { _id: false },
);
