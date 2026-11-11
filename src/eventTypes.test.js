import { describe, expect, it } from 'vitest';
import { EVENT_TYPES, describeEventType } from './eventTypes.js';

describe('event types', () => {
  it('lists the seven contract types in a fixed order, each with its own colour slot', () => {
    expect(EVENT_TYPES.map((t) => t.type)).toEqual([
      'customer-addition',
      'customer-change',
      'customer-address-change',
      'customer-phone-add',
      'customer-phone-change',
      'customer-phone-delete',
      'customer-delete',
    ]);
    expect(new Set(EVENT_TYPES.map((t) => t.slot)).size).toBe(7);
  });

  it('describes a known type with a readable label', () => {
    expect(describeEventType('customer-phone-add')).toEqual({ type: 'customer-phone-add', label: 'Phone added', slot: 4 });
  });

  it('gives an unknown type a neutral colour and its raw name', () => {
    expect(describeEventType('something-new')).toEqual({ type: 'something-new', label: 'something-new', slot: null });
  });
});
