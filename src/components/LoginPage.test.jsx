import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage.jsx';

describe('LoginPage', () => {
  it('signs in when asked', async () => {
    const onSignIn = vi.fn();
    render(<LoginPage onSignIn={onSignIn} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSignIn).toHaveBeenCalled();
  });

  it('says when sign-in is unavailable', () => {
    render(<LoginPage unavailable onSignIn={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Sign-in is unavailable');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });
});
