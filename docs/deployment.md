# Deployment Guide

This project uses a Vite frontend and an Express + MongoDB backend. Below are production-ready steps for Vercel (frontend) and Render (backend).

## Backend (Render)
1) Create a new Web Service in Render.
2) Connect the GitHub repo and set the root directory to `server/`.
3) Build command: `npm install`
4) Start command: `npm start`
5) Add environment variables:
   - `PORT=5000`
   - `MONGO_URI=<your MongoDB Atlas connection string>`
   - `JWT_SECRET=<secure random string>`
   - `JWT_EXPIRES_IN=7d`
   - `CLIENT_ORIGIN=<your Vercel frontend URL>`
   - `EMAIL_HOST=<smtp host or leave empty>`
   - `EMAIL_PORT=587`
   - `EMAIL_USER=<smtp user>`
   - `EMAIL_PASS=<smtp pass>`
   - `EMAIL_FROM=notifications@nexus.local`
   - `EMAIL_DEBUG=true` (set to `false` when SMTP is configured)
   - `STRIPE_SECRET=<optional Stripe secret>`
   - `UPLOAD_DIR=uploads`
6) Add a persistent disk if you want uploads to survive restarts, or swap to S3 later.
7) Confirm the health endpoint: `<backend-url>/api/health`
8) API docs: `<backend-url>/api/docs`

## Frontend (Vercel)
1) Create a new Vercel project.
2) Root directory: repo root.
3) Build command: `npm run build`
4) Output directory: `dist`
5) Set environment variables:
   - `VITE_API_URL=<backend-url>/api`
   - `VITE_SOCKET_URL=<backend-url>`
6) Redeploy.

## Post-deploy Checks
- Login/register works
- Meetings calendar loads
- Video call connects (two browsers)
- Documents upload + PDF preview
- Payments list/submit actions
- `/api/docs` loads Swagger UI
