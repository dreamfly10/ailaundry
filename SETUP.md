# Setup Instructions

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (for SSO)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Get API Keys

- **OpenAI API Key**: 
  1. Go to https://platform.openai.com/api-keys
  2. Sign in or create an account
  3. Create a new API key
  4. Copy the key to `.env.local`

- **Google OAuth Credentials**: 
  1. Go to https://console.cloud.google.com/apis/credentials
  2. Create a new project or select an existing one
  3. Enable Google+ API
  4. Create OAuth 2.0 Client ID credentials
  5. Set application type to "Web application"
  6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
  7. Copy the Client ID and Client Secret to `.env.local`

- **NextAuth Secret**: 
  Generate a random secret with one of these methods:
  ```bash
  # On Linux/Mac
  openssl rand -base64 32
  
  # On Windows PowerShell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
  
  # Or use an online generator
  ```
  Copy the generated secret to `.env.local`

## 3. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## 4. Build for Production

```bash
npm run build
npm start
```

## Notes

- User data is stored in-memory (will reset on server restart)
- For production, replace the in-memory database in `lib/db.ts` with a real database (PostgreSQL, MongoDB, etc.)
- Monitor OpenAI API usage to control costs
- Make sure to set proper environment variables in your production environment

## Troubleshooting

### OpenAI API Errors
- Verify your API key is correct
- Check that you have sufficient credits in your OpenAI account
- Ensure the model (gpt-4) is available in your account (you may need to use gpt-3.5-turbo if gpt-4 is not available)

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Ensure the redirect URI matches exactly in Google Cloud Console

### Content Extraction Issues
- Some websites may block automated content extraction
- Paywall detection is based on common patterns and may not catch all cases
- For better content extraction, consider using services like Puppeteer or specialized content extraction APIs

