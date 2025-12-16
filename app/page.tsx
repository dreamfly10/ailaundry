'use client';

import { useSession } from 'next-auth/react';
import ArticleProcessor from '@/components/ArticleProcessor';
import AuthButtons from '@/components/AuthButtons';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="container">Loading...</div>;
  }

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>AI Article Translation & Insight App</h1>
        <AuthButtons session={session} />
      </div>

      {session ? (
        <ArticleProcessor />
      ) : (
        <div className="card">
          <h2>Welcome</h2>
          <p>Please sign in to use the translation and insight features.</p>
          <AuthButtons session={session} />
        </div>
      )}
    </main>
  );
}

