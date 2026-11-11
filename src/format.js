// Small display helpers shared by the customer, email and analytics views.

export const GENDER_LABELS = {
  MALE: 'Male',
  FEMALE: 'Female',
  NON_BINARY: 'Non-binary',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

export function fullName(customer) {
  return [customer.firstName, customer.middleName, customer.lastName].filter(Boolean).join(' ');
}

export function shortName(customer) {
  return `${customer.firstName} ${customer.lastName}`;
}

export function formatAddress({ street, apartment, city, state, zip }) {
  return [street, apartment, city, `${state} ${zip}`].filter(Boolean).join(', ');
}

/** First and last initials, for an avatar. */
export function initials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  return (words.length === 1 ? first : first + words.at(-1)[0]).toUpperCase();
}

/** "just now", "2 min ago", "3 h ago", "2 d ago", then a date. */
export function timeAgo(iso, now = Date.now()) {
  const seconds = Math.round((now - Date.parse(iso)) / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
