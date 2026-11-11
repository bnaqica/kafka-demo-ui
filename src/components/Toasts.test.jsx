import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useToasts } from '../useToasts.js';
import Toasts from './Toasts.jsx';

describe('toasts', () => {
  afterEach(() => vi.useRealTimers());

  it('announces a confirmation politely', () => {
    render(<Toasts toasts={[{ id: 1, kind: 'ok', message: 'Customer added' }]} onDismiss={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('Customer added');
  });

  it('announces an error as an alert', () => {
    render(<Toasts toasts={[{ id: 1, kind: 'error', message: 'Customer not found' }]} onDismiss={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Customer not found');
  });

  it('can be dismissed', async () => {
    const onDismiss = vi.fn();
    render(<Toasts toasts={[{ id: 7, kind: 'ok', message: 'Saved' }]} onDismiss={onDismiss} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledWith(7);
  });

  it('removes a toast by itself after a few seconds', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToasts());

    act(() => result.current.show('Saved'));
    expect(result.current.toasts).toHaveLength(1);
    act(() => vi.advanceTimersByTime(5000));

    expect(result.current.toasts).toHaveLength(0);
  });
});
