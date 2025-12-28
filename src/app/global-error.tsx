'use client';

// Minimal global error page without any Context dependencies
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</h1>
                        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Something went wrong!</h2>
                        <p style={{ marginBottom: '30px', opacity: 0.9 }}>
                            We encountered an unexpected error.
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: '12px 30px',
                                fontSize: '16px',
                                background: 'white',
                                color: '#667eea',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
