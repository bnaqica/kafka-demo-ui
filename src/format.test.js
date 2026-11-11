import { describe, expect, it } from 'vitest';
import { initials, timeAgo } from './format.js';

const NOW = Date.parse('2026-11-11T12:00:00Z');

describe('timeAgo', () => {
  it.each([
    ['2026-11-11T11:59:40Z', 'just now'],
    ['2026-11-11T11:58:00Z', '2 min ago'],
    ['2026-11-11T09:00:00Z', '3 h ago'],
    ['2026-11-09T12:00:00Z', '2 d ago'],
  ])('describes %s as %s', (iso, expected) => {
    expect(timeAgo(iso, NOW)).toBe(expected);
  });

  it('gives a date for anything older than a week', () => {
    expect(timeAgo('2026-10-01T12:00:00Z', NOW)).toMatch(/2026/);
  });
});

describe('initials', () => {
  it.each([
    ['Ada Lovelace', 'AL'],
    ['Ada King Lovelace', 'AL'],
    ['Viewer', 'V'],
    ['  ', '?'],
  ])('turns %j into %s', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
