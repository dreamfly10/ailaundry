import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractContentFromUrl } from '@/lib/content-extractor';
import { translateToChinese, generateInsights } from '@/lib/openai';
import { checkTokenLimit, consumeTokens, calculateTokensUsed } from '@/lib/token-tracker';
import { z } from 'zod';

const processArticleSchema = z.object({
  inputType: z.enum(['url', 'text']),
  content: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check token limit for trial users
    const tokenStatus = await checkTokenLimit(session.user.id);
    if (!tokenStatus.allowed) {
      return NextResponse.json(
        { 
          error: 'Token limit reached',
          message: 'You have reached your trial token limit. Please upgrade to continue.',
          tokensUsed: tokenStatus.tokensUsed,
          limit: tokenStatus.limit,
          tokensRemaining: tokenStatus.tokensRemaining,
          upgradeRequired: true
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { inputType, content } = processArticleSchema.parse(body);

    let articleText: string;
    let requiresSubscription = false;

    // Extract content based on input type
    if (inputType === 'url') {
      const result = await extractContentFromUrl(content);
      articleText = result.content;
      requiresSubscription = result.requiresSubscription;
    } else {
      articleText = content;
    }

    // Translate to Chinese
    const translation = await translateToChinese(articleText);
    
    // Generate insights
    const insights = await generateInsights(translation);

    // Calculate and consume tokens
    const inputTokens = await calculateTokensUsed(articleText);
    const translationTokens = await calculateTokensUsed(translation);
    const insightsTokens = await calculateTokensUsed(insights);
    const totalTokens = inputTokens + translationTokens + insightsTokens;

    await consumeTokens(session.user.id, totalTokens);

    // Get updated token status
    const updatedTokenStatus = await checkTokenLimit(session.user.id);

    return NextResponse.json({
      translation,
      insights,
      requiresSubscription,
      tokensUsed: totalTokens,
      tokensRemaining: updatedTokenStatus.tokensRemaining,
      tokensTotal: updatedTokenStatus.tokensUsed,
      tokenLimit: updatedTokenStatus.limit,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Process article error:', error);
    return NextResponse.json(
      { error: 'Failed to process article', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

