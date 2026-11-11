/** Grey placeholder rows shown while data loads; announced once as a status. */
export default function Skeleton({ label, rows = 4 }) {
  return (
    <div role="status" aria-label={label} className="skeleton-list">
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton-row" key={i}>
          <span className="skeleton skeleton-avatar" />
          <span className="skeleton-lines">
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line short" />
          </span>
        </div>
      ))}
    </div>
  );
}
