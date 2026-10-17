import { User } from '../models/index.js';
import { signToken } from '../middleware/auth.js';
import { HttpError, pick } from '../utils/httpError.js';
import { toPoint } from '../utils/geo.js';
import { notify } from '../services/notify.js';

const REGISTER_FIELDS = ['name', 'email', 'password', 'phone', 'gender', 'dateOfBirth', 'weight', 'bloodGroup', 'isDonor', 'city', 'address', 'lastDonationDate'];

// POST /api/auth/register
export async function register(req, res) {
  const data = pick(req.body, REGISTER_FIELDS);
  data.location = toPoint(req.body.lat, req.body.lng);

  const user = await User.create(data);
  await notify(user._id, {
    type: 'system',
    title: `Welcome to RaktSetu, ${user.name.split(' ')[0]}! 🩸`,
    message: 'Your Donor Passport is ready. Keep your availability updated so we can alert you when someone nearby needs your blood group.',
    link: '/passport',
  });
  res.status(201).json({ token: signToken(user._id), user });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new HttpError(401, 'Invalid email or password');

  res.json({ token: signToken(user._id), user });
}

// GET /api/auth/me
export function me(req, res) {
  res.json({ user: req.user });
}
