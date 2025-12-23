import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Validate Stripe secret key format
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
  console.warn('Warning: STRIPE_SECRET_KEY does not start with sk_test_ or sk_live_');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Price ID for the subscription (set this in your Stripe Dashboard)
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';

// Validate Price ID format if set
if (STRIPE_PRICE_ID && !STRIPE_PRICE_ID.startsWith('price_')) {
  console.warn('Warning: STRIPE_PRICE_ID does not start with price_');
}

