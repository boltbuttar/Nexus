# Nexus Demo Presentation (Outline)

## 1. Intro (1 slide)
- Problem: connecting investors with entrepreneurs efficiently
- Solution: Nexus platform with collaboration, meetings, video, documents, and payments

## 2. Architecture (1 slide)
- Frontend: React + Vite
- Backend: Node.js + Express + MongoDB
- Realtime: Socket.IO (WebRTC signaling)

## 3. Auth & Profiles (1 slide)
- JWT auth, role-based dashboards
- Profile updates stored in DB
- 2FA OTP flow (email)

## 4. Collaboration & Messaging (1 slide)
- Collaboration requests (investor -> entrepreneur)
- Messaging thread views

## 5. Meetings & Video (1-2 slides)
- Schedule meetings with conflict detection
- Calendar view for planning
- Video call rooms with audio/video toggles

## 6. Documents (1 slide)
- Upload and store files
- PDF preview
- E-signature linked to document

## 7. Payments (1 slide)
- Mock deposit/withdraw/transfer
- Transaction history

## 8. Security (1 slide)
- Validation + sanitization
- Rate limiting + Helmet
- JWT expiration

## 9. Deployment (1 slide)
- Frontend on Vercel
- Backend on Render
- Swagger docs at `/api/docs`

## 10. Live Demo Flow (1 slide)
- Register / Login
- Schedule meeting
- Join video room
- Upload document + sign
- Make payment

## 11. Q&A
