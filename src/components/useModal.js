import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [href], [tabindex="0"]';

/**
 * Modal behaviour for a dialog: focus moves in on open and back on close, Tab stays inside, Escape closes.
 * `initialFocus` picks the element to focus first; otherwise the first form field, then the first control.
 */
export function useModal(onClose, initialFocus) {
  const panel = useRef(null);
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement;
    const root = panel.current;
    const first =
      (initialFocus && root.querySelector(initialFocus)) ??
      root.querySelector('input, select, textarea') ??
      root.querySelector(FOCUSABLE);
    first?.focus();

    function onKey(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close.current();
      } else if (event.key === 'Tab') {
        const items = [...root.querySelectorAll(FOCUSABLE)];
        if (items.length === 0) return;
        const [start, end] = [items[0], items.at(-1)];
        if (event.shiftKey && document.activeElement === start) {
          event.preventDefault();
          end.focus();
        } else if (!event.shiftKey && document.activeElement === end) {
          event.preventDefault();
          start.focus();
        }
      }
    }
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [initialFocus]);

  return panel;
}
