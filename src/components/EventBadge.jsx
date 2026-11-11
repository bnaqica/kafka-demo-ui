import { describeEventType } from '../eventTypes.js';

/** The event type as a label with its colour dot; the text carries the meaning, the dot only identity. */
export default function EventBadge({ type }) {
  const { label, slot } = describeEventType(type);
  return (
    <span className="event-badge" title={type}>
      <span className={`event-dot series-${slot ?? 'none'}`} aria-hidden="true" />
      {label}
    </span>
  );
}
