# Stripe Payment Integration Setup Guide

## Overview

The app now integrates with Stripe for secure payment processing. Users can upgrade from trial to paid plans through Stripe Checkout.

## Prerequisites

1. Stripe account (sign up at https://stripe.com)
2. Stripe CLI installed (for local webhook testing)
3. Environment variables configured

## Step 1: Stripe Account Setup

### 1.1 Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)

### 1.2 Create Product and Price

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**
3. Fill in:
   - **Name**: "AI Translate Paid Plan"
   - **Description**: "Monthly subscription for unlimited tokens"
4. Click **Add price**:
   - **Price type**: Recurring
   - **Billing period**: Monthly
   - **Price**: $9.99 (or your desired amount)
   - **Currency**: USD
5. Click **Save product**
6. **Copy the Price ID** (starts with `price_`)

### 1.3 Set Up Webhooks

1. Go to **Developers → Webhooks**
2. Click **+ Add endpoint**
3. For local development:
   - Use Stripe CLI (see Step 2)
4. For production:
   - **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
   - **Description**: "AI Translate payment webhooks"
   - **Events to listen to**:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_`)

## Step 2: Stripe CLI Setup (Local Development)

### 2.1 Extract Stripe CLI

The Stripe CLI has been extracted to:
```
C:\Users\haofu\Downloads\stripe-cli\
```

### 2.2 Add to PATH (Optional but Recommended)

1. Copy `stripe.exe` to a permanent location (e.g., `C:\Tools\stripe\`)
2. Add to Windows PATH:
   - Open **System Properties** → **Environment Variables**
   - Edit **Path** variable
   - Add: `C:\Tools\stripe\` (or your chosen path)
   - Click **OK**

### 2.3 Login to Stripe CLI

```bash
stripe login
```

This will open a browser to authenticate.

### 2.4 Forward Webhooks Locally

In a separate terminal, run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will:
- Forward webhook events to your local server
- Display the webhook signing secret (starts with `whsec_`)
- Show all webhook events in real-time

**Important**: Use the webhook secret shown by this command in your `.env.local` for local development.

## Step 3: Environment Variables

Add these to your `.env.local`:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe CLI or Dashboard
STRIPE_PRICE_ID=price_...        # From Product/Price creation
```

### For Local Development:
- Use test mode keys (`pk_test_`, `sk_test_`)
- Use webhook secret from `stripe listen` command

### For Production:
- Use live mode keys (`pk_live_`, `sk_live_`)
- Use webhook secret from Stripe Dashboard
- Update `NEXT_PUBLIC_BASE_URL` to your production domain

## Step 4: Test the Integration

### 4.1 Test Cards

Stripe provides test cards for testing:

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Decline:**
- Card: `4000 0000 0000 0002`
- Use same expiry/CVC/ZIP as above

**Requires Authentication:**
- Card: `4000 0027 6000 3184`

### 4.2 Test Flow

1. Start your dev server: `npm run dev`
2. Start Stripe CLI webhook forwarding: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Sign in to your app
4. Navigate to `/upgrade`
5. Click "Upgrade to Paid Plan"
6. Use test card `4242 4242 4242 4242`
7. Complete checkout
8. Verify:
   - Redirects back to `/upgrade?success=true`
   - User status updated to "paid" in database
   - Token limit increased to 10,000,000

### 4.3 Verify Webhooks

Check the Stripe CLI terminal for webhook events:
- `checkout.session.completed` should appear
- Check server logs for successful user update

## Step 5: Production Deployment

### 5.1 Switch to Live Mode

1. In Stripe Dashboard, toggle **Test mode** to **Live mode**
2. Get live API keys
3. Update `.env.local` (or production environment variables):
   - Use `pk_live_` and `sk_live_` keys
   - Use production webhook secret

### 5.2 Configure Production Webhook

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events (same as Step 1.3)
4. Copy the signing secret
5. Add to production environment variables

### 5.3 Deploy

Deploy your app with production environment variables set.

## Architecture

### Files Created

1. **`lib/stripe.ts`**
   - Stripe client initialization
   - Price ID configuration

2. **`app/api/create-checkout-session/route.ts`**
   - Creates Stripe Checkout session
   - Returns checkout URL for redirect

3. **`app/api/webhooks/stripe/route.ts`**
   - Handles Stripe webhook events
   - Updates user status on payment success
   - Handles subscription updates/cancellations

4. **`app/upgrade/page.tsx`** (Updated)
   - Stripe Checkout integration
   - Handles success/cancel redirects

### Payment Flow

1. User clicks "Upgrade to Paid Plan"
2. Frontend calls `/api/create-checkout-session`
3. Backend creates Stripe Checkout session
4. User redirected to Stripe Checkout
5. User completes payment
6. Stripe sends webhook to `/api/webhooks/stripe`
7. Webhook handler updates user to "paid" status
8. User redirected back to app with success message

## Webhook Events Handled

- **`checkout.session.completed`**: User completes payment → Upgrade to paid
- **`customer.subscription.updated`**: Subscription status changes → Update user status
- **`customer.subscription.deleted`**: Subscription cancelled → Downgrade to trial
- **`invoice.payment_succeeded`**: Recurring payment succeeds → Extend subscription
- **`invoice.payment_failed`**: Payment fails → Log for handling

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using Stripe signatures
2. **Server-Side Only**: Secret keys never exposed to client
3. **Metadata**: User ID stored in checkout session metadata for webhook processing
4. **Error Handling**: Comprehensive error handling and logging

## Troubleshooting

### Webhook Not Received

1. Check Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Verify webhook secret matches
3. Check server logs for errors
4. Verify endpoint URL is correct

### Payment Succeeds But User Not Upgraded

1. Check webhook handler logs
2. Verify `checkout.session.completed` event received
3. Check database for user update
4. Verify user ID in session metadata

### Checkout Session Creation Fails

1. Verify `STRIPE_SECRET_KEY` is set
2. Verify `STRIPE_PRICE_ID` is set and valid
3. Check API key permissions
4. Check server logs for detailed errors

## Next Steps

- [ ] Set up subscription management page
- [ ] Add cancel subscription functionality
- [ ] Add payment history view
- [ ] Set up email notifications for payment events
- [ ] Add analytics for conversion tracking

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)

