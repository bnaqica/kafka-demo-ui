import { fullName, initials, shortName } from '../format.js';
import { PencilIcon, TrashIcon } from './Icons.jsx';
import Skeleton from './Skeleton.jsx';

export default function CustomerList({ customers, error, emptyMessage = 'No customers yet.', canEdit, onView, onEdit, onDelete }) {
  if (error) return <p role="alert" className="status status-error">Customer service: {error}</p>;
  if (!customers) return <Skeleton label="Loading customers" />;
  if (customers.length === 0) return <p className="empty">{emptyMessage}</p>;

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Customer</th>
          <th scope="col">Location</th>
          <th scope="col">Phones</th>
          {canEdit && (
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {customers.map((customer) => {
          const name = shortName(customer);
          return (
            <tr key={customer.id}>
              <td>
                <div className="person">
                  <span className="avatar avatar-sm" aria-hidden="true">
                    {initials(name)}
                  </span>
                  <span className="person-text">
                    <button type="button" className="link-button" onClick={() => onView(customer)}>
                      {fullName(customer)}
                    </button>
                    <span className="muted">{customer.email}</span>
                  </span>
                </div>
              </td>
              <td data-label="Location">
                {customer.address.city}, {customer.address.state}
              </td>
              <td data-label="Phones">
                <span className="chips">
                  {customer.phones.map((phone) => (
                    <span className="chip" key={phone.id}>
                      <span className="chip-type">{phone.type}</span>
                      <span>{phone.number}</span>
                    </span>
                  ))}
                </span>
              </td>
              {canEdit && (
                <td className="row-actions">
                  <button type="button" className="icon-button" aria-label={`Edit ${name}`} onClick={() => onEdit(customer)}>
                    <PencilIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button-danger"
                    aria-label={`Delete ${name}`}
                    onClick={() => onDelete(customer)}
                  >
                    <TrashIcon />
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
