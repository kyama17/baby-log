import Link from 'next/link';

export default function LandingPage() {
  return (
    <div>
      <h1>Welcome to Our Application!</h1>
      <p>
        Join us and explore the amazing features we offer. Sign up for a new
        account or log in if you already have one.
      </p>
      <div>
        <Link href="/login">
          <button>Login</button>
        </Link>
        {/* Add a signup button/link here if/when signup functionality exists */}
      </div>
    </div>
  );
}
