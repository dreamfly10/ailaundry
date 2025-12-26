# Fixing Google OAuth on Vercel Preview Deployments

## Problem

When testing on Vercel, you may see this error:
```
Error 400: redirect_uri_mismatch
redirect_uri=https://ai-translation1-XXXXX-XXXXX.vercel.app/api/auth/callback/google
```

This happens because:
1. Vercel creates **preview deployments** with unique URLs for each branch/PR
2. NextAuth was auto-detecting the deployment URL from request headers instead of using `NEXTAUTH_URL`
3. These preview URLs aren't authorized in Google Cloud Console

## ✅ Code Fix Applied

The code has been updated to explicitly use `NEXTAUTH_URL` in `lib/auth.ts`:
```typescript
export const authOptions: NextAuthOptions = {
  url: process.env.NEXTAUTH_URL, // Forces NextAuth to use NEXTAUTH_URL
  // ... rest of config
}
```

This ensures NextAuth always uses the production URL for OAuth callbacks, even on preview deployments.

## Solutions

### Solution 1: Add Preview URL to Google Cloud Console (Quick Fix)

1. **Copy the exact preview URL from the error message**
   - Example: `https://ai-translation1-b070xkod6-howards-projects-d269c06a.vercel.app/api/auth/callback/google`

2. **Add it to Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to: **APIs & Services → Credentials**
   - Click your OAuth 2.0 Client ID
   - Under "Authorized redirect URIs", click **"+ Add URI"**
   - Paste the preview URL
   - Click **"Save"**

3. **Wait 1-2 minutes** for changes to propagate

4. **Try signing in again**

### Solution 2: Use Production URL for All Environments (Recommended) ✅

**This is now the default behavior after the code fix!**

1. **In Vercel Dashboard:**
   - Go to: **Settings → Environment Variables**
   - Find `NEXTAUTH_URL`
   - Set scope to **"All Environments"** (or "Production" only - both work now)
   - Set value to: `https://ai-translation1.vercel.app`
   - Click **"Save"**

2. **Redeploy your app:**
   - Go to **Deployments**
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger a redeploy

3. **Result:** All deployments (including previews) will now use the production callback URL because the code explicitly uses `NEXTAUTH_URL`

### Solution 3: Add Multiple Preview URLs (If Needed)

If you need preview deployments to work with their own URLs:

1. Each time you see a new preview URL in an error, add it to Google Cloud Console
2. Or add common Vercel preview URL patterns (if Google supports them)

## Current Authorized Redirect URIs

Make sure these are in Google Cloud Console:

✅ **Production:**
```
https://ai-translation1.vercel.app/api/auth/callback/google
```

✅ **Local Development:**
```
http://localhost:3000/api/auth/callback/google
```

✅ **Preview Deployment (add as needed):**
```
https://ai-translation1-XXXXX-XXXXX.vercel.app/api/auth/callback/google
```

## Verification

After fixing:

1. Try signing in with Google on your Vercel deployment
2. You should be redirected to Google's sign-in page
3. After signing in, you should be redirected back to your app
4. No more `redirect_uri_mismatch` errors

## Notes

- **Preview URLs are temporary** - They change for each branch/PR
- **Production URL is permanent** - Use Solution 2 for a permanent fix
- **Changes take 1-2 minutes** to propagate in Google's system
- **Always test on production URL** for the best experience

