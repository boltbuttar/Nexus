# Nexus - Investor & Entrepreneur Collaboration Platform

Nexus is a full-stack platform that connects investors and entrepreneurs with collaboration requests, meetings, video calls, document management, payments, and secure authentication.

## Features
- JWT authentication with role-based access (investor vs entrepreneur)
- Profile management stored in MongoDB
- Collaboration requests and messaging
- Meeting scheduling with conflict detection and calendar view
- WebRTC video calls with Socket.IO signaling
- Document upload, PDF preview, sharing, and e-signature storage
- Mock payments with transaction history (Stripe optional)
- Security: validation, sanitization, rate limiting, and 2FA OTP flow

## Tech Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose)
- Realtime: Socket.IO, WebRTC (simple-peer)

## Local Setup
1) Install frontend dependencies (repo root):
   - `npm install`
2) Install backend dependencies:
   - `cd server`
   - `npm install`
3) Configure environment files:
   - Frontend: copy `.env.example` to `.env`
   - Backend: copy `server/.env.example` to `server/.env`
4) Start backend:
   - `cd server`
   - `npm run dev`
5) Start frontend (new terminal at repo root):
   - `npm run dev`

## Environment Variables
- Frontend env example: [.env.example](.env.example)
- Backend env example: [server/.env.example](server/.env.example)

## API Documentation
- Swagger UI: `http://localhost:5000/api/docs`
- Draft API reference: [docs/api.md](docs/api.md)
- Postman collection: [docs/postman/Nexus.postman_collection.json](docs/postman/Nexus.postman_collection.json)
- Feature map: [docs/feature-api-map.md](docs/feature-api-map.md)

## Deployment
- Deployment guide: [docs/deployment.md](docs/deployment.md)

## Demo
- Presentation outline: [docs/demo-presentation.md](docs/demo-presentation.md)

## Project Structure
- Frontend: `src/`
- Backend: `server/`
- Docs: `docs/`
