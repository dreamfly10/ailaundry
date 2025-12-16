'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="card">
        <h1>Sign In</h1>

        <form onSubmit={handleCredentialsSignIn} style={{ marginTop: '1.5rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          {error && <div style={{ color: 'red', marginTop: '0.5rem' }}>{error}</div>}
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <div style={{ margin: '1rem 0', color: '#666' }}>or</div>
          <button
            onClick={() => signIn('google', { callbackUrl })}
            style={{ width: '100%' }}
          >
            Sign In with Google
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/">Back to home</Link>
        </div>
      </div>
    </div>
  );
}

