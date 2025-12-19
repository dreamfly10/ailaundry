# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier works)
- OpenAI API key

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create account at https://supabase.com
2. Create new project
3. Run SQL from `supabase/schema.sql` in SQL Editor
4. Get project URL and anon key from Settings → API

### 3. Configure Environment Variables

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

Fill in all values:
- `OPENAI_API_KEY` - From https://platform.openai.com/api-keys
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase dashboard
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - `http://localhost:3000` for local dev
- `GOOGLE_CLIENT_ID` - From Google Cloud Console (optional)
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console (optional)
- `NEXT_PUBLIC_BASE_URL` - `http://localhost:3000` for local dev

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Test the Application

1. Register a new account (creates trial user)
2. Process an article (tracks tokens)
3. Check token usage display
4. Try upgrade endpoint (POST /api/upgrade)

## Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

See `CHANGE.md` for detailed information about all changes.

