import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import User from '../models/User.js';
import { signToken } from '../utils/tokens.js';
import { sendEmail } from '../services/email.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['entrepreneur', 'investor'])
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['entrepreneur', 'investor']).optional()
  })
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    newPassword: z.string().min(6)
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6)
  })
});

const otpRequestSchema = z.object({
  body: z.object({})
});

const otpVerifySchema = z.object({
  body: z.object({
    code: z.string().min(4).max(8)
  })
});

router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password, role } = req.validated.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    avatarUrl,
    profile: role === 'entrepreneur'
      ? {
          startupName: '',
          pitchSummary: '',
          fundingNeeded: '',
          industry: '',
          location: '',
          foundedYear: undefined,
          teamSize: undefined
        }
      : {
          investmentInterests: [],
          investmentStage: [],
          portfolioCompanies: [],
          totalInvestments: undefined,
          minimumInvestment: '',
          maximumInvestment: ''
        }
  });

  const token = signToken({ sub: user.id, role: user.role });

  res.status(201).json({
    token,
    user: user.toJSON()
  });
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password, role } = req.validated.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (role && user.role !== role) {
    return res.status(401).json({ error: 'Invalid role for this account' });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ sub: user.id, role: user.role });

  res.json({
    token,
    user: user.toJSON()
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user: user.toJSON() });
});

router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
  const { email } = req.validated.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email' });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.reset = {
    tokenHash: resetTokenHash,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  };
  await user.save();

  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your Nexus password',
    text: `Reset your password using this link: ${resetUrl}`
  });

  res.json({ message: 'Password reset instructions sent' });
});

router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
  const { token, newPassword } = req.validated.body;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    'reset.tokenHash': tokenHash,
    'reset.expiresAt': { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.reset = { tokenHash: null, expiresAt: null };
  await user.save();

  res.json({ message: 'Password reset successfully' });
});

router.post('/change-password', requireAuth, validate(changePasswordSchema), async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password updated' });
});

router.post('/request-otp', requireAuth, validate(otpRequestSchema), async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  user.otp = {
    codeHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };
  await user.save();

  await sendEmail({
    to: user.email,
    subject: 'Your Nexus verification code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`
  });

  res.json({ message: 'Verification code sent' });
});

router.post('/verify-otp', requireAuth, validate(otpVerifySchema), async (req, res) => {
  const { code } = req.validated.body;
  const user = await User.findById(req.user.id);
  if (!user || !user.otp?.codeHash || !user.otp?.expiresAt) {
    return res.status(400).json({ error: 'OTP not requested' });
  }

  if (user.otp.expiresAt < new Date()) {
    return res.status(400).json({ error: 'OTP expired' });
  }

  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  if (codeHash !== user.otp.codeHash) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  user.twoFactorEnabled = true;
  user.otp = { codeHash: null, expiresAt: null };
  await user.save();

  res.json({ message: 'OTP verified' });
});

export default router;
