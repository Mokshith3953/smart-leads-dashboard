import { Router } from 'express';
import { body } from 'express-validator';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/leadsController';
import { protect, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(protect);

const leadBodyValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Lost']).withMessage('Invalid status'),
  body('source').isIn(['Website', 'Instagram', 'Referral']).withMessage('Invalid source'),
];

router.get('/', getLeads);
router.get('/export', exportLeadsCSV);
router.get('/stats', requireAdmin, getLeadStats);
router.get('/:id', getLead);
router.post('/', leadBodyValidation, validate, createLead);
router.put('/:id', leadBodyValidation, validate, updateLead);
router.delete('/:id', deleteLead);

export default router;
