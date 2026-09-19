import { sitePath } from '@/lib/site-path';

export default function SignUpPage() {
  return (
    <main>
      <h1>Meet the speaker</h1>
      <div className="empty" style={{ marginTop: '2rem', textAlign: 'left' }}>
        <h2>Sign-up list coming soon</h2>
        <p>
          The meeting schedule and access controls will be connected here once
          the sign-up process is confirmed.
        </p>
        <p style={{ marginTop: '1.25rem' }}>
          <a href={sitePath('/')}>Return to seminars</a>
        </p>
      </div>
    </main>
  );
}
