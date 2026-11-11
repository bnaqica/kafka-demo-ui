import { useId, useState } from 'react';
import { EVENT_TYPES, describeEventType } from '../eventTypes.js';

function StatCard({ label, value }) {
  return (
    <div role="group" aria-label={label} className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div role="status" aria-label="Loading analytics" className="stats">
      {[1, 2, 3, 4].map((i) => (
        <span className="stat-card skeleton skeleton-card" key={i} />
      ))}
    </div>
  );
}

/** Known types in contract order, then any new ones, so each keeps its colour and place. */
function rowsOf(eventsByType) {
  const known = EVENT_TYPES.filter(({ type }) => eventsByType[type]);
  const unknown = Object.keys(eventsByType)
    .filter((type) => !EVENT_TYPES.some((known) => known.type === type))
    .map(describeEventType);
  return [...known, ...unknown].map((row) => ({ ...row, count: eventsByType[row.type] }));
}

export default function AnalyticsPanel({ summary, error }) {
  const [hovered, setHovered] = useState(null);
  const chartTitle = useId();

  if (error) return <p role="alert" className="status status-error">Analytics service: {error}</p>;
  if (!summary) return <StatSkeleton />;

  const { totalEvents, eventsByType } = summary;
  const added = eventsByType['customer-addition'] ?? 0;
  const removed = eventsByType['customer-delete'] ?? 0;
  const rows = rowsOf(eventsByType);
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <div className="analytics">
      <div className="stats">
        <StatCard label="Total events" value={totalEvents} />
        <StatCard label="Customers added" value={added} />
        <StatCard label="Customers removed" value={removed} />
        <StatCard label="Other changes" value={totalEvents - added - removed} />
      </div>

      <h3 id={chartTitle} className="chart-title">
        Events by type
      </h3>
      {rows.length === 0 ? (
        <p className="empty">No events yet.</p>
      ) : (
        <ul className="bar-chart" aria-label="Events by type" aria-describedby={chartTitle}>
          {rows.map((row) => {
            const share = Math.round((row.count / totalEvents) * 100);
            const show = () => setHovered(row.type);
            const hide = () => setHovered(null);
            return (
              <li
                key={row.type}
                className="bar-row"
                tabIndex={0}
                aria-label={`${row.label}: ${row.count} events, ${share}%`}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
              >
                <span className="bar-label">{row.label}</span>
                <span className="bar-track">
                  <span
                    data-testid="bar"
                    className={`bar series-${row.slot ?? 'none'}`}
                    style={{ width: `${Math.round((row.count / max) * 1000) / 10}%` }}
                  />
                </span>
                <span className="bar-value">{row.count}</span>
                {hovered === row.type && (
                  <span role="tooltip" className="tooltip">
                    <span>
                      <strong>{row.count}</strong> events · {share}%
                    </span>
                    <span className="tooltip-type">{row.type}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
