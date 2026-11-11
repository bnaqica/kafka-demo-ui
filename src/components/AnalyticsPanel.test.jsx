import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AnalyticsPanel from './AnalyticsPanel.jsx';

const SUMMARY = {
  totalEvents: 10,
  eventsByType: { 'customer-delete': 2, 'customer-addition': 5, 'customer-change': 3 },
};

describe('AnalyticsPanel', () => {
  it('leads with stat cards for the headline numbers', () => {
    render(<AnalyticsPanel summary={SUMMARY} />);

    expect(screen.getByRole('group', { name: 'Total events' })).toHaveTextContent('10');
    expect(screen.getByRole('group', { name: 'Customers added' })).toHaveTextContent('5');
    expect(screen.getByRole('group', { name: 'Customers removed' })).toHaveTextContent('2');
    expect(screen.getByRole('group', { name: 'Other changes' })).toHaveTextContent('3');
  });

  it('charts every type in the contract order with its label and count', () => {
    render(<AnalyticsPanel summary={SUMMARY} />);

    const bars = within(screen.getByRole('list', { name: 'Events by type' })).getAllByRole('listitem');
    expect(bars.map((bar) => bar.getAttribute('aria-label'))).toEqual([
      'Added: 5 events, 50%',
      'Changed: 3 events, 30%',
      'Removed: 2 events, 20%',
    ]);
  });

  it('sizes each bar against the largest count', () => {
    render(<AnalyticsPanel summary={SUMMARY} />);

    const bars = screen.getAllByTestId('bar');
    expect(bars.map((bar) => bar.style.width)).toEqual(['100%', '60%', '40%']);
  });

  it('shows a tooltip for the hovered bar', () => {
    render(<AnalyticsPanel summary={SUMMARY} />);

    fireEvent.mouseEnter(screen.getByRole('listitem', { name: /^Changed/ }));

    expect(screen.getByRole('tooltip')).toHaveTextContent('3');
    expect(screen.getByRole('tooltip')).toHaveTextContent('customer-change');
  });

  it('shows placeholders while loading and says when there is nothing yet', () => {
    const { rerender } = render(<AnalyticsPanel />);
    expect(screen.getByRole('status', { name: 'Loading analytics' })).toBeInTheDocument();

    rerender(<AnalyticsPanel summary={{ totalEvents: 0, eventsByType: {} }} />);
    expect(screen.getByText('No events yet.')).toBeInTheDocument();
  });

  it('shows the service error', () => {
    render(<AnalyticsPanel error="502 Bad Gateway" />);

    expect(screen.getByRole('alert')).toHaveTextContent('502 Bad Gateway');
  });
});
