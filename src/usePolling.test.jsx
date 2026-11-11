import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePolling } from './usePolling.js';

describe('usePolling', () => {
  it('ignores a slow response from an earlier load', async () => {
    let finishSlow;
    const slow = () => new Promise((resolve) => (finishSlow = resolve));
    const fast = vi.fn().mockResolvedValue('new');
    const { result, rerender } = renderHook(({ load }) => usePolling(load), { initialProps: { load: slow } });

    rerender({ load: fast });
    await waitFor(() => expect(result.current.data).toBe('new'));
    await act(async () => finishSlow('old'));

    expect(result.current.data).toBe('new');
  });

  it('still shows a response that takes longer than the polling interval', async () => {
    let finish;
    const load = vi.fn(() => new Promise((resolve) => (finish = resolve)));
    const { result } = renderHook(() => usePolling(load, 10));

    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(load).toHaveBeenCalledTimes(1);
    await act(async () => finish('slow'));

    await waitFor(() => expect(result.current.data).toBe('slow'));
  });

  it('polls again after a response arrives', async () => {
    const load = vi.fn().mockResolvedValue('x');
    renderHook(() => usePolling(load, 10));

    await waitFor(() => expect(load.mock.calls.length).toBeGreaterThan(2));
  });

  it('reports an error from a failed load', async () => {
    const load = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => usePolling(load, 1000));

    await waitFor(() => expect(result.current.error).toBe('boom'));
  });

  it('stops polling when unmounted', async () => {
    const load = vi.fn().mockResolvedValue('x');
    const { unmount } = renderHook(() => usePolling(load, 10));
    await waitFor(() => expect(load).toHaveBeenCalled());

    unmount();
    const calls = load.mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(load.mock.calls.length).toBe(calls);
  });
});
