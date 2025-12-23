'use client';

import { useAutoSignOut } from '@/hooks/useAutoSignOut';
import { useEffect, useState } from 'react';

/**
 * Component that handles automatic sign-out after 5 minutes of inactivity
 * Shows a warning notification 1 minute before sign-out
 */
export function AutoSignOut() {
  const { showWarning } = useAutoSignOut();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showWarning) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [showWarning]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'var(--color-warning)',
        color: 'white',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 10000,
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <span style={{ fontSize: '1.25rem' }}>⚠️</span>
        <div>
          <strong>Session Timeout Warning</strong>
          <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', opacity: 0.9 }}>
            You will be signed out in 1 minute due to inactivity. Move your mouse or click anywhere to stay signed in.
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

