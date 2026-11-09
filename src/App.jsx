import { api } from './api/client.js';
import { usePolling } from './usePolling.js';
import CustomerForm from './components/CustomerForm.jsx';
import CustomerList from './components/CustomerList.jsx';
import EmailList from './components/EmailList.jsx';
import AnalyticsPanel from './components/AnalyticsPanel.jsx';

export default function App() {
  const customers = usePolling(api.listCustomers);
  const emails = usePolling(api.listEmails);
  const summary = usePolling(api.analyticsSummary);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kafka Demo</h1>
        <p>Create a customer, then watch the email and analytics services react to the Kafka events.</p>
      </header>

      <main className="grid">
        <section className="card">
          <h2>New customer</h2>
          <CustomerForm onCreated={customers.refresh} />
        </section>

        <section className="card">
          <h2>Analytics</h2>
          <AnalyticsPanel summary={summary.data} error={summary.error} />
        </section>

        <section className="card">
          <h2>Customers</h2>
          <CustomerList customers={customers.data} error={customers.error} />
        </section>

        <section className="card">
          <h2>Emails sent</h2>
          <EmailList emails={emails.data} error={emails.error} />
        </section>
      </main>
    </div>
  );
}
