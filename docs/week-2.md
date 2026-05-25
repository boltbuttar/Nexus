# Week 2 - Collaboration, Meetings, Video, Documents

## Summary
- Added meeting scheduling APIs with conflict detection and status updates.
- Implemented WebRTC signaling via Socket.IO and a basic video call UI.
- Built document upload, sharing, and signature endpoints with frontend integration.

## Backend
- Meetings API: schedule, list, accept/reject/cancel.
- Socket.IO signaling for WebRTC rooms.
- Documents API: upload, list, share, download, delete, and signature upload.

## Frontend
- New Meetings page with scheduling form and status actions.
- New Video Call page with room join, audio/video toggles, and end call.
- Documents page now uploads and manages files from the backend.

## Notes
- Video calling uses socket.io-client and simple-peer.
- Uploaded files are served from /uploads on the backend.
