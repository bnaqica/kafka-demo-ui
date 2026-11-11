import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './client.js';
import { getToken } from '../auth/session.js';

vi.mock('../auth/session.js', () => ({ getToken: vi.fn() }));

function respondWith(body, status = 200) {
  fetch.mockResolvedValue(new Response(body === null ? null : JSON.stringify(body), { status }));
}

const lastCall = () => fetch.mock.calls.at(-1);

describe('api client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    getToken.mockResolvedValue('tok');
  });

  it('sends the bearer token on every call', async () => {
    respondWith([]);

    await api.listCustomers();

    expect(lastCall()[1].headers.Authorization).toBe('Bearer tok');
  });

  it('makes no request when the session has ended', async () => {
    getToken.mockRejectedValue(new Error('Your session has expired'));

    await expect(api.listCustomers()).rejects.toThrow('expired');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('creates a customer with an idempotency key', async () => {
    respondWith({ id: '1' }, 201);

    await api.createCustomer({ firstName: 'Ada' }, 'key-1');

    const [path, options] = lastCall();
    expect(path).toBe('/api/customers');
    expect(options.method).toBe('POST');
    expect(options.headers['Idempotency-Key']).toBe('key-1');
    expect(JSON.parse(options.body)).toEqual({ firstName: 'Ada' });
  });

  it('updates a customer', async () => {
    respondWith({ id: '1' });

    await api.updateCustomer('1', { firstName: 'Ada' });

    expect(lastCall()[0]).toBe('/api/customers/1');
    expect(lastCall()[1].method).toBe('PUT');
  });

  it('deletes a customer', async () => {
    respondWith(null, 204);

    await api.deleteCustomer('1');

    expect(lastCall()[0]).toBe('/api/customers/1');
    expect(lastCall()[1].method).toBe('DELETE');
  });

  it('asks for a page of emails with its filters', async () => {
    respondWith({ content: [] });

    await api.listEmails({ lastName: 'lov ace', state: 'NY', page: 2, size: 20 });

    expect(lastCall()[0]).toBe('/api/emails?page=2&size=20&lastName=lov+ace&state=NY');
  });

  it('leaves out empty filters', async () => {
    respondWith({ content: [] });

    await api.listEmails({ lastName: '', state: '', page: 0, size: 20 });

    expect(lastCall()[0]).toBe('/api/emails?page=0&size=20');
  });

  it('reports the problem detail from a failed call', async () => {
    respondWith({ detail: 'Email already exists' }, 409);

    await expect(api.listCustomers()).rejects.toThrow('Email already exists');
  });
});
