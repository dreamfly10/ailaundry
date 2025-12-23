import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    try {
      const articles = await db.article.findByUserId(session.user.id, limit);
      return NextResponse.json({ articles });
    } catch (dbError: any) {
      // Check if it's a table doesn't exist error
      if (dbError?.code === '42P01' || dbError?.message?.includes('does not exist')) {
        console.error('Articles table does not exist:', dbError);
        return NextResponse.json(
          { 
            error: 'DATABASE_NOT_SETUP',
            message: 'Articles table does not exist. Please run the database migration.',
            articles: [] // Return empty array so UI doesn't break
          },
          { status: 200 } // Return 200 so it doesn't trigger error state
        );
      }
      
      // Re-throw other database errors
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    
    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isDatabaseError = errorMessage.includes('Supabase') || 
                           errorMessage.includes('database') || 
                           errorMessage.includes('connection') ||
                           errorMessage.includes('42P01');
    
    return NextResponse.json(
      { 
        error: isDatabaseError ? 'DATABASE_UNAVAILABLE' : 'FETCH_ERROR',
        message: isDatabaseError 
          ? 'Database is temporarily unavailable. Please try again later.' 
          : 'Failed to fetch articles',
        articles: [] // Return empty array so UI doesn't break
      },
      { status: isDatabaseError ? 503 : 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    await db.article.delete(articleId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete article',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

