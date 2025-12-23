import { db } from './db';

/**
 * Calculate approximate token usage for a text string
 * Rough estimation: ~4 characters = 1 token
 * For more accuracy, consider using tiktoken library
 */
export async function calculateTokensUsed(text: string): Promise<number> {
  // Rough estimation: ~4 characters = 1 token
  // This is a simplified calculation. For production, consider using tiktoken
  return Math.ceil(text.length / 4);
}

/**
 * Check if user has remaining tokens and return usage status
 */
export async function checkTokenLimit(userId: string): Promise<{
  allowed: boolean;
  tokensUsed: number;
  tokensRemaining: number;
  limit: number;
  userType: 'trial' | 'paid';
}> {
  const user = await db.user.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const tokensRemaining = user.tokenLimit - user.tokensUsed;
  
  // For trial users, strictly enforce the limit - no processing if limit is reached
  // For paid users, enforce the 1M token monthly limit
  const isTrialUser = user.userType === 'trial';
  const isPaidUser = user.userType === 'paid';
  const hasRemainingTokens = tokensRemaining > 0;
  
  // Check if subscription is still active for paid users
  let subscriptionActive = true;
  if (isPaidUser && user.subscriptionExpiresAt) {
    subscriptionActive = new Date(user.subscriptionExpiresAt) > new Date();
  }
  
  // Paid users can use tokens if subscription is active and they have remaining tokens
  // Trial users can only use tokens if they have remaining tokens
  const allowed = (isPaidUser && subscriptionActive && hasRemainingTokens) || 
                  (isTrialUser && hasRemainingTokens);
  
  return {
    allowed,
    tokensUsed: user.tokensUsed,
    tokensRemaining: Math.max(0, tokensRemaining),
    limit: user.tokenLimit,
    userType: user.userType,
  };
}

/**
 * Consume tokens for a user
 */
export async function consumeTokens(userId: string, tokens: number): Promise<void> {
  const user = await db.user.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Track token usage for both trial and paid users
  // Paid users have a 1M token monthly limit that resets with subscription renewal
  // Trial users have a 1K token limit
  await db.user.update(userId, {
    tokensUsed: user.tokensUsed + tokens,
  });
}

/**
 * Get token usage statistics for a user
 */
export async function getTokenUsage(userId: string) {
  return checkTokenLimit(userId);
}

