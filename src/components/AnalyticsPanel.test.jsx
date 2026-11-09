import { render, screen } from '@testing-library/react';
import AnalyticsPanel from './AnalyticsPanel.jsx';

describe('AnalyticsPanel', () => {
  it('shows totals and counts by event type', () => {
    render(<AnalyticsPanel summary={{ totalEvents: 5, eventsByType: { CUSTOMER_CREATED: 3, EMAIL_SENT: 2 } }} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('CUSTOMER_CREATED')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows the service error', () => {
    render(<AnalyticsPanel error="502 Bad Gateway" />);

    expect(screen.getByRole('alert')).toHaveTextContent('502 Bad Gateway');
  });
});
