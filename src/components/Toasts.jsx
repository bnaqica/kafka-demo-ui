import { CloseIcon } from './Icons.jsx';

/** Short confirmations in the corner; an error is announced as an alert. */
export default function Toasts({ toasts, onDismiss }) {
  return (
    <div className="toasts">
      {toasts.map((toast) => (
        <div key={toast.id} role={toast.kind === 'error' ? 'alert' : 'status'} className={`toast toast-${toast.kind}`}>
          <span>{toast.message}</span>
          <button type="button" className="icon-button" aria-label="Dismiss" onClick={() => onDismiss(toast.id)}>
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  );
}
