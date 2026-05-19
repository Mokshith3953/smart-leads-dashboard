import { Response } from 'express';
import Lead from '../models/Lead';
import { AuthRequest, LeadQueryParams, LeadStatus, LeadSource, SortOrder } from '../types';

const PAGE_LIMIT = 10;

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, source, search, sort = 'latest', page = '1', limit = String(PAGE_LIMIT) } = req.query as LeadQueryParams;

  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (source) filter.source = source;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const sortOrder = sort === 'oldest' ? 1 : -1;

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: leads,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
};

export const getLead = async (req: AuthRequest, res: Response): Promise<void> => {
  const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email role').lean();
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }
  res.json({ success: true, data: lead });
};

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, status, source } = req.body as {
    name: string;
    email: string;
    status: LeadStatus;
    source: LeadSource;
  };

  const lead = await Lead.create({ name, email, status, source, createdBy: req.user!.id });
  const populated = await lead.populate('createdBy', 'name email role');

  res.status(201).json({ success: true, message: 'Lead created', data: populated });
};

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  const isAdmin = req.user?.role === 'admin';
  const isOwner = lead.createdBy.toString() === req.user?.id;

  if (!isAdmin && !isOwner) {
    res.status(403).json({ success: false, message: 'Not authorized to update this lead' });
    return;
  }

  const updated = await Lead.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true })
    .populate('createdBy', 'name email role')
    .lean();

  res.json({ success: true, message: 'Lead updated', data: updated });
};

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  const isAdmin = req.user?.role === 'admin';
  const isOwner = lead.createdBy.toString() === req.user?.id;

  if (!isAdmin && !isOwner) {
    res.status(403).json({ success: false, message: 'Not authorized to delete this lead' });
    return;
  }

  await lead.deleteOne();
  res.json({ success: true, message: 'Lead deleted' });
};

export const exportLeadsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, source, search } = req.query as LeadQueryParams;
  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (source) filter.source = source;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const leads = await Lead.find(filter).populate('createdBy', 'name').sort({ createdAt: -1 }).lean();

  const header = 'Name,Email,Status,Source,Created At\n';
  const rows = leads
    .map((l) => `"${l.name}","${l.email}","${l.status}","${l.source}","${new Date(l.createdAt).toISOString()}"`)
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
  res.send(header + rows);
};

export const getLeadStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [statusStats, sourceStats, total] = await Promise.all([
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
    Lead.countDocuments(),
  ]);

  res.json({
    success: true,
    data: {
      total,
      byStatus: Object.fromEntries(statusStats.map((s) => [s._id, s.count])),
      bySource: Object.fromEntries(sourceStats.map((s) => [s._id, s.count])),
    },
  });
};
