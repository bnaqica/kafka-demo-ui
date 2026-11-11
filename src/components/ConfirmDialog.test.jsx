import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog.jsx';

describe('ConfirmDialog', () => {
  it('asks, then confirms', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog title="Delete Ada Lovelace?" message="This can't be undone." confirmLabel="Delete" onConfirm={onConfirm} onCancel={vi.fn()} />,
    );

    expect(screen.getByRole('alertdialog', { name: 'Delete Ada Lovelace?' })).toHaveTextContent("This can't be undone.");
    await userEvent.setup().click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalled();
  });

  it('cancels with the button or Escape, starting on the safe choice', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog title="Delete?" message="" confirmLabel="Delete" onConfirm={vi.fn()} onCancel={onCancel} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
