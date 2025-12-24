import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTokenUsage } from '@/lib/token-tracker';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenStatus = await getTokenUsage(session.user.id);
    return NextResponse.json(tokenStatus);
  } catch (error) {
    console.error('Token usage error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token usage', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

