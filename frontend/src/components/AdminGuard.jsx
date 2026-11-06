import { useAuth } from '../context/AuthContext';

/**
 * Protective Auth Guard for Administrator-only views.
 * Restricts rendering exclusively to authenticated users with role === 'admin'.
 */
export default function AdminGuard({ children, onNavigateHome }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          fontFamily: 'var(--font-heading)',
          gap: '16px',
          color: 'var(--text-muted, #64748b)'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTopColor: 'var(--teal, #0d9488)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <p>Verifying administrator credentials...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <section
        style={{
          maxWidth: '600px',
          margin: '80px auto',
          padding: '40px 24px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid #fee2e2'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#991b1b', marginBottom: '12px' }}>
          Access Restricted
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
          This page requires Administrator privileges. You are currently{' '}
          {isAuthenticated ? (
            <span>signed in as <strong>{user?.email}</strong> (Customer account)</span>
          ) : (
            <span>not signed in</span>
          )}
          .
        </p>
        <button
          onClick={onNavigateHome}
          style={{
            padding: '12px 28px',
            backgroundColor: '#0d9488',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#0f766e')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#0d9488')}
        >
          Return to Storefront
        </button>
      </section>
    );
  }

  return children;
}
