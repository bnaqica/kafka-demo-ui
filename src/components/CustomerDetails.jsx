import { GENDER_LABELS, formatAddress } from '../format.js';

export default function CustomerDetails({ customer, canEdit, onEdit, onDelete }) {
  return (
    <div className="details">
      <dl>
        <dt>Email</dt>
        <dd>{customer.email}</dd>
        <dt>Date of birth</dt>
        <dd>{customer.dateOfBirth}</dd>
        <dt>Gender</dt>
        <dd>{GENDER_LABELS[customer.gender]}</dd>
        <dt>Address</dt>
        <dd>{formatAddress(customer.address)}</dd>
        <dt>Phones</dt>
        <dd>
          {customer.phones.length === 0 ? (
            <span className="muted">None</span>
          ) : (
            <span className="chips">
              {customer.phones.map((phone) => (
                <span className="chip" key={phone.id}>
                  <span className="chip-type">{phone.type}</span>
                  <span>{phone.number}</span>
                </span>
              ))}
            </span>
          )}
        </dd>
      </dl>
      {canEdit && (
        <div className="form-actions">
          <button type="button" onClick={() => onEdit(customer)}>
            Edit
          </button>
          <button type="button" className="danger" onClick={() => onDelete(customer)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
