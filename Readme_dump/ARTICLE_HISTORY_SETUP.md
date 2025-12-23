# Article History Feature Setup

## Overview

The app now stores all processed articles in the database and displays them in a sidebar (like ChatGPT), allowing users to view and access their previous translations and insights.

## Database Setup

### Step 1: Run the Articles Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/articles_schema.sql`
4. Click **Run**

This will create:
- `articles` table with all necessary fields
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

### Step 2: Verify Table Creation

In Supabase SQL Editor, run:
```sql
SELECT * FROM articles LIMIT 1;
```

If no error, the table is created successfully.

## Features

### Article Storage
- **Automatic Saving**: Every processed article is automatically saved
- **Title Generation**: Titles are auto-generated from content (first 100 chars or URL)
- **Metadata**: Stores original content, translation, insights, style, tokens used, and timestamps

### Article History Sidebar
- **Left Sidebar**: Fixed 280px width sidebar on the left
- **Article List**: Shows all user's articles sorted by date (newest first)
- **Click to View**: Click any article to load it in the main area
- **Delete Articles**: Click × button to delete articles
- **Auto-refresh**: Sidebar refreshes after processing new articles

### Article Display
- **Full Content**: Shows original content, translation, and insights
- **Style Preserved**: Maintains the writing style used
- **Form Pre-filled**: When viewing an article, the form is pre-filled with original content

## API Endpoints

### `GET /api/articles`
Returns all articles for the authenticated user.

**Query Parameters:**
- `limit` (optional): Maximum number of articles to return (default: 50)

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "Article title",
      "createdAt": "2025-01-01T00:00:00Z",
      "inputType": "url" | "text",
      "sourceUrl": "https://..."
    }
  ]
}
```

### `GET /api/articles/[id]`
Returns a specific article by ID.

**Response:**
```json
{
  "article": {
    "id": "uuid",
    "userId": "uuid",
    "title": "Article title",
    "originalContent": "...",
    "translatedContent": "...",
    "insights": "...",
    "inputType": "url" | "text",
    "sourceUrl": "...",
    "style": "warmBookish",
    "tokensUsed": 1500,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### `DELETE /api/articles?id=[articleId]`
Deletes an article (only if it belongs to the authenticated user).

## Database Schema

```sql
articles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  original_content TEXT NOT NULL,
  translated_content TEXT NOT NULL,
  insights TEXT NOT NULL,
  input_type TEXT CHECK (input_type IN ('url', 'text')),
  source_url TEXT,
  style TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Files Created/Modified

### New Files
- `supabase/articles_schema.sql` - Database schema for articles table
- `components/ArticleHistory.tsx` - Sidebar component for article history
- `app/api/articles/route.ts` - API endpoint for listing/deleting articles
- `app/api/articles/[id]/route.ts` - API endpoint for fetching single article

### Modified Files
- `lib/db.ts` - Added article database operations
- `app/api/process-article/route.ts` - Now saves articles after processing
- `components/UserHomePage.tsx` - Updated layout with sidebar
- `components/ArticleProcessor.tsx` - Added article loading functionality

## User Experience

1. **Process Article**: User processes an article → Article is automatically saved
2. **View History**: Sidebar shows all previous articles
3. **Select Article**: Click on an article → It loads in the main area
4. **Delete Article**: Click × on an article → Confirmation → Article deleted
5. **New Article**: Process a new article → Sidebar auto-refreshes

## Security

- **RLS Enabled**: Row Level Security ensures users can only see their own articles
- **Server-side Validation**: All operations verify user ownership
- **Cascade Delete**: If user is deleted, their articles are automatically deleted

## Performance

- **Indexed Queries**: Fast lookups by user_id and created_at
- **Limited Results**: Default limit of 50 articles (configurable)
- **Efficient Loading**: Articles loaded on-demand when sidebar opens

## Troubleshooting

### Articles Not Saving
- Check database connection
- Verify articles table exists
- Check server logs for errors
- Ensure user is authenticated

### Sidebar Not Showing
- Verify UserHomePage component is being used
- Check browser console for errors
- Ensure articles API endpoint is accessible

### Articles Not Loading
- Check article ID is valid
- Verify user owns the article
- Check network tab for API errors

