# Frontend to Backend API Map

## Authentication
- Login: `POST /auth/login`
- Register: `POST /auth/register`
- Session: `GET /auth/me`
- Forgot password: `POST /auth/forgot-password`
- Reset password: `POST /auth/reset-password`
- Change password: `POST /auth/change-password`
- 2FA OTP: `POST /auth/request-otp`, `POST /auth/verify-otp`

## Profiles
- Profile fetch: `GET /users/:id`
- Update profile: `PATCH /users/me`
- Users list (filters): `GET /users?role=...&search=...`

## Collaboration
- Create request: `POST /collaboration`
- Investor requests: `GET /collaboration/investor/:id`
- Entrepreneur requests: `GET /collaboration/entrepreneur/:id`
- Update status: `PATCH /collaboration/:id/status`

## Meetings
- List meetings: `GET /meetings`
- Create meeting: `POST /meetings`
- Update status: `PATCH /meetings/:id/status`

## Video Call
- Signaling: Socket.IO events `room:join`, `room:leave`, `signal`

## Documents
- List documents: `GET /documents`
- Upload document: `POST /documents/upload`
- Update doc: `PATCH /documents/:id`
- Download: `GET /documents/:id/download`
- Signature: `POST /documents/:id/signature`
- Delete: `DELETE /documents/:id`

## Messages
- Conversations: `GET /messages/conversations`
- Messages with user: `GET /messages/with/:userId`
- Send message: `POST /messages`

## Payments
- List transactions: `GET /payments/transactions`
- Deposit: `POST /payments/deposit`
- Withdraw: `POST /payments/withdraw`
- Transfer: `POST /payments/transfer`
