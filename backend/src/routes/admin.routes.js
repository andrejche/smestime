import { Router } from 'express';
import {
  getAdminStats, getAdminProperties, getPropertyImages, approveProperty,
  deleteProperty, getAdminUsers, toggleUserActive, getAdminBookings,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/properties', getAdminProperties);
router.get('/properties/:id/images', getPropertyImages);
router.patch('/properties/:id/approve', approveProperty);
router.delete('/properties/:id', deleteProperty);
router.get('/users', getAdminUsers);
router.patch('/users/:id/toggle', toggleUserActive);
router.get('/bookings', getAdminBookings);

export default router;
