import { useId } from 'react';
import { CloseIcon } from './Icons.jsx';
import { useModal } from './useModal.js';

/** A side panel over the page, for forms and details. */
export default function Drawer({ title, onClose, children }) {
  const titleId = useId();
  const panel = useModal(onClose);

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panel}>
        <header className="drawer-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}
