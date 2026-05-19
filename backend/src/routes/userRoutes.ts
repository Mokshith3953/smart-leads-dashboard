import { Router, Response } from 'express';
import User from '../models/User';
import { protect, requireAdmin } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.use(protect, requireAdmin);

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find().select('-password').lean();
  res.json({ success: true, data: users });
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, message: 'User deleted' });
});

export default router;
