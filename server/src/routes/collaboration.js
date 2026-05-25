import express from 'express';
import { z } from 'zod';
import CollaborationRequest from '../models/CollaborationRequest.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const createSchema = z.object({
  body: z.object({
    investorId: z.string().min(1),
    entrepreneurId: z.string().min(1),
    message: z.string().min(5)
  })
});

const updateSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'accepted', 'rejected'])
  })
});

router.get('/entrepreneur/:id', requireAuth, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const requests = await CollaborationRequest.find({ entrepreneurId: req.params.id })
    .sort({ createdAt: -1 });
  res.json({ requests });
});

router.get('/investor/:id', requireAuth, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const requests = await CollaborationRequest.find({ investorId: req.params.id })
    .sort({ createdAt: -1 });
  res.json({ requests });
});

router.post('/', requireAuth, validate(createSchema), async (req, res) => {
  const { investorId, entrepreneurId, message } = req.validated.body;

  if (req.user.role !== 'investor') {
    return res.status(403).json({ error: 'Only investors can send requests' });
  }

  if (req.user.id !== investorId) {
    return res.status(403).json({ error: 'Cannot create request for another user' });
  }

  const investor = await User.findById(investorId);
  const entrepreneur = await User.findById(entrepreneurId);
  if (!investor || !entrepreneur) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (investor.role !== 'investor' || entrepreneur.role !== 'entrepreneur') {
    return res.status(400).json({ error: 'Invalid collaboration roles' });
  }

  const existing = await CollaborationRequest.findOne({
    investorId,
    entrepreneurId,
    status: 'pending'
  });
  if (existing) {
    return res.status(409).json({ error: 'Request already sent' });
  }

  const request = await CollaborationRequest.create({ investorId, entrepreneurId, message });
  res.status(201).json({ request });
});

router.patch('/:id/status', requireAuth, validate(updateSchema), async (req, res) => {
  const { status } = req.validated.body;
  const request = await CollaborationRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (request.entrepreneurId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Only the entrepreneur can update this request' });
  }

  if (req.user.role !== 'entrepreneur') {
    return res.status(403).json({ error: 'Only entrepreneurs can update requests' });
  }

  request.status = status;
  await request.save();

  res.json({ request });
});

export default router;
