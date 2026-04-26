import { Router } from 'express';
import postsRouter from './posts.js';
import ordersRouter from './orders.js';
import mediaRouter from './media.js';
import usersRouter from './users.js';
import settingsRouter from './settings.js';
import couponsRouter from './coupons.js';
import menusRouter from './menus.js';
import shippingRouter from './shipping.js';

const router = Router();

router.use('/posts', postsRouter);
router.use('/orders', ordersRouter);
router.use('/media', mediaRouter);
router.use('/users', usersRouter);
router.use('/settings', settingsRouter);
router.use('/coupons', couponsRouter);
router.use('/menus', menusRouter);
router.use('/shipping', shippingRouter);

export default router;
