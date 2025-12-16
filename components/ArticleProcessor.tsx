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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process article');
      }

      const data = await response.json();
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
          <div style={{ color: 'red', marginTop: '1rem' }}>
            Error: {error}
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

