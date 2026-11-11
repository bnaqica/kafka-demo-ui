import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CustomerList from './CustomerList.jsx';

const ADA = {
  id: '1',
  firstName: 'Ada',
  middleName: 'King',
  lastName: 'Lovelace',
  dateOfBirth: '1990-12-10',
  gender: 'PREFER_NOT_TO_SAY',
  email: 'ada@example.com',
  address: { street: '1 Main St', apartment: 'Apt 4B', city: 'Albany', state: 'NY', zip: '12207' },
  phones: [{ id: 'p1', type: 'CELL', number: '555-0100' }],
};

describe('CustomerList', () => {
  it('shows one row per customer with name, email, location and phones', () => {
    render(<CustomerList customers={[ADA]} onView={vi.fn()} />);

    const row = screen.getByRole('row', { name: /Ada King Lovelace/ });
    expect(within(row).getByText('AL')).toBeInTheDocument();
    expect(within(row).getByText('ada@example.com')).toBeInTheDocument();
    expect(within(row).getByText('Albany, NY')).toBeInTheDocument();
    expect(within(row).getByText('CELL')).toBeInTheDocument();
    expect(within(row).getByText('555-0100')).toBeInTheDocument();
  });

  it('leaves birth date, gender and street for the detail view', () => {
    render(<CustomerList customers={[ADA]} onView={vi.fn()} />);

    expect(screen.queryByText(/1990-12-10/)).not.toBeInTheDocument();
    expect(screen.queryByText(/1 Main St/)).not.toBeInTheDocument();
  });

  it('opens the detail view from the name', async () => {
    const onView = vi.fn();
    render(<CustomerList customers={[ADA]} onView={onView} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Ada King Lovelace' }));

    expect(onView).toHaveBeenCalledWith(ADA);
  });

  it('shows no edit or delete controls to someone who cannot edit', () => {
    render(<CustomerList customers={[ADA]} onView={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /Edit|Delete/ })).not.toBeInTheDocument();
  });

  it('lets an admin edit or delete from the row', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<CustomerList customers={[ADA]} canEdit onView={vi.fn()} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Edit Ada Lovelace' }));
    await user.click(screen.getByRole('button', { name: 'Delete Ada Lovelace' }));

    expect(onEdit).toHaveBeenCalledWith(ADA);
    expect(onDelete).toHaveBeenCalledWith(ADA);
  });

  it('shows placeholder rows while loading', () => {
    render(<CustomerList onView={vi.fn()} />);

    expect(screen.getByRole('status', { name: 'Loading customers' })).toBeInTheDocument();
  });

  it('shows the empty and error states', () => {
    const { rerender } = render(<CustomerList customers={[]} emptyMessage="No customers yet." onView={vi.fn()} />);
    expect(screen.getByText('No customers yet.')).toBeInTheDocument();

    rerender(<CustomerList error="boom" onView={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('boom');
  });
});
