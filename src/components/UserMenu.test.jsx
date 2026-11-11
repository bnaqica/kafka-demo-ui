import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UserMenu from './UserMenu.jsx';

describe('UserMenu', () => {
  it('shows the initials and opens a menu with name, role and sign out', async () => {
    const onSignOut = vi.fn();
    const user = userEvent.setup();
    render(<UserMenu user={{ name: 'Admin User', isAdmin: true }} onSignOut={onSignOut} />);

    const button = screen.getByRole('button', { name: 'Account menu for Admin User' });
    expect(button).toHaveTextContent('AU');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(button);

    expect(screen.getByRole('menu')).toHaveTextContent('Admin User');
    expect(screen.getByRole('menu')).toHaveTextContent('Administrator');
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalled();
  });

  it('names a viewer as such', async () => {
    const user = userEvent.setup();
    render(<UserMenu user={{ name: 'Viewer User', isAdmin: false }} onSignOut={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /Account menu/ }));

    expect(screen.getByRole('menu')).toHaveTextContent('Viewer');
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<UserMenu user={{ name: 'Admin User', isAdmin: true }} onSignOut={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Account menu/ }));

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
