import { useEffect, useState } from 'react';
import { initSession, onSessionEnded, signIn, signOut } from './auth/session.js';
import Home from './components/Home.jsx';
import LoginPage from './components/LoginPage.jsx';

export default function App() {
  const [session, setSession] = useState({ status: 'loading' });

  useEffect(() => {
    onSessionEnded(() => setSession({ status: 'signedOut' }));
    initSession()
      .then((user) => setSession(user ? { status: 'signedIn', user } : { status: 'signedOut' }))
      .catch(() => setSession({ status: 'unavailable' }));
  }, []);

  if (session.status === 'loading') return <p className="muted">Loading…</p>;
  if (session.status === 'signedIn') return <Home user={session.user} onSignOut={signOut} />;
  return <LoginPage unavailable={session.status === 'unavailable'} onSignIn={signIn} />;
}
