# Change Log: Supabase Integration & Trial/Paid User System

This document outlines all the changes made to integrate Supabase database, implement trial/paid user classification, token limiting, and prepare for Vercel deployment.

## Overview

The application has been upgraded from an in-memory database to Supabase (PostgreSQL), with a comprehensive user management system that supports:
- Trial users with token limits (100,000 tokens)
- Paid users with extended limits (10,000,000 tokens)
- Token usage tracking and enforcement
- Upgrade functionality for transitioning from trial to paid

---

## 1. Database Migration: In-Memory → Supabase

### What Changed

**Before:** User data was stored in-memory using JavaScript Maps, which meant:
- Data was lost on server restart
- No persistence across deployments
- Limited scalability

**After:** User data is now stored in Supabase (PostgreSQL), providing:
- Persistent data storage
- Scalable architecture
- Production-ready database

### Files Changed

#### `lib/db.ts` - Complete Rewrite
- **Removed:** In-memory Map-based storage
- **Added:** Supabase client integration
- **Updated:** User interface to include new fields:
  - `userType: 'trial' | 'paid'`
  - `tokensUsed: number`
  - `tokenLimit: number`
  - `subscriptionStatus?: 'active' | 'expired' | 'cancelled'`
  - `subscriptionExpiresAt?: Date`
  - `paymentId?: string`

#### `lib/supabase.ts` - New File
- Created Supabase client configuration
- Uses environment variables for connection

#### `supabase/schema.sql` - New File
- Database schema definition
- Creates `users` table with all required fields
- Includes indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates via triggers

### Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  name TEXT,
  image TEXT,
  user_type TEXT DEFAULT 'trial',
  tokens_used BIGINT DEFAULT 0,
  token_limit BIGINT DEFAULT 100000,
  subscription_status TEXT,
  subscription_expires_at TIMESTAMPTZ,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. User Classification: Trial vs Paid

### User Types

#### Trial Users
- **Default:** All new registrations start as trial users
- **Token Limit:** 100,000 tokens
- **Features:** Full access until token limit is reached
- **Upgrade Path:** Can upgrade to paid at any time

#### Paid Users
- **Token Limit:** 10,000,000 tokens (effectively unlimited)
- **Subscription:** 30-day subscription period
- **Features:** Unlimited access during subscription period

### Files Changed

#### `app/api/auth/register/route.ts`
- **Added:** Default trial user creation with:
  - `userType: 'trial'`
  - `tokensUsed: 0`
  - `tokenLimit: 100000`

#### `lib/auth.ts`
- **Updated:** Google OAuth sign-in to also create trial users with default limits

---

## 3. Token Tracking & Limiting System

### Token Calculation
- **Method:** Approximate calculation (~4 characters = 1 token)
- **Tracked:** Input text, translation output, and insights output
- **Total:** Sum of all three for each article processing request

### Files Created

#### `lib/token-tracker.ts` - New File
Contains utility functions:
- `calculateTokensUsed(text: string)`: Estimates token count
- `checkTokenLimit(userId: string)`: Checks if user has remaining tokens
- `consumeTokens(userId: string, tokens: number)`: Deducts tokens from user balance
- `getTokenUsage(userId: string)`: Returns current usage statistics

### Files Changed

#### `app/api/process-article/route.ts`
- **Added:** Token limit check before processing
- **Added:** Token calculation after processing
- **Added:** Token consumption tracking
- **Added:** Token status in response
- **Behavior:** Returns 403 error if trial user exceeds limit

**New Response Fields:**
```json
{
  "translation": "...",
  "insights": "...",
  "tokensUsed": 1500,
  "tokensRemaining": 98500,
  "tokensTotal": 1500,
  "tokenLimit": 100000
}
```

**Error Response (Limit Reached):**
```json
{
  "error": "Token limit reached",
  "message": "You have reached your trial token limit. Please upgrade to continue.",
  "tokensUsed": 100000,
  "limit": 100000,
  "tokensRemaining": 0,
  "upgradeRequired": true
}
```

---

## 4. Upgrade System

### Files Created

#### `app/api/upgrade/route.ts` - New File
- **Endpoint:** `POST /api/upgrade`
- **Functionality:** Upgrades trial user to paid status
- **Updates:**
  - `userType: 'paid'`
  - `tokenLimit: 10000000`
  - `subscriptionStatus: 'active'`
  - `subscriptionExpiresAt: 30 days from now`

### Usage
```typescript
// Frontend call
const response = await fetch('/api/upgrade', {
  method: 'POST',
});
```

---

## 5. Token Usage API

### Files Created

#### `app/api/token-usage/route.ts` - New File
- **Endpoint:** `GET /api/token-usage`
- **Returns:** Current token usage statistics
- **Response:**
```json
{
  "allowed": true,
  "tokensUsed": 5000,
  "tokensRemaining": 95000,
  "limit": 100000,
  "userType": "trial"
}
```

---

## 6. Frontend Components

### Files Created

#### `components/TokenUsage.tsx` - New File
- **Purpose:** Display token usage to users
- **Features:**
  - Visual progress bar
  - Token count display
  - Warning when low on tokens
  - Upgrade button for trial users
  - Auto-refresh every 30 seconds
  - Color-coded status (green/yellow/red)

**Usage:**
```tsx
import { TokenUsage } from '@/components/TokenUsage';

// In your page component
<TokenUsage />
```

---

## 7. Dependencies

### Updated Files

#### `package.json`
- **Added:** `@supabase/supabase-js: ^2.39.0`

**Installation:**
```bash
npm install
```

---

## 8. Environment Variables

### Updated Files

#### `env.example`
- **Added:**
  - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Required Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (for SSO)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 9. Vercel Deployment Configuration

### Files Created

#### `vercel.json` - New File
- **Purpose:** Vercel deployment configuration
- **Settings:**
  - Framework: Next.js
  - Region: iad1 (US East)
  - Environment variables mapping

### Deployment Steps

1. **Set up Supabase:**
   - Create account at https://supabase.com
   - Create new project
   - Run the SQL schema from `supabase/schema.sql` in the SQL Editor
   - Copy project URL and anon key

2. **Set up Vercel:**
   - Connect GitHub repository to Vercel
   - Add environment variables in Vercel dashboard:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `OPENAI_API_KEY`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (your Vercel URL)
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `NEXT_PUBLIC_BASE_URL` (your Vercel URL)

3. **Deploy:**
   - Push to main branch (auto-deploys)
   - Or manually deploy from Vercel dashboard

---

## 10. Data Stored in Database

### User Information

Based on the current design, the following information is stored:

1. **Authentication Data:**
   - `id`: Unique user identifier (UUID)
   - `email`: User email address (unique)
   - `password`: Hashed password (for email/password auth, nullable for OAuth)

2. **Profile Data:**
   - `name`: Display name (optional)
   - `image`: Profile image URL (optional, from Google OAuth)

3. **Subscription Data:**
   - `userType`: `'trial'` or `'paid'`
   - `tokensUsed`: Total tokens consumed (bigint)
   - `tokenLimit`: Maximum tokens allowed (bigint)
   - `subscriptionStatus`: `'active'`, `'expired'`, or `'cancelled'`
   - `subscriptionExpiresAt`: Subscription expiration date
   - `paymentId`: Payment processor ID (for future integration)

4. **Metadata:**
   - `createdAt`: Account creation timestamp
   - `updatedAt`: Last update timestamp (auto-updated)

---

## 11. Token Limit Implementation

### How It Works

1. **On Registration:**
   - New users are created as `trial` with 100,000 token limit
   - `tokensUsed` starts at 0

2. **On Article Processing:**
   - System checks if user has remaining tokens
   - If limit reached (trial users only), returns 403 error
   - If allowed, processes article
   - Calculates tokens used (input + translation + insights)
   - Deducts tokens from user balance
   - Returns token usage info in response

3. **On Upgrade:**
   - User type changes to `paid`
   - Token limit increases to 10,000,000
   - Subscription status set to `active`
   - Subscription expires in 30 days

### Token Calculation

Current implementation uses approximate calculation:
- **Formula:** `Math.ceil(text.length / 4)`
- **Reason:** Simple and fast
- **Note:** For production, consider using `tiktoken` library for accurate token counting

---

## 12. Changes Required for Production

### Immediate Actions Needed

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Up Supabase:**
   - Create Supabase project
   - Run `supabase/schema.sql` in SQL Editor
   - Get project URL and anon key

3. **Update Environment Variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in all required values

4. **Test Locally:**
   ```bash
   npm run dev
   ```

### Future Enhancements

1. **Payment Integration:**
   - Integrate Stripe or PayPal for actual payments
   - Update `app/api/upgrade/route.ts` to process payments
   - Store payment IDs in `paymentId` field

2. **Token Calculation Accuracy:**
   - Install `tiktoken` library
   - Update `calculateTokensUsed()` to use actual tokenizer

3. **Subscription Management:**
   - Add cron job to check expired subscriptions
   - Automatically downgrade expired paid users
   - Send expiration warnings

4. **Analytics:**
   - Track token usage patterns
   - Monitor conversion rates (trial → paid)
   - Add admin dashboard

---

## 13. Migration Guide

### For Existing Users (if any)

If you have existing in-memory data, you'll need to:

1. Export existing user data (if possible)
2. Manually create users in Supabase with same email
3. Set appropriate token limits based on user history

### For New Deployments

Simply follow the setup steps above - all new users will be created as trial users automatically.

---

## 14. API Endpoints Summary

### New Endpoints

- `POST /api/upgrade` - Upgrade trial user to paid
- `GET /api/token-usage` - Get current token usage statistics

### Modified Endpoints

- `POST /api/process-article` - Now includes token checking and tracking
- `POST /api/auth/register` - Now creates trial users with token limits

---

## 15. Testing Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Set up Supabase project
- [ ] Run database schema
- [ ] Configure environment variables
- [ ] Test user registration (creates trial user)
- [ ] Test article processing (tracks tokens)
- [ ] Test token limit enforcement
- [ ] Test upgrade endpoint
- [ ] Test token usage display
- [ ] Deploy to Vercel
- [ ] Test production deployment

---

## Summary

This update transforms the application from a prototype with in-memory storage to a production-ready application with:
- ✅ Persistent database (Supabase/PostgreSQL)
- ✅ User classification (Trial/Paid)
- ✅ Token tracking and limiting
- ✅ Upgrade system
- ✅ Vercel deployment ready
- ✅ Comprehensive error handling
- ✅ User-friendly token usage display

All changes maintain backward compatibility where possible, and new features are additive rather than breaking existing functionality.

