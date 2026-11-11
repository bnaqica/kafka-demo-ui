import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Calls `load` now and every `intervalMs`, since email and analytics update
 * asynchronously after a customer is created. Returns { data, error, refresh }.
 */
export function usePolling(load, intervalMs = 3000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const latestRequest = useRef(0);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    const request = ++latestRequest.current;
    inFlight.current = true;
    try {
      const result = await load();
      // A slower response from an earlier load (such as an old filter) must not replace a newer one.
      if (request === latestRequest.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (request === latestRequest.current) setError(err.message);
    } finally {
      if (request === latestRequest.current) inFlight.current = false;
    }
  }, [load]);

  useEffect(() => {
    // Initial load plus polling; state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // A tick is skipped while a request is out, so a slow service still gets to answer.
    const id = setInterval(() => {
      if (!inFlight.current) refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { data, error, refresh };
}
