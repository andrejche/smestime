import { Router } from 'express';
import { body } from 'express-validator';
import { createBooking, getBooking, updateBookingStatus } from '../controllers/booking.controller.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.post('/', [
  body('propertyId').isUUID(),
  body('checkIn').isDate(),
  body('checkOut').isDate(),
  body('guests').isInt({ min: 1 }),
  body('guestName').trim().notEmpty(),
  body('guestEmail').isEmail().normalizeEmail(),
  body('guestPhone').trim().notEmpty(),
  validate,
], createBooking);

router.get('/:id', getBooking);
router.patch('/:id/status', updateBookingStatus);

export default router;
