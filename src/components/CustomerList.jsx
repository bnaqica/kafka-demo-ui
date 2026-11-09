export default function CustomerList({ customers, error }) {
  if (error) return <p role="alert" className="status status-error">Customer service: {error}</p>;
  if (!customers) return <p className="muted">Loading…</p>;
  if (customers.length === 0) return <p className="muted">No customers yet.</p>;

  return (
    <ul className="rows">
      {customers.map((c) => (
        <li key={c.id}>
          <strong>
            {c.firstName} {c.lastName}
          </strong>
          <span className="muted">{c.email}</span>
        </li>
      ))}
    </ul>
  );
}
