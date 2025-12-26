import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variables
 * Only works in development mode
 * Remove or protect this in production!
 */
export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  // Check for Stripe-related environment variables
  const envCheck = {
    stripe: {
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || 'NOT SET',
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'NOT SET',
      hasPriceId: !!process.env.STRIPE_PRICE_ID,
      priceIdValue: process.env.STRIPE_PRICE_ID || 'NOT SET',
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) || 'NOT SET',
    },
    nextAuth: {
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
      expectedCallbackUrl: process.env.NEXTAUTH_URL 
        ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
        : 'NOT SET (NEXTAUTH_URL missing)',
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    },
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(envCheck, { status: 200 });
}

