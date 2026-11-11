import { useEffect } from 'react';
import { api } from '../api/client.js';
import { usePolling } from '../usePolling.js';
import AnalyticsPanel from './AnalyticsPanel.jsx';

/** Loads and polls the summary only while the tab is open. */
export default function AnalyticsTab({ onTotal }) {
  const summary = usePolling(api.analyticsSummary);

  useEffect(() => {
    if (summary.data) onTotal?.(summary.data.totalEvents);
  }, [summary.data, onTotal]);

  return (
    <section className="card">
      <h2>Analytics</h2>
      <AnalyticsPanel summary={summary.data} error={summary.error} />
    </section>
  );
}
