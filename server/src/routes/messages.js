import express from 'express';
import { z } from 'zod';
import Message from '../models/Message.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const sendSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1),
    content: z.string().min(1)
  })
});

router.get('/conversations', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }]
  }).sort({ createdAt: 1 });

  const conversationsMap = new Map();

  messages.forEach(message => {
    const partnerId = message.senderId.toString() === userId
      ? message.receiverId.toString()
      : message.senderId.toString();

    const existing = conversationsMap.get(partnerId);
    const lastMessage = message.toJSON();

    if (!existing || new Date(lastMessage.timestamp) > new Date(existing.updatedAt)) {
      conversationsMap.set(partnerId, {
        id: `conv-${userId}-${partnerId}`,
        participants: [userId, partnerId],
        lastMessage,
        updatedAt: lastMessage.timestamp
      });
    }
  });

  const conversations = Array.from(conversationsMap.values()).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  res.json({ conversations });
});

router.get('/with/:userId', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const partnerId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: partnerId },
      { senderId: partnerId, receiverId: userId }
    ]
  }).sort({ createdAt: 1 });

  res.json({ messages: messages.map(message => message.toJSON()) });
});

router.post('/', requireAuth, validate(sendSchema), async (req, res) => {
  const { receiverId, content } = req.validated.body;

  const message = await Message.create({
    senderId: req.user.id,
    receiverId,
    content
  });

  res.status(201).json({ message: message.toJSON() });
});

export default router;
