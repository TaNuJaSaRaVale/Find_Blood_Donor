import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

const app = createApp(); // importing the app also registers all Mongoose models

try {
  await connectDB(env.MONGO_URI);
} catch (err) {
  console.error('❌ Could not connect to MongoDB:', err.message);
  console.error('   • Local MongoDB: is the service running? (sudo systemctl start mongod)');
  console.error('   • Atlas: is your IP allowed in "Network Access" and the password correct?');
  console.error('   • Check MONGO_URI in server/.env');
  process.exit(1);
}

app.listen(env.PORT, () => {
  console.log(`🚀 RaktSetu API running at http://localhost:${env.PORT}/api`);
});
