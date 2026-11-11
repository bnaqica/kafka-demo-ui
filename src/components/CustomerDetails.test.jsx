import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CustomerDetails from './CustomerDetails.jsx';

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

describe('CustomerDetails', () => {
  it('shows every detail', () => {
    render(<CustomerDetails customer={ADA} />);

    expect(screen.getByText('1990-12-10')).toBeInTheDocument();
    expect(screen.getByText('Prefer not to say')).toBeInTheDocument();
    expect(screen.getByText('1 Main St, Apt 4B, Albany, NY 12207')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText('555-0100')).toBeInTheDocument();
  });

  it('offers edit and delete only to an admin', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<CustomerDetails customer={ADA} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<CustomerDetails customer={ADA} canEdit onEdit={onEdit} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onEdit).toHaveBeenCalledWith(ADA);
    expect(onDelete).toHaveBeenCalledWith(ADA);
  });
});
