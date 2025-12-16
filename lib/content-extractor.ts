import * as cheerio from 'cheerio';

interface ExtractionResult {
  content: string;
  requiresSubscription: boolean;
}

export async function extractContentFromUrl(url: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for paywall/subscription indicators
    const paywallIndicators = [
      'paywall',
      'subscription',
      'premium',
      'members-only',
      'locked-content',
      'subscribe-to-read',
    ];

    const requiresSubscription = paywallIndicators.some((indicator) => {
      const selector = `[class*="${indicator}"], [id*="${indicator}"]`;
      return $(selector).length > 0;
    });

    // Extract main content
    // Try common article selectors
    const contentSelectors = [
      'article',
      '[role="article"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      'main',
    ];

    let content = '';
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 200) {
          break; // Found substantial content
        }
      }
    }

    // Fallback: use body text if no article found
    if (!content || content.length < 200) {
      // Remove script and style elements
      $('script, style, nav, footer, header, aside').remove();
      content = $('body').text().trim();
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return {
      content: content || 'Could not extract content from URL',
      requiresSubscription,
    };
  } catch (error) {
    console.error('Error extracting content:', error);
    throw new Error(`Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

