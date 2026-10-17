/**
 * Fills the database with realistic demo data around Sangli / Miraj / Kolhapur.
 *   npm run seed
 * ⚠️ It DELETES all existing RaktSetu data first.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { User, BloodRequest, Donation, Camp, Notification } from '../models/index.js';
import { EXPIRY_HOURS } from '../models/BloodRequest.js';

const CITIES = [
  { city: 'Sangli', lat: 16.8524, lng: 74.5815, weight: 30 },
  { city: 'Miraj', lat: 16.8222, lng: 74.645, weight: 18 },
  { city: 'Kolhapur', lat: 16.705, lng: 74.2433, weight: 18 },
  { city: 'Islampur', lat: 17.05, lng: 74.2667, weight: 8 },
  { city: 'Karad', lat: 17.289, lng: 74.1817, weight: 8 },
  { city: 'Satara', lat: 17.6805, lng: 74.0183, weight: 8 },
  { city: 'Pune', lat: 18.5204, lng: 73.8567, weight: 10 },
];

// Approximate blood-group distribution in India
const GROUP_WEIGHTS = { 'B+': 32, 'O+': 29, 'A+': 21, 'AB+': 8, 'O-': 3, 'B-': 3, 'A-': 2, 'AB-': 1 };

const FIRST_M = ['Aarav', 'Vivaan', 'Aditya', 'Sai', 'Arjun', 'Rohan', 'Omkar', 'Pranav', 'Sahil', 'Yash', 'Tejas', 'Kunal', 'Siddharth', 'Nikhil', 'Rahul', 'Akash', 'Vishal', 'Ganesh'];
const FIRST_F = ['Ananya', 'Diya', 'Sneha', 'Pooja', 'Shruti', 'Rutuja', 'Sakshi', 'Neha', 'Priya', 'Aishwarya', 'Komal', 'Snehal', 'Tanvi', 'Gauri', 'Mrunal'];
const LAST = ['Patil', 'Kulkarni', 'Jadhav', 'Pawar', 'Deshmukh', 'Shinde', 'Joshi', 'Chavan', 'Kale', 'Mane', 'More', 'Desai', 'Salunkhe', 'Gaikwad', 'Bhosale'];
const HOSPITALS = {
  Sangli: ['Bharati Hospital', 'Civil Hospital Sangli', 'Wanless Hospital'],
  Miraj: ['Government Medical College Miraj', 'Mission Hospital Miraj'],
  Kolhapur: ['CPR Hospital', 'Aster Aadhar Hospital'],
  Pune: ['Sassoon General Hospital', 'Ruby Hall Clinic'],
};

let seed = 42; // deterministic random numbers → same demo data every time
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pickOne = (arr) => arr[Math.floor(rand() * arr.length)];
const weighted = (entries) => {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [value, w] of entries) if ((r -= w) <= 0) return value;
  return entries[0][0];
};
const jitter = (value, km) => value + (rand() - 0.5) * 2 * (km / 111);
const daysAgo = (days) => new Date(Date.now() - days * 86_400_000);
const daysFromNow = (days) => new Date(Date.now() + days * 86_400_000);
const point = (lat, lng) => ({ type: 'Point', coordinates: [lng, lat] });
const phone = () => `9${String(Math.floor(rand() * 1e9)).padStart(9, '0')}`;

async function run() {
  await connectDB(env.MONGO_URI);
  console.log('🧹 Clearing old data...');
  await Promise.all([User, BloodRequest, Donation, Camp, Notification].map((m) => m.deleteMany({})));

  const password = await bcrypt.hash('password123', 10);
  const demoPassword = await bcrypt.hash('demo1234', 10);
  const cityEntries = CITIES.map((c) => [c, c.weight]);
  const groupEntries = Object.entries(GROUP_WEIGHTS);

  // ---------- Users ----------
  const users = [
    {
      name: 'Demo Donor', email: 'demo@raktsetu.in', password: demoPassword, phone: '9876543210', gender: 'male',
      dateOfBirth: new Date('2003-05-14'), weight: 68, bloodGroup: 'O+', city: 'Sangli', address: 'Walchand College of Engineering',
      location: point(16.8457, 74.6014), lastDonationDate: daysAgo(130), donationsCount: 3, reliabilityScore: 72,
    },
    {
      name: 'Priya Kulkarni', email: 'priya@raktsetu.in', password: demoPassword, phone: '9822001122', gender: 'female',
      dateOfBirth: new Date('1998-11-02'), weight: 55, bloodGroup: 'A+', city: 'Sangli', address: 'Vishrambag',
      location: point(16.8402, 74.6105), lastDonationDate: null, donationsCount: 0, reliabilityScore: 50,
    },
    {
      name: 'Rare Donor (Bombay)', email: 'rare@raktsetu.in', password: demoPassword, phone: '9800011111', gender: 'male',
      dateOfBirth: new Date('1990-01-20'), weight: 74, bloodGroup: 'hh', city: 'Miraj', address: 'Miraj',
      location: point(16.8251, 74.641), lastDonationDate: daysAgo(200), donationsCount: 4, reliabilityScore: 90,
    },
  ];

  for (let i = 0; i < 70; i += 1) {
    const gender = rand() < 0.6 ? 'male' : 'female';
    const c = weighted(cityEntries);
    const donated = rand() < 0.65;
    users.push({
      name: `${pickOne(gender === 'male' ? FIRST_M : FIRST_F)} ${pickOne(LAST)}`,
      email: `donor${i + 1}@raktsetu.in`,
      password,
      phone: phone(),
      gender,
      dateOfBirth: new Date(1970 + Math.floor(rand() * 35), Math.floor(rand() * 12), 1 + Math.floor(rand() * 27)),
      weight: 50 + Math.floor(rand() * 35),
      bloodGroup: weighted(groupEntries),
      city: c.city,
      location: point(jitter(c.lat, 4), jitter(c.lng, 4)),
      isDonor: rand() < 0.92,
      available: rand() < 0.88,
      lastDonationDate: donated ? daysAgo(10 + Math.floor(rand() * 400)) : null,
      donationsCount: donated ? 1 + Math.floor(rand() * 8) : 0,
      reliabilityScore: 30 + Math.floor(rand() * 70),
    });
  }
  const created = await User.insertMany(users); // insertMany skips the pre-save hash hook, so passwords are pre-hashed above
  const [demo, priya, rare] = created;
  console.log(`👥 ${created.length} users`);

  // ---------- Donations (history matching each donor's count) ----------
  const donations = [];
  for (const u of created) {
    for (let k = 0; k < u.donationsCount; k += 1) {
      // newest donation = lastDonationDate, older ones every ~4-6 months before it
      const latest = u.lastDonationDate ?? daysAgo(130);
      const date = new Date(latest.getTime() - k * (120 + Math.floor(rand() * 60)) * 86_400_000);
      donations.push({ donor: u._id, date, place: pickOne(HOSPITALS[u.city] ?? ['District Blood Bank']), units: 1, verified: rand() < 0.5 });
    }
  }
  await Donation.insertMany(donations);
  console.log(`🩸 ${donations.length} donations`);

  // ---------- Blood requests ----------
  const requester = (i) => created[5 + i];
  const req = (i, data) => ({
    requester: requester(i)._id,
    contactPhone: requester(i).phone,
    status: 'open',
    expiresAt: new Date(Date.now() + EXPIRY_HOURS[data.urgency] * 3_600_000),
    ...data,
  });
  const requests = await BloodRequest.insertMany([
    req(0, { patientName: 'Ramesh Patil', bloodGroup: 'O-', unitsNeeded: 2, hospital: 'Bharati Hospital', city: 'Sangli', location: point(16.8615, 74.5795), urgency: 'critical', note: 'Accident case, surgery tonight.' }),
    req(1, { patientName: 'Sunita Jadhav', bloodGroup: 'B+', unitsNeeded: 3, hospital: 'Government Medical College Miraj', city: 'Miraj', location: point(16.8189, 74.6467), urgency: 'urgent', note: 'Thalassemia patient, regular transfusion.' }),
    req(2, { patientName: 'Baby of Kavita More', bloodGroup: 'A+', unitsNeeded: 1, hospital: 'Wanless Hospital', city: 'Sangli', location: point(16.8299, 74.6372), urgency: 'urgent' }),
    req(3, { patientName: 'Vijay Shinde', bloodGroup: 'AB-', unitsNeeded: 2, hospital: 'CPR Hospital', city: 'Kolhapur', location: point(16.7016, 74.2397), urgency: 'critical', note: 'Rare group - please share!' }),
    req(4, { patientName: 'Meena Desai', bloodGroup: 'O+', unitsNeeded: 4, hospital: 'Civil Hospital Sangli', city: 'Sangli', location: point(16.8556, 74.5719), urgency: 'normal', note: 'Planned surgery next week.', requiredBy: daysFromNow(6) }),
    req(5, { patientName: 'Kiran Pawar', bloodGroup: 'hh', unitsNeeded: 1, hospital: 'Mission Hospital Miraj', city: 'Miraj', location: point(16.8172, 74.6533), urgency: 'urgent', note: 'Bombay blood group patient.' }),
    { ...req(6, { patientName: 'Anil Kale', bloodGroup: 'B+', unitsNeeded: 1, hospital: 'Ruby Hall Clinic', city: 'Pune', location: point(18.5314, 73.8768), urgency: 'normal' }), status: 'fulfilled', expiresAt: undefined, responses: [{ donor: demo._id, status: 'donated', respondedAt: daysAgo(130) }] },
    // Priya's own request so the demo login shows the "requester" view too
    req(0, { requester: priya._id, contactPhone: priya.phone, patientName: 'Sharad Kulkarni', bloodGroup: 'A+', unitsNeeded: 2, hospital: 'Bharati Hospital', city: 'Sangli', location: point(16.8615, 74.5795), urgency: 'urgent', note: 'Father - knee replacement surgery.', responses: [{ donor: demo._id, status: 'pledged' }] }),
  ]);
  console.log(`📋 ${requests.length} blood requests`);

  // ---------- Camps ----------
  const camps = await Camp.insertMany([
    { name: 'WCE NSS Mega Blood Donation Camp', organizer: demo._id, description: 'Annual camp by NSS unit, Walchand College of Engineering. Refreshments + certificate for every donor.', date: daysFromNow(5), venue: 'WCE Main Auditorium', city: 'Sangli', location: point(16.8457, 74.6014), capacity: 150, registeredCount: 2, participants: [priya._id, rare._id], contactPhone: demo.phone },
    { name: 'Rotary Club Blood Drive', organizer: created[10]._id, description: 'Walk-in camp in association with the District Blood Bank.', date: daysFromNow(12), venue: 'Rotary Bhavan', city: 'Miraj', location: point(16.8274, 74.6412), capacity: 80, registeredCount: 0, participants: [] },
    { name: 'Rajarshi Shahu Jayanti Camp', organizer: created[11]._id, date: daysFromNow(20), venue: 'Shahu Smarak Bhavan', city: 'Kolhapur', location: point(16.7019, 74.2433), capacity: 2, registeredCount: 2, participants: [created[12]._id, created[13]._id], description: 'Small camp - almost full, try booking to see the "full" check.' },
    { name: 'Independence Day Camp', organizer: created[14]._id, date: daysAgo(60), venue: 'Town Hall', city: 'Sangli', location: point(16.8571, 74.5639), capacity: 100, registeredCount: 64, participants: [] },
  ]);
  console.log(`🏕️  ${camps.length} camps`);

  await Notification.insertMany([
    { user: demo._id, type: 'system', title: 'Welcome to RaktSetu 🩸', message: 'Your Donor Passport is ready.', link: '/passport', createdAt: daysAgo(2) },
    { user: demo._id, type: 'request', title: '🚨 O− blood needed at Bharati Hospital', message: '2 unit(s) needed for Ramesh Patil in Sangli. O+ cannot help O− patients, but please share!', link: `/requests/${requests[0]._id}` },
    { user: priya._id, type: 'pledge', title: '🙌 Demo Donor pledged to donate for Sharad Kulkarni', message: 'O+ donor from Sangli (O+ can donate to A+). Open the request to confirm after donation.', link: `/requests/${requests[7]._id}` },
  ]);

  console.log('\n✅ Seed complete. Demo logins:');
  console.log('   demo@raktsetu.in  / demo1234   (O+ donor, organizer of a camp)');
  console.log('   priya@raktsetu.in / demo1234   (has an open request with a pledge)');
  console.log('   rare@raktsetu.in  / demo1234   (Bombay blood group donor)');
  console.log('   donor1..donor70@raktsetu.in / password123');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('❌ Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
