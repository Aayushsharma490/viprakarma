// Pure server component - NO 'use client' directive
// NO imports, NO hooks, NO dependencies
export default function NotFound() {
    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                    color: 'white'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)',
                        maxWidth: '500px'
                    }}>
                        <h1 style={{ fontSize: '96px', marginBottom: '20px', fontWeight: 'bold', margin: '0 0 20px 0' }}>404</h1>
                        <h2 style={{ fontSize: '28px', marginBottom: '15px', fontWeight: '600', margin: '0 0 15px 0' }}>Page Not Found</h2>
                        <p style={{ marginBottom: '30px', opacity: 0.95, fontSize: '16px', lineHeight: '1.6' }}>
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a
                                href="/"
                                style={{
                                    display: 'inline-block',
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    background: 'white',
                                    color: '#ea580c',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600'
                                }}
                            >
                                🏠 Go Home
                            </a>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
