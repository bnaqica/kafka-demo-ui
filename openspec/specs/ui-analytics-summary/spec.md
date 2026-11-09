# ui-analytics-summary Specification

## Purpose

Shows signed-in users how many events the analytics service has saved, broken down by event type.

## Requirements

### Requirement: Summary panel
Signed-in users of either role SHALL see the total events and the count for each event type, refreshed periodically.

#### Scenario: Viewer sees counts
- **WHEN** a `customer-viewer` opens the app
- **THEN** the panel shows the totals by event type

#### Scenario: Analytics unavailable
- **WHEN** the analytics service returns an error
- **THEN** the panel shows the error and the rest of the app keeps working
