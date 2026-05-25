# Week 3 - Payments, Security, and Integration

## Summary
- Added payments endpoints for deposits, withdrawals, and transfers.
- Implemented mock Stripe integration (optional via STRIPE_SECRET).
- Strengthened security with validation, sanitization, JWT auth, bcrypt hashing, and 2FA OTP flow.
- Added calendar view for meetings and PDF preview for documents.
- Added change-password flow and role-based route guards.
- Added Swagger UI at /api/docs for API documentation.

## Backend
- Payments API: deposit, withdraw, transfer, and transaction history.
- Auth enhancements: OTP request/verify and twoFactorEnabled flag.
- Security middleware: helmet, rate limiting, and mongo sanitization.

## Frontend
- New Payments page with transaction history and action forms.
- Settings page now supports 2FA OTP verification.
- Meetings page now includes a calendar view for scheduled sessions.
- Documents page now supports PDF preview and signature display.

## Notes
- Set STRIPE_SECRET in server/.env to enable Stripe PaymentIntents.
- Deployment steps are pending and should be completed after env setup.
