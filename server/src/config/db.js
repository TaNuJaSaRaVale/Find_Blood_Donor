import mongoose from 'mongoose';

/**
 * Connects to MongoDB and makes sure every index declared in the models
 * (2dsphere, TTL, unique...) exists before the API starts serving requests.
 * Geo queries ($near, $geoNear) FAIL without their 2dsphere index.
 */
export async function connectDB(uri) {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('🔁 MongoDB reconnected'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));

  const { host, name } = mongoose.connection;
  console.log(`✅ MongoDB connected → ${host}/${name}`);
}
