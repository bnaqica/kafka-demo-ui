# Spec Delta

## Purpose

Shows signed-in users how many events the analytics service has saved, broken down by event type.

## ADDED Requirements

### Requirement: Analytics tab
Signed-in users of either role SHALL have an Analytics tab showing the total events and the count for each event type, refreshed periodically while the tab is open.

#### Scenario: Viewer sees counts
- **WHEN** a `customer-viewer` opens the Analytics tab
- **THEN** it shows the totals by event type

#### Scenario: Analytics unavailable
- **WHEN** the analytics service returns an error
- **THEN** the tab shows the error and the other tabs keep working
