import { useState } from 'react';
import { api } from '../api/client.js';
import { US_STATES } from '../usStates.js';

const EMPTY = {
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  street: '',
  apartment: '',
  city: '',
  state: '',
  zip: '',
};
const GENDERS = [
  ['MALE', 'Male'],
  ['FEMALE', 'Female'],
  ['NON_BINARY', 'Non-binary'],
  ['PREFER_NOT_TO_SAY', 'Prefer not to say'],
];
const PHONE_TYPES = ['HOME', 'WORK', 'CELL'];
const PHONE_PATTERN = '[0-9 +\\(\\)\\-]{7,20}';
const yesterday = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

function toFields(customer) {
  if (!customer) return EMPTY;
  const { address } = customer;
  return {
    firstName: customer.firstName,
    middleName: customer.middleName ?? '',
    lastName: customer.lastName,
    dateOfBirth: customer.dateOfBirth,
    gender: customer.gender,
    email: customer.email,
    street: address.street,
    apartment: address.apartment ?? '',
    city: address.city,
    state: address.state,
    zip: address.zip,
  };
}

function toBody(fields, phones) {
  const { street, apartment, city, state, zip, middleName, ...person } = fields;
  return {
    ...person,
    middleName: middleName || null,
    address: { street, apartment: apartment || null, city, state, zip },
    phones,
  };
}

export default function CustomerForm({ customer, onSaved, onCancel }) {
  const isEdit = Boolean(customer);
  const [fields, setFields] = useState(() => toFields(customer));
  const [phones, setPhones] = useState(
    () => customer?.phones.map(({ type, number }) => ({ type, number })) ?? [],
  );
  // Kept while the form is unchanged, so retrying after a lost response can't create a second customer.
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const newKey = () => setIdempotencyKey(crypto.randomUUID());

  const update = (field) => (event) => {
    setFields({ ...fields, [field]: event.target.value });
    newKey();
  };

  function changePhones(next) {
    setPhones(next);
    newKey();
  }

  const updatePhone = (index, field) => (event) =>
    changePhones(phones.map((phone, i) => (i === index ? { ...phone, [field]: event.target.value } : phone)));

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ state: 'saving', message: '' });
    try {
      const body = toBody(fields, phones);
      const saved = isEdit
        ? await api.updateCustomer(customer.id, body)
        : await api.createCustomer(body, idempotencyKey);
      newKey();
      setStatus({ state: 'idle', message: '' });
      onSaved?.(saved);
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  }

  const textField = (label, field, props = {}) => (
    <label>
      {label}
      <input value={fields[field]} onChange={update(field)} {...props} />
    </label>
  );

  const saving = status.state === 'saving';

  return (
    <form className="customer-form" onSubmit={handleSubmit}>
      {/* Locked while saving: a late response must not act on a form that has moved on. */}
      <fieldset className="form-body" disabled={saving}>
      {textField('First name', 'firstName', { required: true, maxLength: 100 })}
      {textField('Middle name', 'middleName', { maxLength: 100 })}
      {textField('Last name', 'lastName', { required: true, maxLength: 100 })}
      {textField('Date of birth', 'dateOfBirth', { type: 'date', required: true, max: yesterday() })}
      <label>
        Gender
        <select value={fields.gender} onChange={update('gender')} required>
          <option value="">Select…</option>
          {GENDERS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {textField('Email', 'email', { type: 'email', required: true, maxLength: 255 })}
      {textField('Street', 'street', { required: true, maxLength: 255 })}
      {textField('Apartment', 'apartment', { maxLength: 50 })}
      {textField('City', 'city', { required: true, maxLength: 100 })}
      <label>
        State
        <select value={fields.state} onChange={update('state')} required>
          <option value="">Select…</option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>
      {textField('ZIP', 'zip', { required: true, pattern: '\\d{5}(-\\d{4})?', title: '5 digits or ZIP+4' })}

      <fieldset className="phones">
        <legend>Phones</legend>
        {phones.map((phone, index) => (
          <div className="phone-row" key={index}>
            <label>
              {`Phone ${index + 1} type`}
              <select value={phone.type} onChange={updatePhone(index, 'type')}>
                {PHONE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {`Phone ${index + 1} number`}
              <input
                value={phone.number}
                onChange={updatePhone(index, 'number')}
                required
                pattern={PHONE_PATTERN}
                title="7 to 20 digits, spaces or + - ( )"
              />
            </label>
            <button
              type="button"
              className="secondary"
              onClick={() => changePhones(phones.filter((_, i) => i !== index))}
            >
              {`Remove phone ${index + 1}`}
            </button>
          </div>
        ))}
        <button
          type="button"
          className="secondary"
          onClick={() => changePhones([...phones, { type: 'CELL', number: '' }])}
        >
          Add phone
        </button>
      </fieldset>

      <div className="form-actions">
        <button type="submit">
          {isEdit ? 'Save changes' : 'Create customer'}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
      </fieldset>
      {status.message && (
        <p role="alert" className="status status-error">
          {status.message}
        </p>
      )}
    </form>
  );
}
