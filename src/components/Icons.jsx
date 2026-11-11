// Inline icons; decorative, so the button around each one carries the accessible name.
function Icon({ children }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const PencilIcon = () => (
  <Icon>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Icon>
);

export const TrashIcon = () => (
  <Icon>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);

export const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const PlusIcon = () => (
  <Icon>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);

/** The brand mark: an event stream fanning out to consumers. */
export const LogoMark = () => (
  <svg className="logo-mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false">
    <rect width="32" height="32" rx="8" fill="var(--accent)" />
    <circle cx="10" cy="16" r="3" fill="var(--accent-text)" />
    <circle cx="22" cy="10" r="2.5" fill="var(--accent-text)" />
    <circle cx="22" cy="22" r="2.5" fill="var(--accent-text)" />
    <path d="M13 15 19.5 11M13 17l6.5 4" stroke="var(--accent-text)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
