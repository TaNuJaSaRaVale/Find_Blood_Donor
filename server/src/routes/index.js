import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect, optionalAuth } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as users from '../controllers/userController.js';
import * as donors from '../controllers/donorController.js';
import * as requests from '../controllers/requestController.js';
import * as donations from '../controllers/donationController.js';
import * as camps from '../controllers/campController.js';
import * as notifications from '../controllers/notificationController.js';
import * as stats from '../controllers/statsController.js';

const router = Router();

// Max 30 login/register attempts per 15 minutes per IP (stops password guessing)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, message: { message: 'Too many attempts, try again in 15 minutes' } });

// ---------- Auth ----------
router.post('/auth/register', authLimiter, auth.register);
router.post('/auth/login', authLimiter, auth.login);
router.get('/auth/me', protect, auth.me);

// ---------- My profile & Donor Passport ----------
router.put('/users/me', protect, users.updateMe);
router.patch('/users/me/availability', protect, users.setAvailability);
router.patch('/users/me/password', protect, users.changePassword);
router.delete('/users/me', protect, users.deleteMe);
router.get('/users/me/passport', protect, users.passport);

// ---------- Donor search ----------
router.get('/donors/search', optionalAuth, donors.searchDonors);
router.get('/donors/compatibility', donors.compatibility);

// ---------- Blood requests ----------
router.get('/requests', optionalAuth, requests.listRequests);
router.post('/requests', protect, requests.createRequest);
router.get('/requests/for-me', protect, requests.requestsForMe);
router.get('/requests/:id', optionalAuth, requests.getRequest);
router.put('/requests/:id', protect, requests.updateRequest);
router.patch('/requests/:id/status', protect, requests.updateStatus);
router.delete('/requests/:id', protect, requests.deleteRequest);
router.post('/requests/:id/respond', protect, requests.respond);
router.post('/requests/:id/confirm/:donorId', protect, requests.confirmDonation);

// ---------- Donation history ----------
router.get('/donations/me', protect, donations.myDonations);
router.post('/donations', protect, donations.createDonation);
router.put('/donations/:id', protect, donations.updateDonation);
router.delete('/donations/:id', protect, donations.deleteDonation);

// ---------- Donation camps ----------
router.get('/camps', optionalAuth, camps.listCamps);
router.post('/camps', protect, camps.createCamp);
router.get('/camps/:id', optionalAuth, camps.getCamp);
router.put('/camps/:id', protect, camps.updateCamp);
router.delete('/camps/:id', protect, camps.deleteCamp);
router.post('/camps/:id/register', protect, camps.registerForCamp);
router.delete('/camps/:id/register', protect, camps.unregisterFromCamp);

// ---------- Notifications ----------
router.get('/notifications', protect, notifications.listNotifications);
router.get('/notifications/unread-count', protect, notifications.unreadCount);
router.patch('/notifications/read-all', protect, notifications.markAllRead);
router.patch('/notifications/:id/read', protect, notifications.markRead);
router.delete('/notifications/:id', protect, notifications.deleteNotification);

// ---------- Insights ----------
router.get('/stats/overview', stats.overview);
router.get('/stats/shortage', stats.shortage);

export default router;
