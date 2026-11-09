export default function EmailList({ emails, error }) {
  if (error) return <p role="alert" className="status status-error">Email service: {error}</p>;
  if (!emails) return <p className="muted">Loading…</p>;
  if (emails.length === 0) return <p className="muted">No emails sent yet.</p>;

  return (
    <ul className="rows">
      {emails.map((e) => (
        <li key={e.id}>
          <strong>{e.subject}</strong>
          <span className="muted">
            to {e.to} · {new Date(e.sentAt).toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
