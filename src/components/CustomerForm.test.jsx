import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CustomerForm from './CustomerForm.jsx';
import { api } from '../api/client.js';

vi.mock('../api/client.js', () => ({ api: { createCustomer: vi.fn(), updateCustomer: vi.fn() } }));

const EXISTING = {
  id: '1',
  firstName: 'Ada',
  middleName: null,
  lastName: 'Lovelace',
  dateOfBirth: '1990-12-10',
  gender: 'FEMALE',
  email: 'ada@example.com',
  address: { street: '1 Main St', apartment: null, city: 'Albany', state: 'NY', zip: '12207' },
  phones: [{ id: 'p1', type: 'CELL', number: '555-0100' }],
};

async function fillRequired(user) {
  await user.type(screen.getByLabelText('First name'), 'Ada');
  await user.type(screen.getByLabelText('Last name'), 'Lovelace');
  await user.type(screen.getByLabelText('Date of birth'), '1990-12-10');
  await user.selectOptions(screen.getByLabelText('Gender'), 'FEMALE');
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Street'), '1 Main St');
  await user.type(screen.getByLabelText('City'), 'Albany');
  await user.selectOptions(screen.getByLabelText('State'), 'NY');
  await user.type(screen.getByLabelText('ZIP'), '12207');
}

const submit = (user) => user.click(screen.getByRole('button', { name: 'Create customer' }));
const keys = () => api.createCustomer.mock.calls.map((call) => call[1]);

describe('CustomerForm', () => {
  beforeEach(() => vi.resetAllMocks());

  it('adds a customer with every field', async () => {
    api.createCustomer.mockResolvedValue({ id: '1' });
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(<CustomerForm onSaved={onSaved} onCancel={vi.fn()} />);

    await fillRequired(user);
    await user.type(screen.getByLabelText('Middle name'), 'King');
    await user.type(screen.getByLabelText('Apartment'), '4B');
    await user.click(screen.getByRole('button', { name: 'Add phone' }));
    await user.selectOptions(screen.getByLabelText('Phone 1 type'), 'WORK');
    await user.type(screen.getByLabelText('Phone 1 number'), '555-0100');
    await submit(user);

    expect(api.createCustomer.mock.calls[0][0]).toEqual({
      firstName: 'Ada',
      middleName: 'King',
      lastName: 'Lovelace',
      dateOfBirth: '1990-12-10',
      gender: 'FEMALE',
      email: 'ada@example.com',
      address: { street: '1 Main St', apartment: '4B', city: 'Albany', state: 'NY', zip: '12207' },
      phones: [{ type: 'WORK', number: '555-0100' }],
    });
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('sends empty optional fields as null', async () => {
    api.createCustomer.mockResolvedValue({ id: '1' });
    const user = userEvent.setup();
    render(<CustomerForm onSaved={vi.fn()} onCancel={vi.fn()} />);

    await fillRequired(user);
    await submit(user);

    const body = api.createCustomer.mock.calls[0][0];
    expect(body.middleName).toBeNull();
    expect(body.address.apartment).toBeNull();
    expect(body.phones).toEqual([]);
  });

  it('removes a phone row', async () => {
    const user = userEvent.setup();
    render(<CustomerForm customer={EXISTING} onSaved={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Remove phone 1' }));

    expect(screen.queryByLabelText('Phone 1 number')).not.toBeInTheDocument();
  });

  it('edits a customer with its existing values', async () => {
    api.updateCustomer.mockResolvedValue(EXISTING);
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(<CustomerForm customer={EXISTING} onSaved={onSaved} onCancel={vi.fn()} />);

    const city = screen.getByLabelText('City');
    expect(city).toHaveValue('Albany');
    await user.clear(city);
    await user.type(city, 'Troy');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    const [id, body] = api.updateCustomer.mock.calls[0];
    expect(id).toBe('1');
    expect(body.address.city).toBe('Troy');
    expect(body.phones).toEqual([{ type: 'CELL', number: '555-0100' }]);
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('stays open and shows the error from the service', async () => {
    api.createCustomer.mockRejectedValue(new Error('A customer with this email already exists'));
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(<CustomerForm onSaved={onSaved} onCancel={vi.fn()} />);

    await fillRequired(user);
    await submit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('already exists');
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByLabelText('First name')).toHaveValue('Ada');
  });

  it('cancels', async () => {
    const onCancel = vi.fn();
    render(<CustomerForm onSaved={vi.fn()} onCancel={onCancel} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('reuses the idempotency key when an unchanged submission is retried', async () => {
    api.createCustomer.mockRejectedValue(new Error('Failed to fetch'));
    const user = userEvent.setup();
    render(<CustomerForm onSaved={vi.fn()} onCancel={vi.fn()} />);

    await fillRequired(user);
    await submit(user);
    await screen.findByRole('alert');
    await submit(user);

    await waitFor(() => expect(keys()).toHaveLength(2));
    expect(keys()[0]).toBeTruthy();
    expect(keys()[1]).toBe(keys()[0]);
  });

  it('uses a new key after the form changes', async () => {
    api.createCustomer.mockRejectedValue(new Error('Failed to fetch'));
    const user = userEvent.setup();
    render(<CustomerForm onSaved={vi.fn()} onCancel={vi.fn()} />);

    await fillRequired(user);
    await submit(user);
    await screen.findByRole('alert');
    await user.type(screen.getByLabelText('City'), 'x');
    await submit(user);

    await waitFor(() => expect(keys()).toHaveLength(2));
    expect(keys()[1]).not.toBe(keys()[0]);
  });

  it('uses a new key after a successful save', async () => {
    api.createCustomer.mockResolvedValue({ id: '1' });
    const user = userEvent.setup();
    render(<CustomerForm onSaved={vi.fn()} onCancel={vi.fn()} />);

    await fillRequired(user);
    await submit(user);
    await waitFor(() => expect(keys()).toHaveLength(1));
    await screen.findByRole('button', { name: 'Create customer' });
    await submit(user);

    await waitFor(() => expect(keys()).toHaveLength(2));
    expect(keys()[1]).not.toBe(keys()[0]);
  });

  it('locks the form, including Cancel, while a save is in flight', async () => {
    api.createCustomer.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<CustomerForm onSaved={vi.fn()} onCancel={vi.fn()} />);

    await fillRequired(user);
    await submit(user);

    expect(screen.getByLabelText('First name')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Create customer' })).toBeDisabled();
  });

  it('does not allow a date of birth in the future', () => {
    render(<CustomerForm onSaved={vi.fn()} onCancel={vi.fn()} />);

    const today = new Date().toISOString().slice(0, 10);
    expect(screen.getByLabelText('Date of birth').getAttribute('max') <= today).toBe(true);
  });

  it('checks the phone number format the way the browser will', async () => {
    const user = userEvent.setup();
    render(<CustomerForm onSaved={vi.fn()} onCancel={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Add phone' }));

    const pattern = new RegExp(`^(?:${screen.getByLabelText('Phone 1 number').getAttribute('pattern')})$`, 'v');

    expect(pattern.test('(518) 555-0100')).toBe(true);
    expect(pattern.test('+1 518 555 0100')).toBe(true);
    expect(pattern.test('abc')).toBe(false);
    expect(pattern.test('12345')).toBe(false);
  });
});
