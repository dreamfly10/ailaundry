'use client';

import { signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AuthButtonsProps {
  session: Session | null;
}

export default function AuthButtons({ session }: AuthButtonsProps) {
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      // Sign in after registration
      await signIn('credentials', {
        email: registerData.email,
        password: registerData.password,
        redirect: false,
      });

      router.refresh();
      setShowRegister(false);
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  if (session) {
    return (
      <div>
        <span style={{ marginRight: '1rem' }}>
          {session.user?.email || session.user?.name}
        </span>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      {showRegister ? (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            required
            minLength={6}
          />
          <input
            type="text"
            placeholder="Name (optional)"
            value={registerData.name}
            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
          />
          <button type="submit" disabled={registerLoading}>
            {registerLoading ? 'Registering...' : 'Register'}
          </button>
          <button type="button" onClick={() => setShowRegister(false)}>
            Cancel
          </button>
          {registerError && <div style={{ color: 'red' }}>{registerError}</div>}
        </form>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => signIn('credentials')}>Sign In</button>
          <button onClick={() => signIn('google')}>Sign In with Google</button>
          <button onClick={() => setShowRegister(true)}>Register</button>
        </div>
      )}
    </div>
  );
}

