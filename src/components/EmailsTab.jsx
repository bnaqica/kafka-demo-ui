import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { usePolling } from '../usePolling.js';
import { timeAgo } from '../format.js';
import { US_STATES } from '../usStates.js';
import EventBadge from './EventBadge.jsx';
import Skeleton from './Skeleton.jsx';

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

export default function EmailsTab({ onTotal }) {
  const [lastNameInput, setLastNameInput] = useState('');
  const [lastName, setLastName] = useState('');
  const [state, setState] = useState('');
  const [page, setPage] = useState(0);

  // Only a real change to the typed name filters and resets the page; opening the tab must not.
  useEffect(() => {
    if (lastNameInput === lastName) return undefined;
    const id = setTimeout(() => {
      setLastName(lastNameInput);
      setPage(0);
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [lastNameInput, lastName]);

  const load = useCallback(() => api.listEmails({ lastName, state, page, size: PAGE_SIZE }), [lastName, state, page]);
  const { data, error } = usePolling(load);

  useEffect(() => {
    if (data) onTotal?.(data.totalElements);
  }, [data, onTotal]);

  // The list can shrink under a page (a narrower filter, a deleted email); step back so there's no dead end.
  if (data && data.page === page && page > 0 && page >= data.totalPages) {
    setPage(Math.max(data.totalPages - 1, 0));
  }

  function changeState(event) {
    setState(event.target.value);
    setPage(0);
  }

  return (
    <section className="card">
      <h2>Emails sent</h2>
      <div className="filters">
        <label>
          Last name
          <input value={lastNameInput} onChange={(event) => setLastNameInput(event.target.value)} />
        </label>
        <label>
          State
          <select value={state} onChange={changeState}>
            <option value="">All</option>
            {US_STATES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="status status-error">
          Email service: {error}
        </p>
      )}
      {!error && !data && <Skeleton label="Loading emails" />}
      {!error && data?.content.length === 0 && <p className="empty">No emails match.</p>}
      {!error && data?.content.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Customer</th>
                <th scope="col">Event</th>
                <th scope="col">Sent</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((email) => (
                <tr key={email.id}>
                  <td>
                    <span className="cell-title">{email.subject}</span>
                    <span className="muted">to {email.to}</span>
                  </td>
                  <td data-label="Customer">
                    {email.lastName ?? '—'} · {email.state ?? '—'}
                  </td>
                  <td data-label="Event">{email.eventType ? <EventBadge type={email.eventType} /> : '—'}</td>
                  <td data-label="Sent">
                    <time dateTime={email.sentAt} title={new Date(email.sentAt).toLocaleString()}>
                      {timeAgo(email.sentAt)}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pager">
            <button type="button" className="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span className="muted">
              Page {data.page + 1} of {data.totalPages} ({data.totalElements} emails)
            </span>
            <button
              type="button"
              className="secondary"
              disabled={page + 1 >= data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
