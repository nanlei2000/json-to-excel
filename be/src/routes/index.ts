import { Router } from 'express';
import UserRouter from './Users';
import { ExcelRouter } from './Excel';
import { MagnetRouter } from './Magnet';
import { IdiomRouter } from './Idiom';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/excel', ExcelRouter);
router.use('/magnet', MagnetRouter);
router.use('/idiom', IdiomRouter);

// Export the base-router
export default router;
