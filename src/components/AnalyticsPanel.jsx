export default function AnalyticsPanel({ summary, error }) {
  if (error) return <p role="alert" className="status status-error">Analytics service: {error}</p>;
  if (!summary) return <p className="muted">Loading…</p>;

  const types = Object.entries(summary.eventsByType);

  return (
    <div className="analytics">
      <div className="stat">
        <span className="stat-value">{summary.totalEvents}</span>
        <span className="stat-label">events observed</span>
      </div>
      {types.length > 0 && (
        <dl className="by-type">
          {types.map(([type, count]) => (
            <div key={type}>
              <dt>{type}</dt>
              <dd>{count}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
