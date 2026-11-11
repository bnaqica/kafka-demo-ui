import { useCallback, useRef, useState } from 'react';

const TOAST_MS = 4000;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  const show = useCallback(
    (message, kind = 'ok') => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { id, kind, message }]);
      setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss],
  );

  return { toasts, show, dismiss };
}
