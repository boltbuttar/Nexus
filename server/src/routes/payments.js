import express from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { env } from '../config/env.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const stripe = env.stripeSecret ? new Stripe(env.stripeSecret) : null;

const amountSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    currency: z.string().optional()
  })
});

const transferSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    currency: z.string().optional(),
    receiverId: z.string().min(1)
  })
});

router.get('/transactions', requireAuth, async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ transactions });
});

router.post('/deposit', requireAuth, validate(amountSchema), async (req, res) => {
  const { amount, currency } = req.validated.body;
  const txnCurrency = (currency || 'USD').toUpperCase();

  let status = 'completed';
  let reference = '';
  let paymentIntentClientSecret = '';

  if (stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: txnCurrency.toLowerCase(),
      metadata: { userId: req.user.id }
    });
    status = 'pending';
    reference = intent.id;
    paymentIntentClientSecret = intent.client_secret || '';
  }

  const transaction = await Transaction.create({
    userId: req.user.id,
    type: 'deposit',
    amount,
    currency: txnCurrency,
    status,
    reference
  });

  res.status(201).json({ transaction, paymentIntentClientSecret });
});

router.post('/withdraw', requireAuth, validate(amountSchema), async (req, res) => {
  const { amount, currency } = req.validated.body;
  const txnCurrency = (currency || 'USD').toUpperCase();

  const transaction = await Transaction.create({
    userId: req.user.id,
    type: 'withdraw',
    amount,
    currency: txnCurrency,
    status: 'pending'
  });

  res.status(201).json({ transaction });
});

router.post('/transfer', requireAuth, validate(transferSchema), async (req, res) => {
  const { amount, currency, receiverId } = req.validated.body;
  const txnCurrency = (currency || 'USD').toUpperCase();

  if (receiverId === req.user.id) {
    return res.status(400).json({ error: 'Cannot transfer to yourself' });
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res.status(404).json({ error: 'Receiver not found' });
  }

  const senderTxn = await Transaction.create({
    userId: req.user.id,
    type: 'transfer',
    amount,
    currency: txnCurrency,
    status: 'completed',
    metadata: { receiverId }
  });

  const receiverTxn = await Transaction.create({
    userId: receiverId,
    type: 'deposit',
    amount,
    currency: txnCurrency,
    status: 'completed',
    metadata: { senderId: req.user.id }
  });

  res.status(201).json({ transaction: senderTxn, mirrorTransaction: receiverTxn });
});

export default router;
