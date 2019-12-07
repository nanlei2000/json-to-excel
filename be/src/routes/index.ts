import { Router } from 'express';
import UserRouter from './Users';
import { ExcelRouter } from './Excel';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/excel', ExcelRouter);

// Export the base-router
export default router;
