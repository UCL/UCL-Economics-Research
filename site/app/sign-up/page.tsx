import Link from 'next/link';

export default function SignUpPage() {
  return (
    <main>
      <p className="eyebrow">Prototype</p>
      <h1>Meet the speaker</h1>
      <div className="empty" style={{ marginTop: '2rem', textAlign: 'left' }}>
        <h2>Sign-up list coming soon</h2>
        <p>
          The meeting schedule and access controls will be connected here once
          the sign-up process is confirmed.
        </p>
        <p style={{ marginTop: '1.25rem' }}>
          <Link href="/">Return to seminars</Link>
        </p>
      </div>
    </main>
  );
}
