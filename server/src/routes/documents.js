import express from 'express';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { env } from '../config/env.js';
import Document from '../models/Document.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const uploadDir = path.resolve(env.uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }
});

const updateSchema = z.object({
  body: z.object({
    shared: z.boolean().optional(),
    status: z.enum(['draft', 'signed']).optional()
  })
});

router.get('/', requireAuth, async (req, res) => {
  const { ownerId, shared } = req.query;
  const filter = {};

  if (ownerId) {
    filter.ownerId = ownerId;
  } else {
    filter.ownerId = req.user.id;
  }

  if (shared !== undefined) {
    filter.shared = String(shared).toLowerCase() === 'true';
  }

  const documents = await Document.find(filter).sort({ createdAt: -1 });
  res.json({ documents });
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  const ownerId = req.body.ownerId || req.user.id;
  const sizeInMb = req.file.size / (1024 * 1024);
  const sizeLabel = `${sizeInMb.toFixed(1)} MB`;
  const fileExtension = path.extname(req.file.originalname).replace('.', '').toUpperCase();

  const doc = await Document.create({
    ownerId,
    uploadedBy: req.user.id,
    name: req.file.originalname,
    type: fileExtension || req.file.mimetype,
    size: sizeLabel,
    mimeType: req.file.mimetype,
    url: `/uploads/${req.file.filename}`,
    storageKey: req.file.filename,
    shared: false
  });

  res.status(201).json({ document: doc });
});

router.get('/:id', requireAuth, async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (doc.ownerId.toString() !== req.user.id && !doc.shared) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({ document: doc });
});

router.get('/:id/download', requireAuth, async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (doc.ownerId.toString() !== req.user.id && !doc.shared) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.sendFile(path.resolve(uploadDir, doc.storageKey));
});

router.patch('/:id', requireAuth, validate(updateSchema), async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (doc.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Only the owner can update this document' });
  }

  const { shared, status } = req.validated.body;
  if (shared !== undefined) {
    doc.shared = shared;
  }
  if (status) {
    doc.status = status;
  }

  await doc.save();
  res.json({ document: doc });
});

router.post('/:id/signature', requireAuth, upload.single('signature'), async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (doc.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Only the owner can sign this document' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Signature image required' });
  }

  doc.signatureUrl = `/uploads/${req.file.filename}`;
  doc.status = 'signed';
  await doc.save();

  res.json({ document: doc });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (doc.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Only the owner can delete this document' });
  }

  await doc.deleteOne();
  res.json({ message: 'Document deleted' });
});

export default router;
