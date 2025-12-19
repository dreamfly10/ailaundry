'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TokenUsage } from '@/components/TokenUsage';

export default function UpgradePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/upgrade', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upgrade');
      }

      setSuccess(true);
      // Refresh page after 2 seconds to show updated status
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="container">Loading...</div>;
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <main className="container">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1>Upgrade to Paid</h1>

        <TokenUsage />

        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Paid Plan Benefits</h2>
          <ul style={{ lineHeight: '1.8' }}>
            <li>✅ <strong>10,000,000 tokens</strong> (effectively unlimited)</li>
            <li>✅ <strong>30-day subscription</strong> period</li>
            <li>✅ <strong>Priority support</strong></li>
            <li>✅ <strong>No usage restrictions</strong></li>
            <li>✅ <strong>Full access</strong> to all features</li>
          </ul>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f5f5f5', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Current Plan: Trial</h3>
            <p>
              You're currently on the trial plan with 100,000 tokens. 
              Upgrade now to get unlimited access!
            </p>
          </div>

          {error && (
            <div style={{ 
              color: 'red', 
              marginTop: '1rem',
              padding: '1rem',
              background: '#fee',
              borderRadius: '4px',
              border: '1px solid #c00'
            }}>
              Error: {error}
            </div>
          )}

          {success && (
            <div style={{ 
              color: 'green', 
              marginTop: '1rem',
              padding: '1rem',
              background: '#efe',
              borderRadius: '4px',
              border: '1px solid #0c0'
            }}>
              ✅ Successfully upgraded to paid! Redirecting...
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading || success}
            style={{
              marginTop: '1.5rem',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: loading || success ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || success ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {loading ? 'Processing...' : success ? 'Upgraded!' : 'Upgrade to Paid'}
          </button>

          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Note: This is a demo upgrade. In production, you would integrate with a payment processor like Stripe or PayPal.
          </p>
        </div>
      </div>
    </main>
  );
}

