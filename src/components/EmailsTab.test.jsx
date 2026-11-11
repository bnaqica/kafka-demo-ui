import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EmailsTab from './EmailsTab.jsx';
import { api } from '../api/client.js';

vi.mock('../api/client.js', () => ({ api: { listEmails: vi.fn() } }));

const email = (id, subject) => ({
  id,
  subject,
  to: 'ada@example.com',
  lastName: 'Lovelace',
  state: 'NY',
  eventType: 'customer-phone-add',
  sentAt: new Date(Date.now() - 2 * 60_000).toISOString(),
});
const page = (number, totalPages, content = [email(`e${number}`, `Subject ${number}`)]) => ({
  content,
  page: number,
  size: 20,
  totalElements: totalPages * 20,
  totalPages,
});
const lastQuery = () => api.listEmails.mock.calls.at(-1)[0];

describe('EmailsTab', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.listEmails.mockImplementation(({ page: number }) => Promise.resolve(page(number, 3)));
  });

  it('shows the first page with the current page and total', async () => {
    render(<EmailsTab />);

    expect(await screen.findByText('Subject 0')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3 (60 emails)')).toBeInTheDocument();
    expect(lastQuery()).toEqual({ lastName: '', state: '', page: 0, size: 20 });
  });

  it('moves to the next page', async () => {
    const user = userEvent.setup();
    render(<EmailsTab />);
    await screen.findByText('Subject 0');

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Subject 1')).toBeInTheDocument();
  });

  it('disables previous on the first page', async () => {
    render(<EmailsTab />);
    await screen.findByText('Subject 0');

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('disables next on the last page', async () => {
    api.listEmails.mockResolvedValue(page(0, 1));
    render(<EmailsTab />);
    await screen.findByText('Subject 0');

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('says when nothing matches', async () => {
    api.listEmails.mockResolvedValue({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
    render(<EmailsTab />);

    expect(await screen.findByText('No emails match.')).toBeInTheDocument();
  });

  it('shows a service error', async () => {
    api.listEmails.mockRejectedValue(new Error('403 Forbidden'));
    render(<EmailsTab />);

    expect(await screen.findByRole('alert')).toHaveTextContent('403 Forbidden');
  });

  it('returns to the first page when a filter changes', async () => {
    const user = userEvent.setup();
    render(<EmailsTab />);
    await screen.findByText('Subject 0');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Subject 1');

    await user.selectOptions(screen.getByLabelText('State'), 'NY');

    await waitFor(() => expect(lastQuery()).toEqual({ lastName: '', state: 'NY', page: 0, size: 20 }));
  });

  it('waits for typing to pause before filtering by last name', async () => {
    const user = userEvent.setup();
    render(<EmailsTab />);
    await screen.findByText('Subject 0');
    const before = api.listEmails.mock.calls.length;

    await user.type(screen.getByLabelText('Last name'), 'Lov');

    await waitFor(() => expect(lastQuery().lastName).toBe('Lov'));
    const filtered = api.listEmails.mock.calls.slice(before).filter(([query]) => query.lastName !== '');
    expect(filtered.map(([query]) => query.lastName)).toEqual(['Lov']);
  });

  it('returns to the first page when the last name changes', async () => {
    const user = userEvent.setup();
    render(<EmailsTab />);
    await screen.findByText('Subject 0');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Subject 1');

    await user.type(screen.getByLabelText('Last name'), 'L');

    await waitFor(() => expect(lastQuery()).toEqual({ lastName: 'L', state: '', page: 0, size: 20 }));
  });

  it('steps back to the last page when the current one no longer exists', async () => {
    api.listEmails.mockImplementation(({ page: number }) =>
      Promise.resolve(number === 0 ? page(0, 2) : { content: [], page: number, size: 20, totalElements: 20, totalPages: 1 }),
    );
    const user = userEvent.setup();
    render(<EmailsTab />);
    await screen.findByText('Subject 0');

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(lastQuery().page).toBe(0));
    expect(await screen.findByText('Subject 0')).toBeInTheDocument();
  });

  it('shows each email as a table row with its event and a relative time', async () => {
    render(<EmailsTab />);

    const row = await screen.findByRole('row', { name: /Subject 0/ });
    expect(row).toHaveTextContent('ada@example.com');
    expect(row).toHaveTextContent('Lovelace · NY');
    expect(row).toHaveTextContent('Phone added');
    expect(row).toHaveTextContent('2 min ago');
  });

  it('reports the total so the tab can show it', async () => {
    const onTotal = vi.fn();
    render(<EmailsTab onTotal={onTotal} />);

    await waitFor(() => expect(onTotal).toHaveBeenCalledWith(60));
  });

  it('shows placeholder rows while loading', () => {
    api.listEmails.mockReturnValue(new Promise(() => {}));
    render(<EmailsTab />);

    expect(screen.getByRole('status', { name: 'Loading emails' })).toBeInTheDocument();
  });

  it('keeps a page chosen right after opening', async () => {
    const user = userEvent.setup();
    render(<EmailsTab />);
    await screen.findByText('Subject 0');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(lastQuery().page).toBe(1);
  });
});
