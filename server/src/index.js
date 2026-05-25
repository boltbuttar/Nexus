import 'express-async-errors';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import collaborationRoutes from './routes/collaboration.js';
import meetingRoutes from './routes/meetings.js';
import documentRoutes from './routes/documents.js';
import paymentRoutes from './routes/payments.js';
import messageRoutes from './routes/messages.js';
import { sanitizeRequest } from './middleware/sanitize.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const server = http.createServer(app);

const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL('./docs/openapi.json', import.meta.url), 'utf-8')
);

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(mongoSanitize());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(sanitizeRequest);

app.use('/uploads', express.static(path.resolve(env.uploadDir)));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);

app.use(notFound);
app.use(errorHandler);

const io = new Server(server, {
  cors: {
    origin: env.clientOrigin,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('room:join', ({ roomId, userId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('room:user-joined', { userId });
  });

  socket.on('room:leave', ({ roomId, userId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('room:user-left', { userId });
  });

  socket.on('signal', ({ roomId, data }) => {
    socket.to(roomId).emit('signal', { from: socket.id, data });
  });
});

const start = async () => {
  try {
    await connectDb();
    server.listen(env.port, () => {
      console.log(`Nexus API running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
