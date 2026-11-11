import { useEffect, useRef, useState } from 'react';
import { initials } from '../format.js';

export default function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    container.current.querySelector('[role="menuitem"]')?.focus();
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    const onPointer = (event) => !container.current.contains(event.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  return (
    <div className="user-menu" ref={container}>
      <button
        type="button"
        className="avatar-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen(!open)}
      >
        <span className="avatar">{initials(user.name)}</span>
        <span className="user-name">{user.name}</span>
      </button>
      {open && (
        <div role="menu" className="menu">
          <div className="menu-header">
            <strong>{user.name}</strong>
            <span className="muted">{user.isAdmin ? 'Administrator' : 'Viewer'}</span>
          </div>
          <button type="button" role="menuitem" className="menu-item" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
