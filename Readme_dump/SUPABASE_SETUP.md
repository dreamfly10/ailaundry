# Supabase Setup Guide

This guide will help you set up Supabase for the AI Translation App.

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Create a new organization (if needed)

## Step 2: Create New Project

1. Click "New Project"
2. Fill in project details:
   - **Name:** AI Translation App (or your preferred name)
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is sufficient for development

3. Click "Create new project"
4. Wait 2-3 minutes for project to be created

## Step 3: Get Your Project Credentials

1. Once project is ready, go to **Settings** → **API**
2. You'll find:
   - **Project URL:** Copy this (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key:** Copy this (starts with `eyJ...`)

3. Add these to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

## Step 4: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

## Step 5: Verify Table Creation

1. Go to **Table Editor** in Supabase dashboard
2. You should see a `users` table
3. Click on it to view the structure
4. Verify it has all columns:
   - id
   - email
   - password
   - name
   - image
   - user_type
   - tokens_used
   - token_limit
   - subscription_status
   - subscription_expires_at
   - payment_id
   - created_at
   - updated_at

## Step 6: Configure Row Level Security (Optional)

The schema includes RLS policies, but since we're using NextAuth (not Supabase Auth), you may need to:

1. Go to **Authentication** → **Policies**
2. For the `users` table, you can either:
   - **Option A:** Disable RLS (for server-side only access)
     - Go to **Table Editor** → **users** → **Settings**
     - Toggle off "Enable Row Level Security"
   - **Option B:** Keep RLS but use service role key for server operations
     - Get service role key from **Settings** → **API**
     - Use it in server-side code only (never expose to client)

## Step 7: Test Connection

1. Make sure your `.env.local` has all variables set
2. Run your app:
   ```bash
   npm run dev
   ```
3. Try registering a new user
4. Check Supabase **Table Editor** → **users** to see if user was created

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` exists in project root
- Verify variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding env variables

### Error: "relation 'users' does not exist"
- Run the SQL schema from `supabase/schema.sql` in SQL Editor
- Make sure you're connected to the correct project

### Error: "new row violates row-level security policy"
- Either disable RLS (Option A above) or use service role key (Option B)
- For development, disabling RLS is easier

### Can't see data in Table Editor
- Make sure you're looking at the correct project
- Refresh the page
- Check if RLS is blocking your view

## Next Steps

Once Supabase is set up:
1. Test user registration
2. Test article processing
3. Verify token tracking works
4. Deploy to Vercel (see CHANGE.md for deployment steps)

## Production Considerations

For production:
1. Use environment variables in Vercel (not `.env.local`)
2. Consider using service role key for server operations
3. Enable RLS with proper policies
4. Set up database backups
5. Monitor usage and costs

