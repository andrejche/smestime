import { Router } from 'express';
import { body } from 'express-validator';
import {
  getMyListings, getMyListing, createListing, updateListing, deleteListing,
  uploadImages, deleteImage, getMyBookings, updateBookingStatus,
  getProfile, updateProfile, renewListing,
} from '../controllers/owner.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = Router();
router.use(authenticate, authorize('owner', 'admin'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/listings', getMyListings);
router.get('/listings/:id', getMyListing);
router.post('/listings', [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('propertyType').isIn(['apartment','house','room','villa','studio','hostel','office','shop','other']),
  body('city').trim().notEmpty(),
  body('address').trim().notEmpty(),
  body('pricePerNight').isFloat({ min: 0 }),
  body('maxGuests').isInt({ min: 1 }),
  validate,
], createListing);
router.put('/listings/:id', updateListing);
router.delete('/listings/:id', deleteListing);
router.post('/listings/:id/renew', renewListing);
router.post('/listings/:id/images', upload.array('images', 20), uploadImages);
router.delete('/listings/:id/images/:imageId', deleteImage);

router.get('/bookings', getMyBookings);
router.patch('/bookings/:id/status', [
  body('status').isIn(['confirmed','cancelled','completed']),
  validate,
], updateBookingStatus);

export default router;
