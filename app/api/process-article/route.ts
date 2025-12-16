import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractContentFromUrl } from '@/lib/content-extractor';
import { translateToChinese, generateInsights } from '@/lib/openai';
import { z } from 'zod';

const processArticleSchema = z.object({
  inputType: z.enum(['url', 'text']),
  content: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    return NextResponse.json({
      translation,
      insights,
      requiresSubscription,
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

