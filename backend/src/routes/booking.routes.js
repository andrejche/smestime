import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBooking, getPropertyBookings,
  updateBookingStatus, getBooking, getAdminBookings,
} from '../controllers/booking.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Public — no auth
router.post('/', [
  body('propertyId').isUUID(),
  body('checkIn').isISO8601(),
  body('checkOut').isISO8601(),
  body('guests').isInt({ min: 1 }),
  body('guestName').trim().notEmpty().withMessage('Потребно е ime'),
  body('guestEmail').isEmail().normalizeEmail(),
  body('guestPhone').trim().notEmpty().withMessage('Потребен е телефон'),
  validate,
], createBooking);

// Admin only
router.get('/admin', authenticate, authorize('admin'), getAdminBookings);
router.get('/property/:propertyId', authenticate, authorize('admin'), getPropertyBookings);
router.get('/:id', authenticate, authorize('admin'), getBooking);
router.patch('/:id/status', authenticate, authorize('admin'), [
  body('status').isIn(['confirmed', 'cancelled', 'completed']),
  validate,
], updateBookingStatus);

export default router;
