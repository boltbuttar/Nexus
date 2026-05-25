import express from 'express';
import { z } from 'zod';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const createSchema = z.object({
  body: z.object({
    participantId: z.string().min(1),
    title: z.string().optional(),
    notes: z.string().optional(),
    location: z.string().optional(),
    timeZone: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime()
  })
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['accepted', 'rejected', 'cancelled'])
  })
});

router.get('/', requireAuth, async (req, res) => {
  const meetings = await Meeting.find({
    $or: [{ organizerId: req.user.id }, { participantId: req.user.id }]
  }).sort({ startTime: 1 });

  res.json({ meetings });
});

router.post('/', requireAuth, validate(createSchema), async (req, res) => {
  const { participantId, title, notes, location, timeZone, startTime, endTime } = req.validated.body;

  if (new Date(startTime) >= new Date(endTime)) {
    return res.status(400).json({ error: 'End time must be after start time' });
  }

  if (participantId === req.user.id) {
    return res.status(400).json({ error: 'Cannot schedule a meeting with yourself' });
  }

  const participant = await User.findById(participantId);
  if (!participant) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  const overlap = await Meeting.findOne({
    status: { $in: ['pending', 'accepted'] },
    $or: [{ organizerId: req.user.id }, { participantId: req.user.id }, { organizerId: participantId }, { participantId }],
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) }
  });

  if (overlap) {
    return res.status(409).json({ error: 'Time slot is already booked' });
  }

  const meeting = await Meeting.create({
    organizerId: req.user.id,
    participantId,
    title: title || 'Meeting',
    notes: notes || '',
    location: location || '',
    timeZone: timeZone || 'UTC',
    startTime: new Date(startTime),
    endTime: new Date(endTime)
  });

  res.status(201).json({ meeting });
});

router.patch('/:id/status', requireAuth, validate(updateStatusSchema), async (req, res) => {
  const { status } = req.validated.body;
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  const isOrganizer = meeting.organizerId.toString() === req.user.id;
  const isParticipant = meeting.participantId.toString() === req.user.id;
  if (!isOrganizer && !isParticipant) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (status === 'cancelled' && !isOrganizer) {
    return res.status(403).json({ error: 'Only the organizer can cancel' });
  }

  meeting.status = status;
  await meeting.save();

  res.json({ meeting });
});

export default router;
