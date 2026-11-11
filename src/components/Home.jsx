import { useCallback, useState } from 'react';
import { api } from '../api/client.js';
import { fullName, shortName } from '../format.js';
import { usePolling } from '../usePolling.js';
import AnalyticsTab from './AnalyticsTab.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import CustomerDetails from './CustomerDetails.jsx';
import CustomerForm from './CustomerForm.jsx';
import CustomerList from './CustomerList.jsx';
import Drawer from './Drawer.jsx';
import EmailsTab from './EmailsTab.jsx';
import { LogoMark, PlusIcon, SearchIcon } from './Icons.jsx';
import { useToasts } from '../useToasts.js';
import Toasts from './Toasts.jsx';
import UserMenu from './UserMenu.jsx';

const TABS = [
  { id: 'customers', label: 'Customers' },
  { id: 'emails', label: 'Emails', adminOnly: true },
  { id: 'analytics', label: 'Analytics' },
];

function matches(customer, query) {
  const text = `${fullName(customer)} ${customer.email} ${customer.address.state}`.toLowerCase();
  return text.includes(query.trim().toLowerCase());
}

export default function Home({ user, onSignOut }) {
  const customers = usePolling(api.listCustomers);
  const { toasts, show, dismiss } = useToasts();
  const [tab, setTab] = useState('customers');
  const [totals, setTotals] = useState({});
  const [query, setQuery] = useState('');
  const [drawer, setDrawer] = useState(null); // { mode: 'new' | 'edit' | 'view', customer }
  const [confirming, setConfirming] = useState(null);

  const tabs = TABS.filter((t) => !t.adminOnly || user.isAdmin);
  const counts = { ...totals, customers: customers.data?.length };
  const onEmailsTotal = useCallback((total) => setTotals((current) => ({ ...current, emails: total })), []);
  const onAnalyticsTotal = useCallback((total) => setTotals((current) => ({ ...current, analytics: total })), []);
  const closeDrawer = useCallback(() => setDrawer(null), []);
  const cancelDelete = useCallback(() => setConfirming(null), []);

  const visible = customers.data?.filter((customer) => matches(customer, query));

  function selectTab(id) {
    setTab(id);
    document.getElementById(`tab-${id}`)?.focus();
  }

  function onTabKey(event) {
    const index = tabs.findIndex((t) => t.id === tab);
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTab(tabs[(next + tabs.length) % tabs.length].id);
  }

  function saved() {
    show(drawer?.mode === 'edit' ? 'Changes saved' : 'Customer added');
    setDrawer(null);
    customers.refresh();
  }

  function askToDelete(customer) {
    setDrawer(null);
    setConfirming(customer);
  }

  async function remove() {
    const customer = confirming;
    setConfirming(null);
    try {
      await api.deleteCustomer(customer.id);
      show('Customer deleted');
      customers.refresh();
    } catch (err) {
      show(err.message, 'error');
    }
  }

  const total = customers.data?.length ?? 0;
  const summary = query && visible ? `${visible.length} of ${total}` : `${total} ${total === 1 ? 'customer' : 'customers'}`;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">
            <LogoMark />
            Kafka Demo
          </span>
          <div className="topbar-right">
            <span className={`live ${customers.error ? 'live-off' : ''}`} title="The page refreshes every 3 seconds">
              <span className="live-dot" aria-hidden="true" />
              {customers.error ? 'Reconnecting' : 'Live'}
            </span>
            <UserMenu user={user} onSignOut={onSignOut} />
          </div>
        </div>
      </header>

      <div className="app">
        <p className="page-intro">Manage customers, then watch the email and analytics services react to the Kafka events.</p>

        <div role="tablist" aria-label="Sections" className="tabs" onKeyDown={onTabKey}>
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
            >
              {t.label}{' '}
              {counts[t.id] != null && <span className="tab-count">{counts[t.id]}</span>}
            </button>
          ))}
        </div>

        {tab === 'emails' && (
          <div role="tabpanel" id="panel-emails" aria-labelledby="tab-emails">
            <EmailsTab onTotal={onEmailsTotal} />
          </div>
        )}
        {tab === 'analytics' && (
          <div role="tabpanel" id="panel-analytics" aria-labelledby="tab-analytics">
            <AnalyticsTab onTotal={onAnalyticsTotal} />
          </div>
        )}
        <main role="tabpanel" id="panel-customers" aria-labelledby="tab-customers" hidden={tab !== 'customers'}>
          <section className="card">
            <div className="card-header">
              <div>
                <h2>Customers</h2>
                {customers.data && <span className="muted">{summary}</span>}
              </div>
              <div className="card-tools">
                <label className="search">
                  <SearchIcon />
                  <input
                    type="search"
                    aria-label="Search customers"
                    placeholder="Search name, email or state"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                {user.isAdmin && (
                  <button type="button" onClick={() => setDrawer({ mode: 'new' })}>
                    <PlusIcon />
                    Add customer
                  </button>
                )}
              </div>
            </div>
            <CustomerList
              customers={visible}
              error={customers.error}
              emptyMessage={query ? `No customers match "${query}".` : 'No customers yet.'}
              canEdit={user.isAdmin}
              onView={(customer) => setDrawer({ mode: 'view', customer })}
              onEdit={(customer) => setDrawer({ mode: 'edit', customer })}
              onDelete={askToDelete}
            />
          </section>
        </main>
      </div>

      {drawer?.mode === 'view' && (
        <Drawer title={fullName(drawer.customer)} onClose={closeDrawer}>
          <CustomerDetails
            customer={drawer.customer}
            canEdit={user.isAdmin}
            onEdit={(customer) => setDrawer({ mode: 'edit', customer })}
            onDelete={askToDelete}
          />
        </Drawer>
      )}
      {(drawer?.mode === 'new' || drawer?.mode === 'edit') && (
        <Drawer title={drawer.mode === 'new' ? 'New customer' : `Edit ${shortName(drawer.customer)}`} onClose={closeDrawer}>
          <CustomerForm key={drawer.customer?.id ?? 'new'} customer={drawer.customer} onSaved={saved} onCancel={closeDrawer} />
        </Drawer>
      )}
      {confirming && (
        <ConfirmDialog
          title={`Delete ${shortName(confirming)}?`}
          message="This removes the customer and their phones, and can't be undone."
          confirmLabel="Delete"
          onConfirm={remove}
          onCancel={cancelDelete}
        />
      )}
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
