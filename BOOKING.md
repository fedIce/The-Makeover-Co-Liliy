# Phase 1 booking setup

## 1. Database (Neon Postgres)

1. Create a Neon project and copy the connection string.
2. Set `DATABASE_URL` in `.env` (see `.env.example`).
3. Run:

```bash
npm run db:setup
```

This pushes the Prisma schema and seeds services, Tue–Sat 09:00–18:00 hours, and an admin user from `ADMIN_EMAILS`.

## 2. Auth (magic link)

1. Create a Resend API key.
2. Set `RESEND_API_KEY`, `EMAIL_FROM`, `AUTH_SECRET`, `AUTH_URL`.

## 3. Stripe deposits

1. Stripe test keys → `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Webhook endpoint: `POST /api/stripe/webhook` for `checkout.session.completed` and `checkout.session.expired`.
3. Set `STRIPE_WEBHOOK_SECRET`.

Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## 4. Google Calendar

1. Google Cloud OAuth client (Web) with redirect `GOOGLE_REDIRECT_URI`.
2. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`.
3. Sign in as admin → `/admin/settings` → Connect Google.

## 5. Inngest (holds + reminders)

1. Create an Inngest app; set `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`.
2. Sync functions at `/api/inngest`.
3. Locally: `npx inngest-cli@latest dev`.

## Routes

| Path | Who |
|------|-----|
| `/book` | Customers |
| `/account` | Signed-in clients |
| `/login` | Magic link |
| `/admin` | Lilly (admin email) |

## Policies (defaults)

- Deposit ~30% (per-service `depositCents`)
- Hold TTL 12 minutes
- Free cancel ≥ 48 hours before start
- Timezone `Asia/Nicosia`, currency EUR
