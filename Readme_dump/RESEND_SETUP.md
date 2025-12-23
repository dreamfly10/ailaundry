# Resend Email Setup Guide

## Overview

The app uses Resend to send support form submissions to your email address. Resend provides a simple, reliable email API with a generous free tier.

## Quick Setup (5 minutes)

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Key

1. Go to Resend Dashboard → API Keys
2. Click "Create API Key"
3. Name it (e.g., "AI Translate Production")
4. Copy the API key (starts with `re_`)

### Step 3: Verify Domain (Optional but Recommended)

**For Production:**
1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records provided by Resend
4. Wait for verification (usually a few minutes)

**For Development/Testing:**
- You can use `onboarding@resend.dev` without verification
- This is fine for testing but limited in production

### Step 4: Add Environment Variables

Add to your `.env.local`:

```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=AI Translate <onboarding@resend.dev>
SUPPORT_EMAIL=haofu99@gmail.com
```

**For Production (with verified domain):**
```env
RESEND_FROM_EMAIL=AI Translate <support@yourdomain.com>
```

### Step 5: Test

1. Start your dev server: `npm run dev`
2. Click the "Support" button in the navigation
3. Fill out the form and submit
4. Check your email (haofu99@gmail.com) for the support request

## How It Works

1. User clicks "Support" button → Modal opens
2. User fills out form (name, email, subject, message)
3. Form submits to `/api/support`
4. API route validates input and sends email via Resend
5. Email arrives at `SUPPORT_EMAIL` (haofu99@gmail.com)
6. Reply-to is set to user's email for easy response

## Email Format

The support email includes:
- **From**: User's name and email
- **Subject**: "Support Request: [user's subject]"
- **Body**: Formatted HTML email with user's message
- **Reply-To**: User's email (so you can reply directly)

## Free Tier Limits

- **3,000 emails/month** (free tier)
- More than enough for support requests
- Upgrade available if needed

## Troubleshooting

### "Email service not configured"
- Check that `RESEND_API_KEY` is set in `.env.local`
- Restart dev server after adding environment variables

### "Failed to send email"
- Verify API key is correct
- Check Resend dashboard for error logs
- Ensure domain is verified (if using custom domain)

### Emails not arriving
- Check spam folder
- Verify `SUPPORT_EMAIL` is correct
- Check Resend dashboard → Logs for delivery status

## Production Considerations

1. **Verify your domain** in Resend for better deliverability
2. **Update `RESEND_FROM_EMAIL`** to use your domain
3. **Monitor email logs** in Resend dashboard
4. **Set up email templates** (optional, for better formatting)

## Files Created

- `components/SupportForm.tsx` - Support form modal component
- `app/api/support/route.ts` - API endpoint for sending emails
- `app/page.tsx` - Updated with support button in navigation

## Security Notes

- Form validation on both client and server
- Rate limiting recommended for production (not implemented yet)
- Email addresses are validated before sending
- API key is server-side only (never exposed to client)

