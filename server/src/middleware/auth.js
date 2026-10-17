import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { HttpError } from '../utils/httpError.js';

export const signToken = (userId) =>
  jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

async function userFromHeader(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const { id } = jwt.verify(header.slice(7), env.JWT_SECRET);
    return await User.findById(id);
  } catch {
    return null;
  }
}

/** Route requires a logged-in user: sets req.user or responds 401. */
export async function protect(req, _res, next) {
  const user = await userFromHeader(req);
  if (!user) throw new HttpError(401, 'Please log in to continue');
  req.user = user;
  next();
}

/** Route works for everyone, but knows who you are if you are logged in. */
export async function optionalAuth(req, _res, next) {
  req.user = await userFromHeader(req);
  next();
}
