import { useCallback, useEffect, useState } from 'react';

/**
 * Calls `load` now and every `intervalMs`, since email and analytics update
 * asynchronously after a customer is created. Returns { data, error, refresh }.
 */
export function usePolling(load, intervalMs = 3000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setData(await load());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [load]);

  useEffect(() => {
    // Initial load plus polling; state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { data, error, refresh };
}
