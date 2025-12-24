# AI Article Translation & Insight App - Testing Scenarios

## Document Purpose
This document describes the expected system behavior for all major user flows, edge cases, and system interactions. Use this as a reference for testing, QA, and understanding system behavior.

**Last Updated**: Based on current codebase state  
**Version**: 1.0

---

## 1. Authentication & User Management

### 1.1 User Registration (Email/Password)

**Scenario**: New user creates account with email and password

**Expected Behavior**:
1. User navigates to homepage (not signed in)
2. User sees hero section with feature cards
3. User clicks "Sign Up" button
4. Registration form appears with fields:
   - Email (required)
   - Password (required, minimum 6 characters)
   - Name (optional)
5. User submits form with valid credentials
6. System creates user account in database with:
   - `user_type`: `'trial'`
   - `token_limit`: `1000`
   - `tokens_used`: `0`
   - `subscription_status`: `null`
7. User is automatically signed in
8. User is redirected to homepage
9. Homepage shows:
   - **Navigation**: "AI Translate" logo, Support button, user email/name, Sign Out button
   - **Layout**: Split view with Article History sidebar (left, 280px) and main content (right)
   - **Token Usage component**: Shows "Trial Plan" badge (orange/yellow), progress bar, "X / 1,000 tokens used", "Y tokens remaining", "Upgrade" button
   - **Article Processor**: Main content area with URL/Text toggle, input field, style selector, Process button
   - **Paid Plan Benefits section**: Visible below Article Processor (only for trial users)
   - **Article History sidebar**: Empty state showing "No articles yet" with friendly message

**Error Cases**:
- **Invalid email format**: Show error message "Please enter a valid email address"
- **Password too short**: Show error message "Password must be at least 6 characters"
- **Email already exists**: Show error message "An account with this email already exists"
- **Database error**: Show generic error "Unable to create account. Please try again later."

---

### 1.2 User Sign In (Email/Password)

**Scenario**: Existing user signs in with email and password

**Expected Behavior**:
1. User navigates to sign-in page (`/auth/signin`)
2. Sign-in form displays:
   - Email field
   - Password field
   - "Sign In" button
   - "Sign in with Google" button (only if Google OAuth is configured)
   - Link to registration page
3. User enters valid email and password
4. User clicks "Sign In"
5. System validates credentials against database
6. If valid:
   - Session is created
   - Full page reload occurs (`window.location.href`) to ensure session is established
   - User is redirected to homepage
   - Homepage shows user-specific content based on user type
7. If invalid:
   - Error message appears: "Invalid email or password. Please try again."
   - User remains on sign-in page
   - Form fields are not cleared

**Important Notes**:
- Error message should NOT appear on initial page load
- Error message only shows after a failed sign-in attempt
- After successful sign-in, full page reload ensures session is properly loaded
- Google sign-in button dynamically appears/disappears based on environment configuration

---

### 1.3 Google OAuth Sign In (Optional)

**Scenario**: User signs in with Google account

**Expected Behavior**:
1. If `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured:
   - "Sign in with Google" button appears on sign-in page
2. If Google OAuth is NOT configured:
   - "Sign in with Google" button does NOT appear
   - App works normally with email/password only
3. User clicks "Sign in with Google"
4. User is redirected to Google OAuth consent screen
5. User grants permissions
6. Google redirects back to app with authorization code
7. System creates or updates user account:
   - If new user: Creates account with `user_type: 'trial'`, `token_limit: 1000`
   - If existing user: Updates last sign-in time
8. User is signed in and redirected to homepage

---

### 1.4 Auto Sign-Out (Inactivity Detection)

**Scenario**: User is inactive for 5 minutes

**Expected Behavior**:
1. User is signed in and active on the page
2. System tracks user activity (mouse movements, clicks, keyboard input, scroll, touch)
3. After 4 minutes of inactivity:
   - Warning notification appears: "You will be signed out in 1 minute due to inactivity"
   - Notification is dismissible
   - Notification appears as a banner/alert at top of page
4. If user becomes active (any tracked event):
   - Warning disappears immediately
   - Timer resets to 0
   - No sign-out occurs
5. If user remains inactive:
   - After 5 minutes total: User is automatically signed out
   - User is redirected to homepage (signed out state)
   - Session is cleared
   - User sees hero section (not signed in view)

**Activity Events Tracked**:
- `mousedown`
- `mousemove`
- `keypress`
- `scroll`
- `touchstart`
- `click`

**Important Notes**:
- Auto sign-out only applies to signed-in users
- Timer resets on any tracked activity
- Warning appears 1 minute before sign-out
- Auto sign-out is implemented via `useAutoSignOut` hook

---

## 2. Article Processing

### 2.1 Process Article from URL (Free Content)

**Scenario**: Trial user processes a free article from a URL

**Expected Behavior**:
1. User is signed in (trial user with tokens remaining)
2. User sees homepage with Article History sidebar and Article Processor
3. User selects "URL" input type (toggle button, centered text)
4. User pastes article URL (e.g., `https://example.com/article`)
5. User selects writing style from dropdown (optional, defaults to "Warm Bookish")
6. User clicks "Process Article"
7. System performs pre-validation:
   - Checks user authentication
   - Checks token availability
   - Estimates token usage
8. System extracts content from URL:
   - Fetches HTML from URL
   - Extracts article title using multiple selectors:
     1. `h1.article-title`
     2. `h1.post-title`
     3. `h1.entry-title`
     4. `article h1`
     5. `[role="article"] h1`
     6. `h1`
     7. `<title>` tag (with site name removal)
   - Falls back to hostname + URL snippet if no title found
   - Extracts main content (from `<article>`, `[role="article"]`, or body)
   - Detects paywall indicators
9. If content extraction succeeds:
   - System translates content to Chinese (GPT-4o-mini)
   - System generates insights (GPT-4o) using selected style
   - System calculates actual token usage:
     - Input tokens: `Math.ceil(articleText.length / 4)`
     - Translation tokens: `Math.ceil(translation.length / 4)`
     - Insights tokens: `Math.ceil(insights.length / 4)`
     - Total: Sum of all three
   - System consumes tokens and updates database
   - System saves article to database with:
     - Extracted title (or generated title)
     - Original content
     - Translated content
     - Insights
     - Input type: `'url'`
     - Source URL
     - Style used
     - Tokens used
     - Creation timestamp
   - Results are displayed:
     - Translation section
     - Insights section
     - Updated token usage (progress bar updates)
   - Article automatically appears in Article History sidebar with actual title
   - Article count in sidebar header updates

**Token Calculation**:
- Rough estimation: ~4 characters = 1 token
- Calculated for: Input text + Translation + Insights
- Pre-validation: System estimates tokens before processing

---

### 2.2 Process Article from URL (Paywalled Content)

**Scenario**: User attempts to process a paywalled article

**Expected Behavior**:
1. User pastes URL from known subscription site (WSJ, NYTimes, etc.)
2. User clicks "Process Article"
3. System detects subscription requirement:
   - Checks known subscription domains list
   - Analyzes HTML for paywall indicators (class/id attributes, text content)
   - Checks content length (short content = likely paywalled)
4. System returns error: `SUBSCRIPTION_REQUIRED` (status 402)
5. `SubscriptionRequired` component appears with:
   - Clear explanation: "This article requires a subscription to access"
   - Button to "Open Article in New Tab"
   - Step-by-step instructions:
     1. Click button to open article
     2. Sign in to the website
     3. Copy the article content
     4. Paste it into the text area below
   - Text area for pasted content
   - "Process Article" button for pasted content
6. User follows instructions and pastes content
7. User switches to "Raw Text" input type
8. User clicks "Process Article" again
9. System processes pasted content as raw text (continues from step 9 in 2.1)

**Known Subscription Sites**:
- wsj.com
- nytimes.com
- ft.com
- economist.com
- bloomberg.com
- washingtonpost.com
- theatlantic.com
- newyorker.com
- financialtimes.com

---

### 2.3 Process Article from Raw Text

**Scenario**: User processes article by pasting raw text

**Expected Behavior**:
1. User selects "Raw Text" input type (toggle button, centered text)
2. User pastes article content into text area
3. User selects writing style (optional, defaults to "Warm Bookish")
4. User clicks "Process Article"
5. System validates:
   - Content is not empty
   - Content is at least 50 characters
   - User has sufficient tokens
6. System processes content:
   - Translates to Chinese (GPT-4o-mini)
   - Generates insights (GPT-4o) with selected style
   - Calculates and consumes tokens
   - Saves article with:
     - Title: First 100 characters of text (truncated if longer, with "..." if exactly 100)
     - Input type: `'text'`
     - No source URL
     - Style used
     - Tokens used
7. Results displayed
8. Article appears in history sidebar

---

### 2.4 Writing Style Selection

**Scenario**: User selects different writing style for insights

**Available Styles**:
1. **Warm Bookish** (Default)
   - Temperature: 0.85
   - Max Tokens: 2500
   - Warm, emotional, longform style

2. **Life Reflection**
   - Temperature: 0.75
   - Max Tokens: 2200
   - Life lessons + practical wisdom

3. **Contrarian**
   - Temperature: 0.8
   - Max Tokens: 2300
   - Sharp, contrarian, logical

4. **Education**
   - Temperature: 0.75
   - Max Tokens: 2400
   - Educational, methodological

5. **Science**
   - Temperature: 0.7
   - Max Tokens: 2500
   - Science explainer, skeptical thinking

**Expected Behavior**:
1. User selects style from dropdown before processing
2. Selected style is used for insight generation
3. Style is saved with article in database
4. When article is loaded from history, style is preserved
5. Each style produces different tone and structure in insights

---

## 3. Token Management

### 3.1 Trial User Token Limits

**Scenario**: Trial user with 1,000 token limit

**Expected Behavior**:
1. New trial user starts with:
   - `token_limit`: `1000`
   - `tokens_used`: `0`
   - `tokens_remaining`: `1000`
2. Token Usage component displays:
   - "Trial Plan" badge (orange/yellow background, border)
   - Progress bar showing usage (visual indicator)
   - "X / 1,000 tokens used"
   - "Y tokens remaining"
   - "Upgrade" button (if tokens remaining)
3. As user processes articles:
   - Tokens are consumed and tracked
   - Usage updates in real-time after each article
   - Progress bar updates visually
   - Token count updates
4. When tokens are low:
   - Progress bar may show warning color
   - Upgrade prompts may appear
5. When tokens reach limit:
   - User cannot process new articles
   - Error: `TOKEN_LIMIT_REACHED` (status 403)
   - Message: "You have reached your trial token limit. Please upgrade to continue."
   - Upgrade button prominently displayed
   - Processing is blocked

**Token Calculation**:
- Rough estimation: ~4 characters = 1 token
- Calculated for: Input + Translation + Insights

---

### 3.2 Paid User Token Limits

**Scenario**: Paid user with 1,000,000 token monthly limit

**Expected Behavior**:
1. Paid user has:
   - `token_limit`: `1000000` (1M)
   - `tokens_used`: `0` (resets monthly)
   - `user_type`: `'paid'`
   - `subscription_status`: `'active'`
   - `subscription_expires_at`: Date in future
2. Token Usage component displays:
   - "Paid Plan" badge (green background, border)
   - Progress bar showing usage
   - "X / 1,000,000 tokens used"
   - "Y tokens remaining"
   - **NO upgrade button** (user is already paid)
3. Monthly reset:
   - On subscription renewal (webhook: `invoice.payment_succeeded` with `billing_reason: 'subscription_cycle'`)
   - `tokens_used` resets to `0`
   - `token_limit` remains `1000000`
   - User gets fresh 1M tokens
4. Token enforcement:
   - System checks subscription is active (`subscription_expires_at > now`)
   - System checks tokens remaining
   - If subscription expired: User downgraded to trial (via webhook)
   - If tokens exhausted: User cannot process articles (same as trial limit)

---

### 3.3 Token Pre-Validation

**Scenario**: System checks tokens before processing

**Expected Behavior**:
1. Before processing article:
   - System estimates token usage: `Math.ceil(inputTokens * 2.5)`
   - System checks user's remaining tokens
2. If insufficient tokens:
   - Error: `INSUFFICIENT_TOKENS` (status 403)
   - Message: "This article requires approximately X tokens, but you only have Y tokens remaining. Please upgrade to continue."
   - Processing is blocked
   - Upgrade prompt displayed
3. If sufficient tokens:
   - Processing proceeds
   - Actual tokens calculated after processing
   - Tokens consumed and updated
   - User sees updated token usage

**Estimation Formula**:
- Estimated total = `Math.ceil(inputTokens * 2.5)`
- Accounts for translation and insights expansion

---

## 4. Payment & Subscription

### 4.1 Upgrade to Paid Plan (Stripe Checkout)

**Scenario**: Trial user upgrades to paid plan

**Expected Behavior**:
1. User clicks "Upgrade" button (from Token Usage component or Paid Plan Benefits)
2. System creates Stripe Checkout session:
   - Includes user ID in metadata
   - Sets success URL: `/?upgrade=success`
   - Sets cancel URL: `/`
3. User is redirected to Stripe Checkout page
4. User enters payment information (test card: `4242 4242 4242 4242`)
5. User completes payment
6. Stripe redirects to success URL: `/?upgrade=success`
7. Homepage detects `upgrade=success` parameter:
   - After 2 seconds: URL cleaned to `/`
   - Page reloads to show updated status
8. Webhook `checkout.session.completed` is triggered:
   - System updates user:
     - `user_type`: `'paid'`
     - `token_limit`: `1000000`
     - `tokens_used`: `0` (reset)
     - `subscription_status`: `'active'`
     - `subscription_expires_at`: Current date + 30 days (from subscription period)
     - `payment_id`: Stripe session ID
9. User sees:
   - Updated token usage (1M limit)
   - "Paid Plan" badge (green)
   - **Paid Plan Benefits section is HIDDEN** (user is already paid)
   - No upgrade button in Token Usage

**Error Cases**:
- **Payment fails**: User remains on trial, error message shown
- **Webhook fails**: User may be charged but not upgraded (manual fix needed)
- **Stripe not configured**: Error: "Payment system not configured. Please contact support."

---

### 4.2 Subscription Renewal

**Scenario**: Paid user's subscription renews monthly

**Expected Behavior**:
1. Monthly subscription renewal occurs (Stripe automatic)
2. Stripe sends `invoice.payment_succeeded` webhook
3. System checks `billing_reason`:
   - If `subscription_cycle` or `subscription_update`:
     - `tokens_used` resets to `0`
     - `subscription_expires_at` extended by 30 days
     - `token_limit` remains `1000000`
4. User continues with fresh 1M tokens
5. No user action required

---

### 4.3 Subscription Cancellation

**Scenario**: User cancels subscription

**Expected Behavior**:
1. User cancels subscription in Stripe Dashboard (or via future UI)
2. Stripe sends `customer.subscription.deleted` webhook
3. System updates user:
   - `user_type`: `'trial'`
   - `token_limit`: `1000`
   - `tokens_used`: `0` (reset)
   - `subscription_status`: `'cancelled'`
   - `payment_id`: `null`
4. User is downgraded to trial
5. User sees:
   - Trial limits (1,000 tokens)
   - "Trial Plan" badge
   - Upgrade prompts
   - Paid Plan Benefits section appears again

---

### 4.4 Payment Failure

**Scenario**: Payment fails for subscription renewal

**Expected Behavior**:
1. Stripe sends `invoice.payment_failed` webhook
2. System logs the failure
3. User's subscription status may be updated (future enhancement)
4. User is notified (future enhancement)
5. Current behavior: User remains active until subscription expires

---

## 5. Article History

### 5.1 View Article History

**Scenario**: User views previously processed articles

**Expected Behavior**:
1. User is signed in
2. Article History sidebar appears on left side of homepage (280px width)
3. Sidebar header shows:
   - "Article History" title
   - Article count: "X articles" or "0 articles"
4. System fetches user's articles (limit: 50, ordered by `created_at DESC`)
5. If articles exist:
   - List displays with:
     - Article title (extracted or generated, truncated if long)
     - Relative time (e.g., "Just now", "5m ago", "2h ago", "3d ago", or date)
     - Link icon (🔗) if from URL
     - Delete button (×) on hover
   - Articles are clickable
   - Selected article is highlighted
6. If no articles:
   - Empty state displays:
     - 📄 icon (large, centered)
     - "No articles yet" message
     - "Process your first article using the form on the right to see it appear here!"
7. If database error:
   - **Table doesn't exist**: Shows empty state (no error message)
   - **Database unavailable**: Friendly error message: "Database Unavailable. We're having trouble connecting to the database. Your articles are safe, but we can't display them right now. Please try again later."

---

### 5.2 Load Article from History

**Scenario**: User clicks on article in history

**Expected Behavior**:
1. User clicks article in sidebar
2. Article becomes highlighted (selected state with primary color background)
3. Article content loads in main content area:
   - Original content displayed in input area
   - Translation displayed
   - Insights displayed
   - Style preserved (dropdown shows selected style)
   - Input type preserved (URL or Text toggle)
4. User can:
   - View the article
   - Process a new article (clears selection)
   - Delete the article

---

### 5.3 Delete Article from History

**Scenario**: User deletes an article

**Expected Behavior**:
1. User hovers over article in sidebar
2. Delete button (×) appears
3. User clicks delete button
4. Confirmation dialog: "Are you sure you want to delete this article?"
5. If confirmed:
   - Article is deleted from database
   - Article removed from sidebar immediately
   - Article count updates
   - If deleted article was selected: Selection cleared, main content cleared
6. If cancelled: No action

---

### 5.4 Article Title Extraction

**Scenario**: System extracts article title from URL

**Expected Behavior**:
1. When processing URL:
   - System tries title selectors in order:
     1. `h1.article-title`
     2. `h1.post-title`
     3. `h1.entry-title`
     4. `article h1`
     5. `[role="article"] h1`
     6. `h1`
     7. `<title>` tag (with site name removal using regex)
   - If found: Uses extracted title (cleaned, max 200 chars)
   - If not found: Falls back to page title (removes site name after separators like " - ", " | ", " • ")
   - If still not found: Uses `hostname.replace('www.', '') + ' - ' + URL.substring(0, 60)`
2. Title is saved with article
3. Title appears in Article History sidebar
4. Title is truncated in sidebar if too long (ellipsis)

---

### 5.5 Article History Refresh

**Scenario**: New article is processed

**Expected Behavior**:
1. User processes new article
2. Article is saved to database
3. Article History sidebar automatically refreshes
4. New article appears at top of list
5. Article count updates
6. New article is not automatically selected (user can continue processing)

---

## 6. Support System

### 6.1 Submit Support Request

**Scenario**: User submits support form

**Expected Behavior**:
1. User clicks "💬 Support" button in navigation
2. Support form modal appears (overlay)
3. Form fields:
   - Name (required)
   - Email (required, validated for email format)
   - Subject (required)
   - Message (required, minimum 10 characters)
4. User fills form and clicks "Send"
5. System validates input (client and server-side)
6. If valid:
   - System sends email via Resend API to: `SUPPORT_EMAIL` (defaults to haofu99@gmail.com)
   - Email contains:
     - From: `RESEND_FROM_EMAIL` (defaults to "AI Translate <onboarding@resend.dev>")
     - To: `SUPPORT_EMAIL`
     - Reply-To: User's email
     - Subject: "Support Request: [user subject]"
     - Body: HTML formatted with name, email, subject, message
   - Success message: "Message sent successfully!"
   - Form closes after 2 seconds
   - Form data cleared
7. If invalid:
   - Field-specific error messages shown
   - Form remains open

**Error Cases**:
- **Validation error**: Show field-specific errors
- **Email send fails**: Show error message, keep form open
- **Resend not configured**: Show error "Email service not configured. Please contact the administrator."

---

## 7. Error Handling

### 7.1 Authentication Errors

**Error**: `UNAUTHORIZED`
- **Status**: 401
- **Message**: "Please sign in to continue"
- **User Message**: "Your session has expired. Please sign in again."
- **Action**: Redirect to sign-in page

**Error**: `INVALID_CREDENTIALS`
- **Message**: "Invalid email or password"
- **User Message**: "Invalid email or password. Please try again."
- **Action**: Stay on sign-in page, show error (only after failed attempt)

---

### 7.2 Token Errors

**Error**: `TOKEN_LIMIT_REACHED`
- **Status**: 403
- **Message**: "You have reached your trial token limit. Please upgrade to continue."
- **User Message**: Same as message
- **Action**: Show upgrade button, block processing

**Error**: `INSUFFICIENT_TOKENS`
- **Status**: 403
- **Message**: "This article requires approximately X tokens, but you only have Y tokens remaining. Please upgrade to continue."
- **User Message**: Same as message
- **Action**: Show upgrade button, block processing

---

### 7.3 Content Errors

**Error**: `SUBSCRIPTION_REQUIRED`
- **Status**: 402
- **Message**: "This article requires a subscription to access"
- **User Message**: "This article requires a subscription to access. Please sign in to the website and copy the article content."
- **Action**: Show `SubscriptionRequired` component with workflow

**Error**: `EMPTY_CONTENT`
- **Status**: 400
- **Message**: "No content found in the article"
- **User Message**: "The article appears to be empty. Please check the URL or try pasting the content directly."
- **Action**: Allow user to retry or paste content

**Error**: `EXTRACTION_FAILED`
- **Message**: "Failed to extract content from URL"
- **User Message**: "Unable to extract content from this URL. Please try copying and pasting the article content directly."
- **Action**: Show text input option

---

### 7.4 API Errors

**Error**: `OPENAI_ERROR`
- **Message**: "OpenAI API error occurred"
- **User Message**: "We're experiencing issues with our AI service. Please try again in a few moments."
- **Action**: Allow retry

**Error**: `NETWORK_ERROR`
- **Message**: "Network request failed"
- **User Message**: "Unable to connect to our servers. Please check your internet connection and try again."
- **Action**: Allow retry

---

### 7.5 Database Errors

**Error**: `DATABASE_NOT_SETUP`
- **Message**: "Articles table does not exist"
- **User Message**: Empty state shown (no error message) - article history is optional
- **Action**: User can still process articles, but history won't be saved

**Error**: `DATABASE_UNAVAILABLE`
- **Message**: "Database is temporarily unavailable"
- **User Message**: "Database Unavailable. We're having trouble connecting to the database. Your articles are safe, but we can't display them right now. Please try again later."
- **Action**: Show friendly message, allow retry

---

## 8. UI/UX Behavior

### 8.1 Homepage States

**Not Signed In**:
- Hero section with features
- Feature cards (Lightning Fast, Smart Analysis, etc.)
- Sign Up / Sign In buttons
- No token usage, no article processor, no history

**Signed In (Trial)**:
- **Navigation**: Logo, Support button, user email/name, Sign Out button
- **Layout**: Split view
  - **Left Sidebar (280px)**: Article History
  - **Right Main Content**: Token Usage, Article Processor, Paid Plan Benefits
- **Token Usage**: Trial Plan badge, progress bar, upgrade button
- **Article Processor**: URL/Text toggle (centered), input, style selector, process button
- **Paid Plan Benefits**: Visible below Article Processor
- **Article History**: Shows articles or empty state

**Signed In (Paid)**:
- Same layout as trial
- **Token Usage**: Paid Plan badge (green), progress bar, **NO upgrade button**
- **Paid Plan Benefits**: **HIDDEN** (user already paid)
- **Article History**: Same as trial

---

### 8.2 Navigation Behavior

**Upgrade Flow**:
1. User clicks "Upgrade" from Token Usage or "Upgrade to Paid Plan" from Paid Plan Benefits
2. System creates Stripe Checkout session
3. User redirected to Stripe Checkout
4. After payment: Redirected to `/?upgrade=success`
5. After 2 seconds: URL cleaned to `/`, page reloads
6. User sees updated status (Paid Plan badge, no Paid Plan Benefits)

**Cancel Flow**:
1. User clicks "Go back" in Stripe Checkout or browser back button
2. User redirected to `/` (homepage)
3. User remains on trial plan
4. No error messages

---

### 8.3 Component Interactions

**Article History Selection**:
- Clicking article loads it in main area
- Selected article highlighted in sidebar
- Processing new article clears selection
- Deleting selected article clears main content

**Token Usage Updates**:
- Updates after each article processed
- Progress bar animates
- Badge shows current plan
- Upgrade button only for trial users

**Support Form**:
- Modal overlay
- Closes on success (2 seconds)
- Closes on cancel/outside click
- Form validation before submit

---

## 9. Database Behavior

### 9.1 User Table

**Schema**:
- `id`: UUID (primary key)
- `email`: TEXT (unique, not null)
- `password`: TEXT (hashed, nullable for OAuth)
- `name`: TEXT (nullable)
- `user_type`: TEXT ('trial' | 'paid', default: 'trial')
- `tokens_used`: BIGINT (default: 0)
- `token_limit`: BIGINT (default: 1000 for trial, 1000000 for paid)
- `subscription_status`: TEXT ('active' | 'expired' | 'cancelled', nullable)
- `subscription_expires_at`: TIMESTAMPTZ (nullable)
- `payment_id`: TEXT (nullable)
- `created_at`: TIMESTAMPTZ (default: NOW())
- `updated_at`: TIMESTAMPTZ (auto-updated)

**RLS Policies**:
- Users can read their own data
- Users can update their own data
- Server-side operations use service role key (bypasses RLS)

---

### 9.2 Articles Table

**Schema**:
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to users, CASCADE delete)
- `title`: TEXT (not null)
- `original_content`: TEXT (not null)
- `translated_content`: TEXT (not null)
- `insights`: TEXT (not null)
- `input_type`: TEXT ('url' | 'text', not null)
- `source_url`: TEXT (nullable, only for URL input)
- `style`: TEXT (nullable, style archetype used)
- `tokens_used`: BIGINT (default: 0)
- `created_at`: TIMESTAMPTZ (default: NOW())
- `updated_at`: TIMESTAMPTZ (auto-updated)

**RLS Policies**:
- Users can view their own articles
- Users can create their own articles
- Users can update their own articles
- Users can delete their own articles

**Indexes**:
- `idx_articles_user_id` on `user_id`
- `idx_articles_created_at` on `created_at DESC`

**Important**: Article history is optional - app works even if table doesn't exist

---

## 10. Edge Cases & Special Scenarios

### 10.1 Concurrent Token Updates

**Scenario**: User processes multiple articles simultaneously

**Expected Behavior**:
- Database handles concurrent updates
- Token consumption is atomic
- Last write wins (acceptable for this use case)
- User may see slight discrepancies in UI (acceptable)

---

### 10.2 Very Long Articles

**Scenario**: User processes extremely long article (>100K characters)

**Expected Behavior**:
- System processes article (may take longer)
- Token usage calculated accurately
- Results displayed (may be long, scrollable)
- Article saved to database
- UI remains responsive
- Title truncated if necessary

---

### 10.3 Invalid URLs

**Scenario**: User submits invalid or unreachable URL

**Expected Behavior**:
- System attempts to fetch URL
- If fetch fails:
  - Check if known subscription site → Show subscription workflow
  - Otherwise: Error "Failed to extract content from URL"
- User can retry or paste content directly

---

### 10.4 Database Connection Loss

**Scenario**: Supabase database becomes unavailable

**Expected Behavior**:
- Article History shows: "Database Unavailable" message
- Article processing may fail with database errors
- User-friendly error messages displayed
- System attempts to continue where possible (article history is optional)
- Articles can still be processed, but won't be saved to history

---

### 10.5 Stripe Webhook Delays

**Scenario**: Webhook arrives late or fails

**Expected Behavior**:
- User may be charged but not upgraded immediately
- Webhook retries (Stripe handles this)
- Manual fix may be needed if webhook fails permanently
- User should contact support if upgrade doesn't complete

---

### 10.6 Session Expiration During Processing

**Scenario**: User session expires while processing article

**Expected Behavior**:
- Processing may complete (if started before expiration)
- Results may not save if session expired
- User sees authentication error
- User redirected to sign-in page

---

### 10.7 Article History Table Missing

**Scenario**: Articles table doesn't exist in database

**Expected Behavior**:
- App continues to work normally
- Articles can be processed
- Article History sidebar shows empty state (no error)
- Warning logged: "Articles table does not exist"
- User can still use all other features

---

## 11. Performance Expectations

### 11.1 Response Times

- **Article Processing**: 10-30 seconds (depends on article length and OpenAI API)
- **Token Usage Fetch**: < 500ms
- **Article History Load**: < 1 second
- **Sign In**: < 2 seconds
- **Registration**: < 2 seconds
- **Support Form Submit**: < 2 seconds

### 11.2 Loading States

- All async operations show loading indicators
- Buttons disabled during processing
- Progress feedback provided
- Error states clearly displayed

---

## 12. Security Considerations

### 12.1 Authentication

- Passwords hashed with bcrypt
- Sessions managed by NextAuth.js
- CSRF protection enabled
- Secure cookie settings

### 12.2 API Security

- Stripe webhooks verified with signatures
- User data isolated by RLS policies
- Service role key only used server-side
- Environment variables not exposed to client

### 12.3 Data Privacy

- Users can only access their own data
- Articles deleted when user account deleted (CASCADE)
- No data shared between users
- Support emails sent securely via Resend

---

## 13. Testing Checklist

### Authentication
- [ ] Register new user (email/password)
- [ ] Sign in existing user
- [ ] Sign in with Google (if configured)
- [ ] Sign out
- [ ] Auto sign-out after 5 minutes inactivity
- [ ] Warning appears at 4 minutes
- [ ] Timer resets on activity

### Article Processing
- [ ] Process article from URL (free content)
- [ ] Process article from URL (paywalled)
- [ ] Process article from raw text
- [ ] Select different writing styles
- [ ] Verify title extraction from URLs
- [ ] Verify article saved to history
- [ ] Verify article appears in sidebar

### Token Management
- [ ] Trial user starts with 1,000 tokens
- [ ] Tokens consumed correctly
- [ ] Token limit enforced for trial users
- [ ] Upgrade prompt when limit reached
- [ ] Paid user has 1M tokens
- [ ] Paid user tokens reset on renewal
- [ ] Token usage updates in real-time

### Payment
- [ ] Create checkout session
- [ ] Complete payment
- [ ] Webhook upgrades user
- [ ] Subscription renews monthly
- [ ] Subscription cancellation downgrades user
- [ ] Payment failure handling
- [ ] Paid Plan Benefits hidden for paid users

### Article History
- [ ] Articles appear in sidebar
- [ ] Click article loads content
- [ ] Delete article removes from list
- [ ] Empty state shows when no articles
- [ ] Database error shows friendly message
- [ ] Article count updates
- [ ] Selected article highlighted

### Support
- [ ] Support form opens
- [ ] Form validation works
- [ ] Email sent successfully
- [ ] Success message displays
- [ ] Form closes after success

### Error Handling
- [ ] All error types show user-friendly messages
- [ ] Upgrade prompts appear when needed
- [ ] Subscription workflow appears for paywalls
- [ ] Network errors handled gracefully
- [ ] Database errors handled gracefully

### UI/UX
- [ ] Trial Plan badge shows for trial users
- [ ] Paid Plan badge shows for paid users
- [ ] Upgrade button only for trial users
- [ ] Paid Plan Benefits only for trial users
- [ ] URL/Text toggle buttons centered
- [ ] Article History sidebar works
- [ ] Support button in navigation

---

## 14. Known Limitations

1. **Token Calculation**: Uses rough estimation (~4 chars = 1 token). For production, consider `tiktoken` library for accuracy.

2. **Concurrent Updates**: Token updates are not locked. Last write wins (acceptable for this use case).

3. **Webhook Reliability**: If webhook fails, user may need manual upgrade (rare, but possible).

4. **Title Extraction**: May not work perfectly for all websites. Falls back to page title or URL.

5. **Paywall Detection**: Not 100% accurate. Some paywalls may be missed or false positives.

6. **Article History**: Optional feature. App works even if articles table doesn't exist.

7. **Auto Sign-Out**: Only tracks browser events. Background tabs may not be tracked accurately.

---

## 15. Future Enhancements (Not Yet Implemented)

- Subscription management page (cancel, update payment method)
- Payment history view
- Bulk article processing
- Export formats (PDF, DOCX)
- User profiles and preferences
- Team/organization accounts
- Advanced analytics dashboard
- Multi-language support (beyond Chinese)
- Real-time token usage updates (WebSocket)
- Article search and filtering
- Article sharing capabilities
- Custom writing style creation
- Article export functionality

---

**Document Version**: 1.0  
**Last Updated**: Based on current codebase state  
**Maintained By**: Development Team

