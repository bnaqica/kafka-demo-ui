// Thin fetch wrappers for the three services. Paths are relative: Vite proxies
// them in dev (vite.config.js) and nginx proxies them in the container (docker/nginx.conf).

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
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

export const api = {
  listCustomers: () => request('/api/customers'),
  createCustomer: (customer) =>
    request('/api/customers', { method: 'POST', body: JSON.stringify(customer) }),
  listEmails: () => request('/api/emails'),
  analyticsSummary: () => request('/api/analytics/summary'),
  recentEvents: (limit = 10) => request(`/api/analytics/events?limit=${limit}`),
};
