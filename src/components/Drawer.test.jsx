import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Drawer from './Drawer.jsx';

describe('Drawer', () => {
  it('is a labelled modal dialog', () => {
    render(
      <Drawer title="New customer" onClose={vi.fn()}>
        <p>Body</p>
      </Drawer>,
    );

    const dialog = screen.getByRole('dialog', { name: 'New customer' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveTextContent('Body');
  });

  it('closes with its close button and with Escape', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer title="New customer" onClose={onClose}>
        <input aria-label="Field" />
      </Drawer>,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('moves focus into the drawer when it opens', () => {
    render(
      <Drawer title="New customer" onClose={vi.fn()}>
        <input aria-label="Field" />
      </Drawer>,
    );

    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  });
});
