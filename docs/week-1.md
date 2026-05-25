# Week 1 - Environment Setup and Core Backend

## Summary
- Added Node.js/Express backend with MongoDB connection and security middleware.
- Implemented JWT authentication, profile updates, and role-based access foundations.
- Wired frontend authentication and profile screens to backend APIs.
- Replaced mock collaboration requests, users, and messages with API-backed data.
- Added document API wiring and basic upload/download actions.

## Backend (server)
- New Express server in server/ with MongoDB (Mongoose).
- Auth routes: register, login, me, forgot/reset password, OTP request/verify.
- Users routes: list users, get user by id, update own profile.
- Collaboration routes: send and manage collaboration requests.
- Messages routes: conversations, chat history, send message.
- Documents routes: upload, list, share, download, delete.
- Payments and meetings routes scaffolded for Week 2-3.

## Frontend
- AuthContext now uses API for login, registration, password reset, and profile updates.
- Entrepreneurs/Investors list pages load from backend.
- Investor/Entrepreneur profiles load from backend.
- Collaboration requests now update via backend APIs.
- Messages and chat use backend APIs.
- Documents page connects to backend upload/list/delete/share.

## Setup Steps
1) Backend
- Copy server/.env.example to server/.env and fill values.
- From server/ run: npm install
- Run: npm run dev

2) Frontend
- Copy .env.example to .env and adjust VITE_API_URL if needed.
- From repo root run: npm install
- Run: npm run dev

## Notes
- Default API base URL: http://localhost:5000/api
- Default frontend URL: http://localhost:5173
- Uploaded files are stored in server/uploads (local development).
