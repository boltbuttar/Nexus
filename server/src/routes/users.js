import express from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    bio: z.string().max(2000).optional(),
    avatarUrl: z.string().url().optional(),
    isOnline: z.boolean().optional(),
    location: z.string().max(120).optional(),
    startupName: z.string().max(120).optional(),
    pitchSummary: z.string().max(4000).optional(),
    fundingNeeded: z.string().max(120).optional(),
    industry: z.string().max(120).optional(),
    foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
    teamSize: z.number().int().min(1).max(100000).optional(),
    investmentInterests: z.array(z.string().max(120)).optional(),
    investmentStage: z.array(z.string().max(120)).optional(),
    portfolioCompanies: z.array(z.string().max(120)).optional(),
    totalInvestments: z.number().int().min(0).optional(),
    minimumInvestment: z.string().max(120).optional(),
    maximumInvestment: z.string().max(120).optional(),
    preferences: z.object({
      industries: z.array(z.string().max(120)).optional(),
      stages: z.array(z.string().max(120)).optional(),
      locations: z.array(z.string().max(120)).optional()
    }).optional(),
    history: z.string().max(4000).optional()
  }).strict()
});

router.get('/', requireAuth, async (req, res) => {
  const { role, search } = req.query;
  const filter = {};
  if (role) {
    filter.role = role;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: String(search), $options: 'i' } },
      { email: { $regex: String(search), $options: 'i' } }
    ];
  }

  const users = await User.find(filter);
  res.json({ users: users.map(user => user.toJSON()) });
});

router.get('/:id', requireAuth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: user.toJSON() });
});

router.patch('/me', requireAuth, validate(updateProfileSchema), async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userFields = ['name', 'bio', 'avatarUrl', 'isOnline'];
  const profileFields = [
    'startupName',
    'pitchSummary',
    'fundingNeeded',
    'industry',
    'location',
    'foundedYear',
    'teamSize',
    'investmentInterests',
    'investmentStage',
    'portfolioCompanies',
    'totalInvestments',
    'minimumInvestment',
    'maximumInvestment',
    'preferences',
    'history'
  ];

  const updates = {};
  const profileUpdates = {};

  Object.entries(req.validated.body || {}).forEach(([key, value]) => {
    if (userFields.includes(key)) {
      updates[key] = value;
    }
    if (profileFields.includes(key)) {
      profileUpdates[key] = value;
    }
  });

  if (Object.keys(profileUpdates).length > 0) {
    updates.profile = { ...user.profile?.toObject?.(), ...user.profile, ...profileUpdates };
  }

  Object.assign(user, updates);
  await user.save();

  res.json({ user: user.toJSON() });
});

export default router;
