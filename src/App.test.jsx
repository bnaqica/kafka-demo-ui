import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import { api } from './api/client.js';
import { initSession, onSessionEnded, signOut } from './auth/session.js';

vi.mock('./auth/session.js', () => ({
  initSession: vi.fn(),
  onSessionEnded: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('./api/client.js', () => ({
  api: {
    listCustomers: vi.fn(),
    listEmails: vi.fn(),
    analyticsSummary: vi.fn(),
    createCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
  },
}));

const ADMIN = { name: 'Admin User', isAdmin: true };
const VIEWER = { name: 'Viewer User', isAdmin: false };

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.listCustomers.mockResolvedValue([]);
    api.analyticsSummary.mockResolvedValue({ totalEvents: 0, eventsByType: {} });
    api.listEmails.mockResolvedValue({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
  });

  it('shows only the login page without a session and requests nothing', async () => {
    initSession.mockResolvedValue(null);

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(api.listCustomers).not.toHaveBeenCalled();
  });

  it('says sign-in is unavailable when Keycloak cannot be reached', async () => {
    initSession.mockRejectedValue(new Error('network'));

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Sign-in is unavailable');
  });

  it('opens the app with the user name once signed in', async () => {
    initSession.mockResolvedValue(VIEWER);

    render(<App />);

    expect(await screen.findByText('Viewer User')).toBeInTheDocument();
    await waitFor(() => expect(api.listCustomers).toHaveBeenCalled());
  });

  it('gives a viewer an Analytics tab, loaded only when opened', async () => {
    initSession.mockResolvedValue(VIEWER);
    render(<App />);
    const tab = await screen.findByRole('tab', { name: /^Analytics/ });
    expect(screen.queryByRole('heading', { name: 'Analytics' })).not.toBeInTheDocument();
    expect(api.analyticsSummary).not.toHaveBeenCalled();

    await userEvent.setup().click(tab);

    expect(await screen.findByRole('heading', { name: 'Analytics' })).toBeInTheDocument();
    await waitFor(() => expect(api.analyticsSummary).toHaveBeenCalled());
  });

  it('gives an admin the Analytics tab too', async () => {
    initSession.mockResolvedValue(ADMIN);

    render(<App />);

    expect(await screen.findByRole('tab', { name: /^Analytics/ })).toBeInTheDocument();
  });

  it('hides the customers while the Analytics tab is open', async () => {
    initSession.mockResolvedValue(VIEWER);
    render(<App />);

    await userEvent.setup().click(await screen.findByRole('tab', { name: /^Analytics/ }));

    expect(screen.queryByRole('heading', { name: 'Customers' })).not.toBeInTheDocument();
  });

  it('gives a viewer no Emails tab and never calls the email API', async () => {
    initSession.mockResolvedValue(VIEWER);

    render(<App />);
    await screen.findByText('Viewer User');

    expect(screen.queryByRole('tab', { name: /^Emails/ })).not.toBeInTheDocument();
    expect(api.listEmails).not.toHaveBeenCalled();
  });

  it('gives an admin the Emails tab, loaded only when opened', async () => {
    initSession.mockResolvedValue(ADMIN);
    render(<App />);
    const tab = await screen.findByRole('tab', { name: /^Emails/ });
    expect(api.listEmails).not.toHaveBeenCalled();

    await userEvent.setup().click(tab);

    await waitFor(() => expect(api.listEmails).toHaveBeenCalled());
  });

  it('gives only an admin the add customer control', async () => {
    initSession.mockResolvedValue(ADMIN);

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Add customer' })).toBeInTheDocument();
  });

  it('hides the add customer control from a viewer', async () => {
    initSession.mockResolvedValue(VIEWER);

    render(<App />);
    await screen.findByText('Viewer User');

    expect(screen.queryByRole('button', { name: 'Add customer' })).not.toBeInTheDocument();
  });

  it('signs out', async () => {
    initSession.mockResolvedValue(VIEWER);
    render(<App />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /Account menu/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(signOut).toHaveBeenCalled();
  });

  it('returns to the login page when the session ends', async () => {
    initSession.mockResolvedValue(VIEWER);
    let endSession;
    onSessionEnded.mockImplementation((callback) => {
      endSession = callback;
    });
    render(<App />);
    await screen.findByText('Viewer User');

    endSession();

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('Viewer User')).not.toBeInTheDocument();
  });

  it('keeps the app working when analytics fails', async () => {
    initSession.mockResolvedValue(VIEWER);
    api.analyticsSummary.mockRejectedValue(new Error('502 Bad Gateway'));
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('tab', { name: /^Analytics/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('502 Bad Gateway');
    await user.click(screen.getByRole('tab', { name: /^Customers/ }));

    expect(await screen.findByText('No customers yet.')).toBeInTheDocument();
  });


  describe('as an admin managing customers', () => {
    const ADA = {
      id: '1',
      firstName: 'Ada',
      middleName: null,
      lastName: 'Lovelace',
      dateOfBirth: '1990-12-10',
      gender: 'FEMALE',
      email: 'ada@example.com',
      address: { street: '1 Main St', apartment: null, city: 'Albany', state: 'NY', zip: '12207' },
      phones: [],
    };

    beforeEach(() => {
      initSession.mockResolvedValue(ADMIN);
      api.listCustomers.mockResolvedValue([ADA]);
    });

    it('opens the add form in a drawer that Escape closes', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(await screen.findByRole('button', { name: 'Add customer' }));

      expect(screen.getByRole('dialog', { name: 'New customer' })).toContainElement(screen.getByLabelText('First name'));
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows the details in a drawer and edits from there', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(await screen.findByRole('button', { name: 'Ada Lovelace' }));

      const details = screen.getByRole('dialog', { name: 'Ada Lovelace' });
      expect(details).toHaveTextContent('1990-12-10');
      await user.click(within(details).getByRole('button', { name: 'Edit' }));

      expect(screen.getByRole('dialog', { name: 'Edit Ada Lovelace' })).toBeInTheDocument();
      expect(screen.getByLabelText('City')).toHaveValue('Albany');
    });

    it('counts the customers on their tab', async () => {
      render(<App />);

      expect(await screen.findByRole('tab', { name: 'Customers 1' })).toBeInTheDocument();
    });

    it('moves between tabs with the arrow keys', async () => {
      const user = userEvent.setup();
      render(<App />);
      const customers = await screen.findByRole('tab', { name: /^Customers/ });
      customers.focus();

      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('tab', { name: /^Emails/ })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /^Emails/ })).toHaveFocus();
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName(/^Emails/);
    });

    it('filters customers by name, email or state', async () => {
      api.listCustomers.mockResolvedValue([ADA, { ...ADA, id: '2', firstName: 'Alan', lastName: 'Turing', email: 'alan@example.com', address: { ...ADA.address, state: 'MA' } }]);
      const user = userEvent.setup();
      render(<App />);
      await screen.findByRole('button', { name: 'Alan Turing' });

      await user.type(screen.getByRole('searchbox', { name: 'Search customers' }), 'ma');

      expect(screen.getByRole('button', { name: 'Alan Turing' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Ada Lovelace' })).not.toBeInTheDocument();
      await user.clear(screen.getByRole('searchbox', { name: 'Search customers' }));
      await user.type(screen.getByRole('searchbox', { name: 'Search customers' }), 'zzz');
      expect(screen.getByText('No customers match "zzz".')).toBeInTheDocument();
    });

    it('shows that the page is live', async () => {
      render(<App />);

      expect(await screen.findByText('Live')).toBeInTheDocument();
    });

    it('closes the form and reloads the list after a save', async () => {
      api.createCustomer.mockResolvedValue({ id: '2' });
      const user = userEvent.setup();
      render(<App />);
      await user.click(await screen.findByRole('button', { name: 'Add customer' }));
      const before = api.listCustomers.mock.calls.length;
      await user.type(screen.getByLabelText('First name'), 'Grace');
      await user.type(screen.getByLabelText('Last name'), 'Hopper');
      await user.type(screen.getByLabelText('Date of birth'), '1990-12-09');
      await user.selectOptions(screen.getByLabelText('Gender'), 'FEMALE');
      await user.type(screen.getByLabelText('Email'), 'grace@example.com');
      await user.type(screen.getByLabelText('Street'), '7 Court');
      await user.type(screen.getByLabelText('City'), 'Arlington');
      await user.selectOptions(screen.getByLabelText('State'), 'VA');
      await user.type(screen.getByLabelText('ZIP'), '22201');
      await user.click(screen.getByRole('button', { name: 'Create customer' }));

      await waitFor(() => expect(screen.queryByLabelText('First name')).not.toBeInTheDocument());
      expect(api.listCustomers.mock.calls.length).toBeGreaterThan(before);
      expect(screen.getByRole('status')).toHaveTextContent('Customer added');
    });

    it('deletes a customer after confirming, and says so', async () => {
      api.deleteCustomer.mockResolvedValue(null);
      const user = userEvent.setup();
      render(<App />);
      await user.click(await screen.findByRole('button', { name: 'Delete Ada Lovelace' }));
      const before = api.listCustomers.mock.calls.length;

      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }));

      await waitFor(() => expect(api.deleteCustomer).toHaveBeenCalledWith('1'));
      await waitFor(() => expect(api.listCustomers.mock.calls.length).toBeGreaterThan(before));
      expect(await screen.findByRole('status')).toHaveTextContent('Customer deleted');
    });

    it('deletes nothing when the confirmation is cancelled', async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(await screen.findByRole('button', { name: 'Delete Ada Lovelace' }));

      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(api.deleteCustomer).not.toHaveBeenCalled();
    });

    it('shows an error when a delete fails', async () => {
      api.deleteCustomer.mockRejectedValue(new Error('Customer not found'));
      const user = userEvent.setup();
      render(<App />);
      await user.click(await screen.findByRole('button', { name: 'Delete Ada Lovelace' }));

      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Customer not found');
    });
  });
});
