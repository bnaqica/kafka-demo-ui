// Thin fetch wrappers for the three services. Paths are relative: Vite proxies
// them in dev (vite.config.js) and nginx proxies them in the container (docker/nginx.conf).
import { getToken } from '../auth/session.js';

async function request(path, options = {}) {
  const token = await getToken();
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const problem = await response.json();
      detail = problem.detail ?? problem.title ?? detail;
    } catch {
      // body was not JSON; keep the status text
    }
    throw new Error(detail);
  }
  return response.status === 204 ? null : response.json();
}

function emailQuery({ lastName, state, page, size }) {
  const query = new URLSearchParams({ page, size });
  if (lastName) query.set('lastName', lastName);
  if (state) query.set('state', state);
  return query.toString();
}

export const api = {
  listCustomers: () => request('/api/customers'),
  createCustomer: (customer, idempotencyKey) =>
    request('/api/customers', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(customer),
    }),
  updateCustomer: (id, customer) =>
    request(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(customer) }),
  deleteCustomer: (id) => request(`/api/customers/${id}`, { method: 'DELETE' }),
  listEmails: (criteria) => request(`/api/emails?${emailQuery(criteria)}`),
  analyticsSummary: () => request('/api/analytics/summary'),
};
