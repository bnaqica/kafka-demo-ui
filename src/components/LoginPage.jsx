export default function LoginPage({ unavailable, onSignIn }) {
  return (
    <main className="login card">
      <h1>Kafka Demo</h1>
      <p className="muted">Sign in with your kafka-demo account to continue.</p>
      {unavailable && (
        <p role="alert" className="status status-error">
          Sign-in is unavailable. Check that Keycloak is running, then reload the page.
        </p>
      )}
      <button type="button" onClick={onSignIn} disabled={unavailable}>
        Sign in
      </button>
    </main>
  );
}
