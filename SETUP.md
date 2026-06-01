# Lock In — 40 Days · Setup Guide

Cross-device, syncs everywhere, works as a home-screen app on phone and PC.

---

## Deploy in ~10 minutes (Vercel + Neon — both free)

### 1. Database — Neon (free tier)

1. Go to **neon.tech** → Create account → New project → copy the **Connection string**
2. It looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

### 2. Auth secret

Open Terminal and run:
```
openssl rand -base64 32
```
Copy the output — that's your `BETTER_AUTH_SECRET`.

### 3. Deploy to Vercel

1. Push this folder to a GitHub repo (drag-drop on github.com)
2. Go to **vercel.com** → New project → Import that repo
3. In **Environment Variables**, add:
   - `DATABASE_URL` → your Neon connection string
   - `BETTER_AUTH_SECRET` → the random string from step 2
4. Click **Deploy** — Vercel builds and gives you a URL (e.g. `lockin-xxx.vercel.app`)

### 4. Run the database migration

Once deployed, open your Vercel project terminal (or run locally with your `.env` set):
```
pnpm db:push
```
Or just trigger it once by visiting your deployed URL — Better Auth creates its tables automatically on first request.

> If you get a "table not found" error: run `npx drizzle-kit push` from the project folder with `DATABASE_URL` in your `.env.local`.

### 5. Create your account

Open your deployed URL → Sign Up → you're in.

### 6. Add to home screen

- **iPhone**: Open the URL in Safari → Share → Add to Home Screen
- **Android**: Open in Chrome → three-dot menu → Add to Home Screen
- **Desktop**: Chrome shows an install icon in the address bar

---

## Local development

```bash
cp .env.example .env.local
# Fill in DATABASE_URL and BETTER_AUTH_SECRET in .env.local

pnpm install
pnpm dev
```

Open http://localhost:3000

---

## Optional: Push notifications

Run once:
```bash
npx web-push generate-vapid-keys
```
Add the output to your Vercel env vars:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL` → `mailto:your@email.com`

Then redeploy. Settings → Notifications → Enable.

---

## What's in this app

| Feature | Notes |
|---|---|
| Daily habits | Bible, Workout, Diet, Read, Job action — tap to check off |
| Job tracker | Paste a link — company & role fill in automatically |
| Weekly review | Wins, struggles, lessons, rating, PDF export |
| Progress charts | Weight trend, habit streaks, consistency heatmap |
| Projects board | samlungu.com · Zonse Live · UK Home Office |
| Calendar reminders | Download .ics → import to phone calendar (Settings page) |
| Push notifications | Real browser notifications (optional, needs VAPID keys) |
| PWA | Installable on any device, works offline for reads |

---

## The program

- **Start date**: June 1, 2026 (Day 1 is today)
- **End date**: July 10, 2026 (Day 40)
- **40 applications**, **2 runs/week**, daily habits every day
- Edit `lib/program.ts` to change start date or any target
