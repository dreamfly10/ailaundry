# AI Article Translation & Insight App

## Quick Summary

A modern web application that translates articles to Chinese and generates insights using OpenAI. Features include:

- ✅ **Token-based Usage**: Trial users get 1,000 tokens, enforced strictly; Paid users get 1,000,000 tokens/month
- ✅ **Subscription Detection**: Automatically detects paywalled content with guided workflow
- ✅ **Error Handling**: User-friendly error messages with actionable guidance
- ✅ **Modern UI**: Responsive design with gradient effects and smooth animations
- ✅ **Optional Google Auth**: Works with or without Google OAuth
- ✅ **Supabase Integration**: PostgreSQL database with proper RLS configuration
- ✅ **Stripe Payment Integration**: Secure payment processing with Stripe Checkout
- ✅ **Article History**: Sidebar displaying all previously processed articles (ChatGPT-style)
- ✅ **Support System**: Contact form with Resend email integration
- ✅ **Auto Sign-Out**: Automatic logout after 5 minutes of inactivity with warning
- ✅ **Article Title Extraction**: Intelligent title extraction from URLs

## Overview

This application allows users to input an article link or raw text, automatically translate it into Chinese, and generate in-depth interpretation and insights using the OpenAI API. The app features a modern, user-friendly interface with comprehensive error handling, token-based usage tracking, and intelligent subscription detection for paywalled content.

## Core Capabilities

- **User Authentication**: Email/Password registration with optional Google SSO
- **Article Processing**: URL extraction or direct text input
- **High-Quality Translation**: AI-powered translation to Simplified Chinese
- **Contextual Insights**: In-depth analysis and interpretation for Chinese-speaking audiences with multiple writing style options
- **Token Management**: Usage tracking with trial (1,000 tokens) and paid tiers (1,000,000 tokens/month)
- **Payment Processing**: Stripe Checkout integration for secure subscription payments
- **Subscription Detection**: Automatic detection of paywalled content with guided workflow
- **Error Handling**: User-friendly error messages with actionable guidance
- **Modern UI**: Responsive design with gradient effects and smooth animations
- **Style System**: 5 writing style archetypes for natural, engaging insights (warm bookish, life reflection, contrarian, education, science)
- **Article History**: Persistent storage and sidebar display of all processed articles (similar to ChatGPT)
- **Support System**: Contact form integrated with Resend email service
- **Auto Sign-Out**: Security feature that automatically signs out users after 5 minutes of inactivity
- **Article Title Extraction**: Intelligent extraction of article titles from web pages 

## Tech Stack

- **Frontend**: Next.js 14 with React, TypeScript
- **Backend**: Next.js API routes
- **Authentication**: NextAuth.js (Email/Password + optional Google OAuth)
- **AI**: OpenAI API (GPT-4o-mini for translation, GPT-4o for insights)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Styling**: Modern CSS with design system (CSS variables, gradients, responsive)
- **Infra**: Vercel-ready

## High-Level Architecture

```
User Authentication (NextAuth)
   ↓
Token Limit Check (Trial: 1,000 tokens / Paid: 1,000,000 tokens)
   ↓
User Input (URL or Text)
   ↓
Content Extraction / Title Extraction / Subscription Detection
   ↓
[If Subscription Required]
   ↓
Show Subscription Workflow Component
   ↓
[User Pastes Content]
   ↓
Token Estimation & Validation
   ↓
OpenAI Translation (GPT-4o-mini)
   ↓
OpenAI Insight Generation (GPT-4o) with Selected Style
   ↓
Token Consumption & Update
   ↓
Save Article to Database (Title, Content, Translation, Insights, Metadata)
   ↓
Result Rendering with Error Handling
   ↓
Article Appears in History Sidebar
```

## User Flow

### Standard Flow
1. User signs up or signs in (Email/Password or optional Google SSO)
2. System checks token availability (Trial: 1,000 tokens / Paid: 1,000,000 tokens)
3. User sees homepage with:
   - Token Usage component (showing user status: Trial Plan or Paid Plan)
   - Article History sidebar (left side, showing previously processed articles)
   - Article Processor (main content area)
   - Paid Plan Benefits (only shown for trial users)
4. User pastes article URL or raw text
5. System extracts content and article title from URL (if applicable)
6. If subscription required → Show subscription workflow
7. System estimates token usage and validates availability
8. User selects writing style (optional, defaults to "warm bookish")
9. System translates content into Chinese (GPT-4o-mini)
10. System generates insights and interpretation (GPT-4o) using selected style
11. System consumes tokens and updates usage
12. System saves article to database (title, content, translation, insights, metadata)
13. User views translation and insights
14. Article automatically appears in Article History sidebar

### Subscription-Required Flow
1. User pastes URL requiring subscription
2. System detects paywall/subscription requirement
3. System displays subscription workflow component
4. User opens article in new tab and signs in
5. User copies article content
6. User pastes content into provided text area
7. System processes pasted content (continues from step 6 above)

### Token Limit Flow
1. User attempts to process article
2. System checks token availability
3. If insufficient tokens → Display upgrade prompt
4. User upgrades to paid plan (1M tokens/month)
5. User continues processing

## Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (OPTIONAL - app works without it)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_ID=your_stripe_price_id

# Resend Email Configuration (for Support Form)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=AI Translate <onboarding@resend.dev>
SUPPORT_EMAIL=haofu99@gmail.com
```

### Required vs Optional
- **Required**: OpenAI API key, Supabase credentials (URL, anon key, service role key), NextAuth secret
- **Optional**: Google OAuth credentials (app works with email/password only if not provided)
- **Payment**: Stripe credentials required for payment functionality (app works without it, but upgrade won't process payments)
- **Email**: Resend credentials required for support form (app works without it, but support form won't send emails)

## API Endpoints

### `POST /api/process-article`

Requires authentication. Processes an article and returns translation and insights. Includes token validation and subscription detection.

**Request**

```json
{
  "inputType": "url | text",
  "content": "string",
  "style": "warmBookish | lifeReflection | contrarian | education | science" // optional
}
```

**Success Response**

```json
{
  "translation": "string",
  "insights": "string",
  "requiresSubscription": false,
  "style": "warmBookish",
  "tokensUsed": 150,
  "tokensRemaining": 850,
  "tokensTotal": 150,
  "tokenLimit": 1000
}
```

**Error Responses**

```json
// Token limit reached
{
  "error": "TOKEN_LIMIT_REACHED",
  "message": "You've used all your free tokens...",
  "tokensUsed": 1000,
  "limit": 1000,
  "upgradeRequired": true
}

// Subscription required
{
  "error": "SUBSCRIPTION_REQUIRED",
  "message": "This article requires a subscription...",
  "requiresSubscription": true,
  "url": "https://..."
}

// Insufficient tokens
{
  "error": "INSUFFICIENT_TOKENS",
  "message": "This article requires approximately X tokens...",
  "estimatedTokens": 500,
  "tokensRemaining": 200,
  "upgradeRequired": true
}
```

### `POST /api/auth/register`

Creates a new user account with email and password.

**Request**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Optional Name"
}
```

### `POST /api/create-checkout-session`

Creates a Stripe Checkout session for subscription payment. Requires authentication.

**Success Response**

```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Error Response**

```json
{
  "error": "Unauthorized",
  "message": "Please sign in to continue"
}
```

### `POST /api/webhooks/stripe`

Stripe webhook endpoint for payment events. Handles:
- `checkout.session.completed` - Upgrades user to paid
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Downgrades user to trial
- `invoice.payment_succeeded` - Extends subscription
- `invoice.payment_failed` - Logs payment failure

### `GET /api/token-usage`

Returns current token usage statistics for authenticated user.

**Response**

```json
{
  "allowed": true,
  "tokensUsed": 150,
  "tokensRemaining": 850,
  "limit": 1000,
  "userType": "trial"
}
```

### `GET /api/articles`

Returns list of articles for authenticated user. Supports pagination via `limit` query parameter.

**Query Parameters**
- `limit` (optional): Maximum number of articles to return (default: 50)

**Response**

```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "Article Title",
      "createdAt": "2024-01-01T00:00:00Z",
      "inputType": "url",
      "sourceUrl": "https://example.com/article"
    }
  ]
}
```

**Error Responses**
- `DATABASE_NOT_SETUP`: Articles table doesn't exist
- `DATABASE_UNAVAILABLE`: Database connection error

### `GET /api/articles/[id]`

Returns a single article by ID. Ensures article belongs to authenticated user.

**Response**

```json
{
  "article": {
    "id": "uuid",
    "title": "Article Title",
    "originalContent": "Original text...",
    "translatedContent": "Translated text...",
    "insights": "Insights text...",
    "inputType": "url",
    "sourceUrl": "https://example.com/article",
    "style": "warmBookish",
    "tokensUsed": 150,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### `DELETE /api/articles`

Deletes an article by ID. Requires authentication and ownership.

**Query Parameters**
- `id`: Article ID to delete

**Response**

```json
{
  "success": true
}
```

### `POST /api/support`

Sends a support request email via Resend. No authentication required.

**Request**

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "subject": "Support Subject",
  "message": "Support message content"
}
```

**Response**

```json
{
  "success": true,
  "message": "Support request sent successfully"
}
```

### Authentication Routes

- `GET /api/auth/signin` - Sign in page
- `GET /api/auth/signout` - Sign out
- `GET /api/auth/[...nextauth]` - NextAuth.js handler
- `POST /api/auth/register` - User registration

## Authentication Methods

### 1. Email/Password Registration

Users can create an account with:
- Email address
- Password (minimum 6 characters)
- Optional name

**Default User Type**: Trial (1,000 tokens)

### 2. Google SSO (Optional)

Users can sign in with their Google account using OAuth 2.0. This feature is **optional** - if Google OAuth credentials are not provided in environment variables, the app works with email/password authentication only. The Google sign-in button automatically appears/disappears based on configuration.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Supabase**
   - Create account at https://supabase.com
   - Create new project
   - Run SQL from `supabase/schema.sql` in SQL Editor
   - Get project URL, anon key, and **service role key** from Settings → API

3. **Set Up Environment Variables**
   - Copy `env.example` to `.env.local`
   - Add all required environment variables:
     - OpenAI API key
     - Supabase URL, anon key, and **service role key** (required for server-side operations)
     - NextAuth secret (generate with `openssl rand -base64 32`)
     - Google OAuth credentials (optional)

4. **Get API Keys**
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Supabase**: Dashboard → Settings → API
     - Use **anon public** key (starts with `eyJ`) for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Use **service_role** key (starts with `eyJ`) for `SUPABASE_SERVICE_ROLE_KEY`
   - **Google OAuth** (optional): https://console.cloud.google.com/apis/credentials
   - **NextAuth Secret**: Generate with `openssl rand -base64 32`

5. **Run Development Server**
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [SETUP.md](./SETUP.md) and [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## Token Management

### Trial Users
- **Token Limit**: 1,000 tokens
- **Enforcement**: Strict - cannot process articles if limit reached
- **Upgrade Prompt**: Automatic when limit reached or insufficient tokens
- **Usage Tracking**: Real-time display with progress bar

### Paid Users
- **Token Limit**: 1,000,000 tokens per month
- **Monthly Reset**: Token usage resets to 0 on each subscription renewal
- **Subscription**: Monthly recurring subscription via Stripe
- **Price**: $9.99/month (configurable)
- **Usage Tracking**: Tracked and enforced - users cannot exceed 1M tokens per month
- **Subscription Enforcement**: Token limit enforced based on active subscription status
- **Payment**: Secure payment processing through Stripe Checkout

### Token Calculation
- Rough estimation: ~4 characters = 1 token
- Calculated for: Input text + Translation + Insights
- Pre-validation: System estimates tokens before processing

## Subscription Detection & Handling

### Detection Methods
- HTML class/id attributes containing paywall keywords
- Text content analysis for subscription messages
- Content length validation (short content = likely paywalled)

### User Workflow
1. System detects subscription requirement
2. Displays `SubscriptionRequired` component with:
   - Clear explanation message
   - Button to open article in new tab
   - Step-by-step instructions
   - Text area for pasted content
3. User signs in to source website
4. User copies article content
5. User pastes content into app
6. System automatically processes pasted content

## Error Handling System

### Centralized Error Handler (`lib/error-handler.ts`)
- Standardized error codes
- User-friendly messages
- Actionable guidance
- Industry best practices

### Error Types
- **Authentication**: Unauthorized, session expired
- **Token**: Limit reached, insufficient tokens
- **Content**: Extraction failed, subscription required, invalid URL, empty content
- **API**: OpenAI errors, network errors
- **Validation**: Invalid input

### Error Display
- Color-coded (red for errors, yellow for warnings)
- Clear messaging with emoji indicators
- Actionable buttons (e.g., "Upgrade to Paid Plan")
- Context-aware help text

## UI/UX Features

### Modern Design System
- **Colors**: Primary (#6366f1), secondary, accent colors
- **Typography**: Clear hierarchy with Inter font
- **Shadows**: Multiple elevation levels
- **Spacing**: Consistent spacing scale
- **Responsive**: Mobile-friendly layout

### Components
- **Hero Section**: Gradient text, feature cards, CTA buttons (shown to non-authenticated users)
- **Navigation**: Sticky header with smooth transitions, includes Support button
- **Token Usage Component**: Displays current usage with progress bar, shows user status badge (Trial Plan / Paid Plan), includes Upgrade button for trial users
- **Article History Sidebar**: Left sidebar (280px) displaying all processed articles in ChatGPT-style layout
- **Article Processor**: Main content area for input and results
- **Paid Plan Benefits**: Only shown to trial users (hidden for paid users)
- **Support Form**: Modal form accessible from navigation
- **Forms**: Modern input styling with focus states
- **Cards**: Elevated design with hover effects
- **Error Messages**: User-friendly with actionable guidance

### User Experience
- Loading states for all async operations
- Smooth transitions and animations
- Clear visual feedback
- Accessible design patterns
- Auto sign-out warning at 4 minutes, sign-out at 5 minutes of inactivity
- Article history automatically refreshes after processing new article
- Click on article in history to load and view it

## Payment System

### Stripe Integration

The app uses Stripe Checkout for secure payment processing:

- **Checkout Flow**: User clicks upgrade → Stripe Checkout → Payment → Webhook updates user
- **Webhook Security**: All webhooks verified with Stripe signatures
- **Subscription Management**: Automatic handling of renewals, cancellations, and failures
- **Test Mode**: Full testing support with Stripe test cards

### Setup Required

1. Stripe account and API keys
2. Product and Price creation in Stripe Dashboard
3. Webhook endpoint configuration
4. Environment variables (see Environment Variables section)

For detailed setup instructions, see [STRIPE_SETUP.md](./STRIPE_SETUP.md)

## Article History Feature

### Overview
The app stores all processed articles in a database table and displays them in a sidebar similar to ChatGPT's conversation history.

### Features
- **Persistent Storage**: All processed articles are saved to `articles` table in Supabase
- **Sidebar Display**: Left sidebar (280px) shows article history
- **Article Metadata**: Each article stores:
  - Title (extracted from URL or generated from content)
  - Original content
  - Translated content
  - Insights
  - Input type (URL or text)
  - Source URL (if applicable)
  - Writing style used
  - Tokens consumed
  - Creation timestamp
- **Article Loading**: Click on any article in history to load and view it
- **Article Deletion**: Delete button (×) on each article item
- **Empty State**: Friendly message when no articles exist
- **Error Handling**: Graceful handling of database errors with user-friendly messages

### Database Schema
See `supabase/articles_schema.sql` for complete schema definition.

## Support System

### Overview
Integrated support form that sends emails via Resend API.

### Features
- **Support Button**: Accessible from navigation bar (💬 Support)
- **Modal Form**: Opens as modal overlay
- **Form Fields**: Name, Email, Subject, Message (all required)
- **Email Integration**: Uses Resend API to send emails to configured support email
- **Validation**: Client and server-side validation
- **Success Feedback**: Shows success message and auto-closes after 2 seconds

### Configuration
- `RESEND_API_KEY`: Resend API key
- `RESEND_FROM_EMAIL`: Sender email address
- `SUPPORT_EMAIL`: Recipient email address (defaults to haofu99@gmail.com)

## Auto Sign-Out Feature

### Overview
Security feature that automatically signs out users after 5 minutes of inactivity.

### Behavior
- **Inactivity Detection**: Tracks mouse movements, clicks, keyboard input, scroll, touch events
- **Warning**: Shows warning notification at 4 minutes ("You will be signed out in 1 minute due to inactivity")
- **Auto Sign-Out**: Automatically signs out user at 5 minutes
- **Timer Reset**: Any user activity resets the timer
- **Scope**: Only applies to signed-in users

## Article Title Extraction

### Overview
Intelligent extraction of article titles from web pages when processing URLs.

### Process
1. Tries multiple HTML selectors in order of preference:
   - `h1.article-title`
   - `h1.post-title`
   - `h1.entry-title`
   - `article h1`
   - `[role="article"] h1`
   - `h1`
   - `<title>` tag
2. Cleans extracted title (removes extra whitespace, site name separators)
3. Limits to 200 characters
4. Falls back to page title if no article title found
5. Falls back to hostname + URL snippet if no title available

## Future Enhancements

- Bulk processing
- Export formats (PDF, DOCX)
- User profiles and preferences
- Team/organization accounts
- Advanced analytics dashboard
- Multi-language support (beyond Chinese)
- Subscription management page (cancel, update payment method)
- Payment history view
- Article search and filtering
- Article sharing capabilities

## Development Notes

- Translation and insight generation are intentionally separated
- Prompt quality is critical — iterate carefully
- **Style System**: 5 writing archetypes configured in `lib/prompt-styles.ts` - easily extensible
- **Style Selection**: Users can choose writing style via UI dropdown; defaults to "warmBookish"
- **Temperature Control**: Each style has optimized temperature (0.7-0.85) for best results
- **Stripe Integration**: Secure payment processing with webhook-based user upgrades
- **Article History**: All processed articles are saved to database (optional feature - app works even if table doesn't exist)
- **Title Extraction**: Intelligent title extraction from URLs improves article history UX
- Token usage is tracked per request
- Database uses Supabase with Row Level Security (RLS)
- Server-side operations use service role key to bypass RLS
- Google OAuth is optional - app gracefully handles missing credentials
- Resend email is optional - app works without it, but support form won't send emails
- Error handling follows industry best practices
- All user-facing errors are translated to friendly messages
- **User Status Display**: Token Usage component shows "Trial Plan" or "Paid Plan" badge
- **Conditional UI**: Paid Plan Benefits only shown to trial users
- **Auto Sign-Out**: Implemented via React hook (`useAutoSignOut`) with 5-minute timeout

---

## Writing Style System

The app supports 5 distinct writing style archetypes for insight generation, each designed to produce natural, engaging content that feels less robotic:

### Available Styles

1. **温暖书卷风 (Warm Bookish)** - Default
   - Inspired by 十点读书
   - Warm, emotional, longform style
   - Empathetic tone with "陪你读/陪你想" companionship feel
   - Uses second-person address, sensory scenes, gentle transitions
   - Temperature: 0.85, Max Tokens: 2500

2. **人生思考+实用智慧 (Life Reflection)**
   - Inspired by 有书
   - Life lessons + practical wisdom
   - Calm, encouraging, slightly didactic but friendly
   - Clear "problem—cause—method" structure
   - Temperature: 0.75, Max Tokens: 2200

3. **反直觉评论+犀利逻辑 (Contrarian)**
   - Inspired by 远方青木
   - Sharp, contrarian, logical
   - Confident, direct, occasionally sarcastic
   - Uses "If...then..." reasoning and strong logic chains
   - Temperature: 0.8, Max Tokens: 2300

4. **教育/写作/互联网观察 (Education)**
   - Inspired by 玉树芝兰
   - Educational, methodological, reflective
   - Rational, thoughtful, practical frameworks
   - Clear models and teachable methods
   - Temperature: 0.75, Max Tokens: 2400

5. **科学解释+怀疑思维 (Science)**
   - Inspired by 果壳
   - Science explainer, skeptical thinking
   - Curious, precise, playful-but-rigorous
   - Separates "what we know" vs "what's uncertain"
   - Temperature: 0.7, Max Tokens: 2500

### Style Configuration

Styles are configured in `lib/prompt-styles.ts` with:
- Tone guidelines
- Structure templates
- Rhetorical devices
- Sentence style rules
- What to avoid
- Temperature and token limits

Users can select their preferred style via a dropdown in the article processor UI.

## OpenAI Prompt Templates (Production-Grade)

These are cleanly separated, debuggable, and scalable.

### Prompt 1 — Translation

#### System Prompt

```
You are a professional multilingual translator.

Your task:
- Translate the provided content into Simplified Chinese
- Preserve meaning, tone, and structure
- Keep paragraph breaks, headings, and quotes
- Do NOT summarize or add commentary
- Do NOT omit information
- Use clear, natural Chinese suitable for educated readers

Output ONLY the translated text.
```

#### User Prompt (Translation)

```
Translate the following content into Simplified Chinese:

{{ARTICLE_TEXT}}
```

### Prompt 2 — Insight & Interpretation

**Note**: This prompt is now style-aware and dynamically generated based on the selected style archetype. The system prompt and user prompt are constructed from the style configuration in `lib/prompt-styles.ts`.

#### System Prompt (Style-Aware)

The system prompt is generated based on the selected style and includes:
- Core goal and description
- Tone guidelines
- Structure requirements (opening, body, ending)
- Rhetorical devices to use
- Sentence style rules
- What to avoid
- Important guidelines for natural, engaging writing

#### User Prompt (Style-Aware)

The user prompt is generated based on the selected style and includes:
- Instructions to write in the selected style
- Article content to analyze
- Structure requirements (3 main sections with subheadings)
- Reminder to write naturally and avoid robotic language
- Requirement for 3 actionable suggestions or questions at the end

#### Default Style

If no style is specified, the system defaults to "warmBookish" (温暖书卷风) for a warm, engaging reading experience.

### Style Selection

Users can select from 5 predefined styles via a dropdown in the article processor. Each style:
- Uses optimized temperature settings for that style
- Has appropriate token limits
- Follows specific structural and rhetorical guidelines
- Produces natural, engaging content that feels human-written

The style system is extensible - new styles can be added by updating `lib/prompt-styles.ts`.

## Prompt Chaining Recommendation

Always run prompts in this order:

1. Raw text → Translation prompt
2. Translation output → Insight prompt

This improves:
- Output quality
- Debuggability
- Cost control

## Cost Control & Best Practices

### Token Management
- **Trial Limit**: 1,000 tokens enforced strictly
- **Pre-validation**: Estimate tokens before processing
- **Real-time Tracking**: Display usage with progress indicators
- **Upgrade Path**: Clear upgrade prompts when limit reached

### Error Prevention
- Validate token availability before processing
- Check content length and validity
- Detect subscription requirements early
- Provide clear error messages with solutions

### Performance
- Efficient content extraction
- Optimized API calls
- Responsive UI with loading states
- Error recovery mechanisms

### Monitoring
- Track token usage per user
- Log API errors for debugging
- Monitor subscription detection accuracy
- Analyze user behavior patterns
