export default function ErrorPage({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '20px' }}>
      <h1>Authentication Error</h1>
      <p style={{ color: 'red', marginTop: '10px' }}>
        {searchParams?.message || 'An unexpected error occurred during the authentication process.'}
      </p>
      <p style={{ marginTop: '20px' }}>
        Please try again or contact support if the issue persists.
      </p>
      <a href="/login" style={{ marginTop: '20px', color: '#0070f3', textDecoration: 'underline' }}>
        Go to Login Page
      </a>
    </div>
  );
}
