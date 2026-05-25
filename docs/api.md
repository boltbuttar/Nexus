# Nexus API Reference (Draft)

Base URL: `http://localhost:5000/api`

## Auth
- `POST /auth/register` { name, email, password, role }
- `POST /auth/login` { email, password, role }
- `GET /auth/me`
- `POST /auth/forgot-password` { email }
- `POST /auth/reset-password` { token, newPassword }
- `POST /auth/change-password` { currentPassword, newPassword }
- `POST /auth/request-otp`
- `POST /auth/verify-otp` { code }

## Users
- `GET /users?role=entrepreneur|investor&search=...`
- `GET /users/:id`
- `PATCH /users/me` { name, bio, location, ... }

## Collaboration Requests
- `GET /collaboration/entrepreneur/:id`
- `GET /collaboration/investor/:id`
- `POST /collaboration` { investorId, entrepreneurId, message }
- `PATCH /collaboration/:id/status` { status }

## Meetings
- `GET /meetings`
- `POST /meetings` { participantId, title, startTime, endTime, location?, notes? }
- `PATCH /meetings/:id/status` { status }

## Documents
- `GET /documents?ownerId=...&shared=true|false`
- `POST /documents/upload` (multipart: file)
- `GET /documents/:id`
- `GET /documents/:id/download`
- `PATCH /documents/:id` { shared?, status? }
- `POST /documents/:id/signature` (multipart: signature)
- `DELETE /documents/:id`

## Messages
- `GET /messages/conversations`
- `GET /messages/with/:userId`
- `POST /messages` { receiverId, content }

## Payments
- `GET /payments/transactions`
- `POST /payments/deposit` { amount, currency? }
- `POST /payments/withdraw` { amount, currency? }
- `POST /payments/transfer` { amount, receiverId, currency? }

## Docs
- `GET /docs` Swagger UI (served at `/api/docs`)
