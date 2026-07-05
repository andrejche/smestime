import { Router } from 'express';
import {
  getAnalytics, getAdminProperties, approveProperty, deleteAdminProperty,
  getAdminBookings, updateBookingStatus, getAdminUsers,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/properties', getAdminProperties);
router.patch('/properties/:id/approve', approveProperty);
router.delete('/properties/:id', deleteAdminProperty);
router.get('/bookings', getAdminBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.get('/users', getAdminUsers);

export default router;