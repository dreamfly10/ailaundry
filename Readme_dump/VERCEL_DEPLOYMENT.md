# Vercel Deployment Guide

## ✅ Build Issues Fixed

The following issues have been resolved:

1. **Fixed `vercel.json` configuration** - Removed incorrect environment variable syntax
2. **Fixed TypeScript errors**:
   - Stripe subscription type issues in webhook handler
   - Missing `statusCode` property in error objects
   - Stripe API version updated to `2025-12-15.clover`
   - Stripe client `redirectToCheckout` type issues
3. **Fixed Next.js static generation issues**:
   - Wrapped `useSearchParams()` in Suspense boundaries for `/`, `/auth/signin`, and `/upgrade` pages
   - Marked `/api/token-usage` route as dynamic

## 🚀 Deployment Steps

### 1. Push Your Code to GitHub/GitLab/Bitbucket

Make sure your code is committed and pushed to your repository.

### 2. Connect Your Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your repository
4. Vercel will auto-detect Next.js - keep the default settings

### 3. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add **ALL** of the following:

#### Required Environment Variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=https://your-app.vercel.app

# Google OAuth (Optional - only if using Google sign-in)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_ID=your_stripe_price_id

# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=AI Translate <onboarding@resend.dev>
SUPPORT_EMAIL=haofu99@gmail.com
```

**Important Notes:**
- Replace `https://your-app.vercel.app` with your actual Vercel deployment URL
- Generate a secure `NEXTAUTH_SECRET` (you can use: `openssl rand -base64 32`)
- Add variables for all environments (Production, Preview, Development) or use "All Environments"

### 4. Configure Stripe Webhook

After deployment, you'll need to set up Stripe webhooks:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret and add it as `STRIPE_WEBHOOK_SECRET` in Vercel

### 5. Update Google OAuth Redirect URIs

If using Google OAuth, add your Vercel URLs to Google Cloud Console:
- Production: `https://your-app.vercel.app/api/auth/callback/google`
- Development: `http://localhost:3000/api/auth/callback/google`

### 6. Deploy

1. After adding environment variables, Vercel will automatically trigger a new deployment
2. Or manually trigger by clicking "Redeploy" in the Deployments tab
3. Monitor the build logs to ensure successful deployment

## 🔍 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Node.js version (Vercel auto-detects, but you can specify in `package.json`)

### Runtime Errors
- Check function logs in Vercel dashboard
- Verify all environment variables are correctly set
- Ensure Supabase and Stripe keys are valid

### Missing Environment Variables
- All variables from `env.example` must be set in Vercel
- Use exact variable names (case-sensitive)
- Redeploy after adding new variables

## 📝 Notes

- The `vercel.json` file has been simplified - environment variables are now managed in Vercel dashboard only
- All pages using `useSearchParams()` are wrapped in Suspense boundaries for proper static generation
- API routes using dynamic features are properly marked as dynamic

## ✅ Verification Checklist

Before going live, verify:
- [ ] All environment variables are set in Vercel
- [ ] Build completes successfully
- [ ] Application loads at your Vercel URL
- [ ] Authentication works (sign in/sign up)
- [ ] Stripe checkout works (if using payments)
- [ ] Webhooks are configured and working
- [ ] Email functionality works (if using Resend)
- [ ] Database connections work (Supabase)

Happy deploying! 🎉

