'use client';

import { useState } from 'react';

interface ProcessResult {
  translation: string;
  insights: string;
  requiresSubscription?: boolean;
}

export default function ArticleProcessor() {
  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/process-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputType,
          content,
        }),
      });

      // Read response as text first to handle both JSON and HTML responses
      const text = await response.text();
      
      if (!response.ok) {
        // Try to parse as JSON, fallback to text if it fails
        let errorMessage = 'Failed to process article';
        let errorData: any = null;
        try {
          errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
          
          // Handle token limit error specifically
          if (errorData.upgradeRequired) {
            errorMessage = `${errorMessage}\n\nYou have used ${errorData.tokensUsed?.toLocaleString()} of ${errorData.limit?.toLocaleString()} tokens. Please upgrade to continue.`;
          }
        } catch {
          // If response is HTML (like a redirect page), show a more helpful error
          if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            errorMessage = 'Server returned an error page. Please check if you are authenticated and try again.';
          } else {
            errorMessage = text.substring(0, 200) || errorMessage;
          }
        }
        
        const error = new Error(errorMessage);
        (error as any).upgradeRequired = errorData?.upgradeRequired;
        throw error;
      }

      // Parse the successful JSON response
      const data = JSON.parse(text);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="card">
        <h2>Process Article</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input
              type="radio"
              value="url"
              checked={inputType === 'url'}
              onChange={(e) => setInputType(e.target.value as 'url' | 'text')}
            />
            {' '}URL
          </label>
          {' '}
          <label>
            <input
              type="radio"
              value="text"
              checked={inputType === 'text'}
              onChange={(e) => setInputType(e.target.value as 'url' | 'text')}
            />
            {' '}Raw Text
          </label>
        </div>

        {inputType === 'url' ? (
          <input
            type="url"
            placeholder="Enter article URL"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        ) : (
          <textarea
            placeholder="Paste article text here"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Process Article'}
        </button>

        {error && (
          <div style={{ 
            color: 'red', 
            marginTop: '1rem',
            padding: '1rem',
            background: '#fee',
            borderRadius: '4px',
            border: '1px solid #c00'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Error:</strong> {error}
            </div>
            {(error as any).upgradeRequired && (
              <button
                onClick={() => window.location.href = '/upgrade'}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Upgrade to Paid
              </button>
            )}
          </div>
        )}

        {result?.requiresSubscription && (
          <div style={{ color: 'orange', marginTop: '1rem' }}>
            ⚠️ This URL appears to require a subscription. Content extraction may be limited.
          </div>
        )}
      </form>

      {result && (
        <>
          <div className="card">
            <h2>Translation (中文翻译)</h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {result.translation}
            </div>
          </div>

          <div className="card">
            <h2>Insights & Interpretation (深度解读)</h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {result.insights}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

