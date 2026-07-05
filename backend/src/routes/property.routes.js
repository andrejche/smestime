import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProperties, getProperty, getCities,
  createPublicProperty, uploadImagesPublic,
  getAdminProperties, approveProperty, deleteProperty,
} from '../controllers/property.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

// Public
router.get('/', getProperties);
router.get('/cities', getCities);
router.get('/:id', getProperty);

// Public listing submission — no auth
router.post('/public', [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('propertyType').isIn(['apartment','house','room','villa','studio','hostel']),
  body('city').trim().notEmpty(),
  body('address').trim().notEmpty(),
  body('pricePerNight').isFloat({ min: 0 }),
  body('maxGuests').isInt({ min: 1 }),
  body('ownerName').trim().notEmpty(),
  body('ownerPhone').trim().notEmpty(),
  body('ownerEmail').isEmail(),
  validate,
], createPublicProperty);

router.post('/:id/images/public', upload.array('images', 20), uploadImagesPublic);

// Admin only
router.get('/admin/all', authenticate, authorize('admin'), getAdminProperties);
router.patch('/:id/approve', authenticate, authorize('admin'), approveProperty);
router.delete('/:id', authenticate, authorize('admin'), deleteProperty);

export default router;
