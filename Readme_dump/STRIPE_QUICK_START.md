# Stripe Integration - Quick Start

## Quick Setup Checklist

### 1. Stripe Dashboard Setup (5 minutes)

- [ ] Create Stripe account at https://stripe.com
- [ ] Get API keys from Dashboard → Developers → API keys
- [ ] Create product: "AI Translate Paid Plan"
- [ ] Create monthly price: $9.99
- [ ] Copy Price ID (starts with `price_`)

### 2. Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe CLI (see below)
```

### 3. Local Webhook Testing

**Terminal 1** - Start dev server:
```bash
npm run dev
```

**Terminal 2** - Forward webhooks:
```bash
cd C:\Users\haofu\Downloads\stripe-cli
.\stripe.exe login
.\stripe.exe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret shown and add to `.env.local`

### 4. Test Payment

1. Go to http://localhost:3000/upgrade
2. Click "Upgrade to Paid Plan"
3. Use test card: `4242 4242 4242 4242`
4. Expiry: `12/34`, CVC: `123`, ZIP: `12345`
5. Complete checkout
6. Verify redirect and user upgrade

## Stripe CLI Location

The Stripe CLI is extracted to:
```
C:\Users\haofu\Downloads\stripe-cli\stripe.exe
```

To use it from anywhere, add to PATH or use full path.

## Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

## Files Created

- `lib/stripe.ts` - Stripe client
- `app/api/create-checkout-session/route.ts` - Checkout creation
- `app/api/webhooks/stripe/route.ts` - Webhook handler
- `app/upgrade/page.tsx` - Updated with Stripe

## Need Help?

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed instructions.

