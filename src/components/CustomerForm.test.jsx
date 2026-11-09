import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CustomerForm from './CustomerForm.jsx';
import { api } from '../api/client.js';

vi.mock('../api/client.js', () => ({ api: { createCustomer: vi.fn() } }));

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('First name'), 'Ada');
  await user.type(screen.getByLabelText('Last name'), 'Lovelace');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.click(screen.getByRole('button', { name: 'Create customer' }));
}

describe('CustomerForm', () => {
  beforeEach(() => vi.resetAllMocks());

  it('creates the customer and reports success', async () => {
    api.createCustomer.mockResolvedValue({ id: '1', firstName: 'Ada', lastName: 'Lovelace' });
    const onCreated = vi.fn();
    render(<CustomerForm onCreated={onCreated} />);

    await fillAndSubmit();

    expect(api.createCustomer).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Created Ada Lovelace');
    expect(onCreated).toHaveBeenCalled();
  });

  it('shows the error from the API', async () => {
    api.createCustomer.mockRejectedValue(new Error('A customer with email ada@example.com already exists'));
    render(<CustomerForm />);

    await fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('already exists');
  });
});
