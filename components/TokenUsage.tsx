'use client';

import { useEffect, useState } from 'react';

interface TokenUsage {
  allowed: boolean;
  tokensUsed: number;
  tokensRemaining: number;
  limit: number;
  userType: 'trial' | 'paid';
}

export function TokenUsage() {
  const [usage, setUsage] = useState<TokenUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/token-usage');
      if (!response.ok) {
        throw new Error('Failed to fetch token usage');
      }
      const data = await response.json();
      setUsage(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load token usage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="token-usage" style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', marginBottom: '1rem' }}>
        <p>Loading token usage...</p>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="token-usage" style={{ padding: '1rem', background: '#fee', borderRadius: '8px', marginBottom: '1rem', color: '#c00' }}>
        <p>Error: {error || 'Failed to load token usage'}</p>
      </div>
    );
  }

  const percentage = usage.limit > 0 ? (usage.tokensUsed / usage.limit) * 100 : 0;
  const isLow = percentage > 80;
  const isExceeded = usage.tokensRemaining <= 0 && usage.userType === 'trial';

  return (
    <div className="token-usage" style={{ 
      padding: '1rem', 
      background: isExceeded ? '#fee' : isLow ? '#fff3cd' : '#f5f5f5', 
      borderRadius: '8px', 
      marginBottom: '1rem',
      border: isExceeded ? '2px solid #c00' : isLow ? '2px solid #ffc107' : '1px solid #ddd'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>
          Token Usage {usage.userType === 'paid' && <span style={{ color: '#28a745' }}>(Paid)</span>}
        </h3>
        {usage.userType === 'trial' && (
          <button
            onClick={() => window.location.href = '/upgrade'}
            style={{
              padding: '0.5rem 1rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Upgrade
          </button>
        )}
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{
          width: '100%',
          height: '20px',
          background: '#e0e0e0',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '0.5rem'
        }}>
          <div
            style={{
              width: `${Math.min(percentage, 100)}%`,
              height: '100%',
              background: isExceeded ? '#dc3545' : isLow ? '#ffc107' : '#28a745',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#666' }}>
          <span>
            {usage.tokensUsed.toLocaleString()} / {usage.limit.toLocaleString()} tokens used
          </span>
          {usage.userType === 'trial' && (
            <span style={{ color: isExceeded ? '#dc3545' : '#666' }}>
              {usage.tokensRemaining.toLocaleString()} remaining
            </span>
          )}
        </div>
      </div>

      {isExceeded && (
        <div style={{
          padding: '0.75rem',
          background: '#fff',
          borderRadius: '4px',
          border: '1px solid #dc3545',
          marginTop: '0.5rem'
        }}>
          <p style={{ margin: 0, color: '#dc3545', fontWeight: 'bold' }}>
            ⚠️ Token limit reached! Please upgrade to continue using the service.
          </p>
        </div>
      )}

      {usage.userType === 'trial' && !isExceeded && isLow && (
        <div style={{
          padding: '0.75rem',
          background: '#fff',
          borderRadius: '4px',
          border: '1px solid #ffc107',
          marginTop: '0.5rem'
        }}>
          <p style={{ margin: 0, color: '#856404' }}>
            ⚠️ You're running low on tokens. Consider upgrading for unlimited access.
          </p>
        </div>
      )}
    </div>
  );
}

