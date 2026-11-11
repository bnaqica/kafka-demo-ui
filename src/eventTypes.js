// The customer-change-event types, in contract order. Each keeps the same colour slot (--series-N in index.css)
// everywhere it appears, so a colour always means the same type. The order is the validated categorical order.
export const EVENT_TYPES = [
  { type: 'customer-addition', label: 'Added', slot: 1 },
  { type: 'customer-change', label: 'Changed', slot: 2 },
  { type: 'customer-address-change', label: 'Address changed', slot: 3 },
  { type: 'customer-phone-add', label: 'Phone added', slot: 4 },
  { type: 'customer-phone-change', label: 'Phone changed', slot: 5 },
  { type: 'customer-phone-delete', label: 'Phone removed', slot: 6 },
  { type: 'customer-delete', label: 'Removed', slot: 7 },
];

/** A known type, or an unknown one with its raw name and the neutral colour. */
export function describeEventType(type) {
  return EVENT_TYPES.find((known) => known.type === type) ?? { type, label: type, slot: null };
}
