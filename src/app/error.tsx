'use client';

// Pure error component with ZERO imports and ZERO hooks
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9fafb',
            padding: '20px'
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '500px',
                padding: '40px',
                background: 'white',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ fontSize: '64px', margin: '0 0 20px 0', color: '#ef4444' }}>OPS!</h1>
                <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', fontWeight: '600' }}>Something went wrong!</h2>
                <p style={{ margin: '0 0 30px 0', color: '#666', lineHeight: '1.6' }}>
                    We encountered an unexpected error. Please try again.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        🔄 Try again
                    </button>
                    <a
                        href="/"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            fontSize: '16px',
                            background: 'white',
                            color: '#f59e0b',
                            border: '2px solid #f59e0b',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        🏠 Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
