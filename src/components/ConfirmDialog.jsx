import { useId } from 'react';
import { useModal } from './useModal.js';

/** Asks before something that can't be undone; focus starts on Cancel, the safe choice. */
export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  const titleId = useId();
  const messageId = useId();
  const panel = useModal(onCancel, '[data-cancel]');

  return (
    <div className="overlay overlay-center" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        ref={panel}
      >
        <h2 id={titleId}>{title}</h2>
        <p id={messageId} className="muted">
          {message}
        </p>
        <div className="dialog-actions">
          <button type="button" className="secondary" data-cancel onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
