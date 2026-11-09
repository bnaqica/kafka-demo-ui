import { useState } from 'react';
import { api } from '../api/client.js';

const EMPTY = { firstName: '', lastName: '', email: '' };

export default function CustomerForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ state: 'saving', message: '' });
    try {
      const created = await api.createCustomer(form);
      setForm(EMPTY);
      setStatus({ state: 'saved', message: `Created ${created.firstName} ${created.lastName}` });
      onCreated?.(created);
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  }

  return (
    <form className="customer-form" onSubmit={handleSubmit}>
      <label>
        First name
        <input value={form.firstName} onChange={update('firstName')} required maxLength={100} />
      </label>
      <label>
        Last name
        <input value={form.lastName} onChange={update('lastName')} required maxLength={100} />
      </label>
      <label>
        Email
        <input type="email" value={form.email} onChange={update('email')} required maxLength={255} />
      </label>
      <button type="submit" disabled={status.state === 'saving'}>
        {status.state === 'saving' ? 'Creating…' : 'Create customer'}
      </button>
      {status.message && (
        <p role={status.state === 'error' ? 'alert' : 'status'} className={`status status-${status.state}`}>
          {status.message}
        </p>
      )}
    </form>
  );
}
