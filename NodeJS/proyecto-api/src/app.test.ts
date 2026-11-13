import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import test, { after, before } from 'node:test';
import { createApp } from './app.ts';
import type { AppConfig } from './config/env.ts';

const config: AppConfig = {
  NODE_ENV: 'test',
  PORT: 0,
  MONGODB_URI: 'mongodb://127.0.0.1:27017',
  FRONTEND_ORIGIN: 'http://localhost:4200',
  JWT_SECRET: 'j'.repeat(40),
  CSRF_SECRET: 'c'.repeat(40),
  BUSINESS_TIMEZONE: 'America/Mexico_City'
};

const server = createApp(config).listen(0);
let baseUrl = '';

before(async () => {
  await once(server, 'listening');
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
});

test('health endpoint responds without a database connection', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, data: { status: 'ok' } });
});

test('state-changing requests require a valid double-submit CSRF token', async () => {
  const denied = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  });
  assert.equal(denied.status, 403);

  const tokenResponse = await fetch(`${baseUrl}/api/auth/csrf`);
  assert.equal(tokenResponse.status, 200);
  const tokenBody = await tokenResponse.json() as { data: { token: string } };
  const setCookie = tokenResponse.headers.get('set-cookie');
  if (!setCookie) throw new Error('CSRF cookie was not set.');
  const csrfCookie = setCookie.split(';')[0];
  if (!csrfCookie) throw new Error('CSRF cookie was not set.');

  const allowed = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': tokenBody.data.token,
      Cookie: csrfCookie
    },
    body: '{}'
  });
  assert.equal(allowed.status, 200);
});

test('admin operations reject unauthenticated callers after CSRF validation', async () => {
  const tokenResponse = await fetch(`${baseUrl}/api/auth/csrf`);
  const tokenBody = await tokenResponse.json() as { data: { token: string } };
  const csrfCookie = tokenResponse.headers.get('set-cookie')?.split(';')[0];
  if (!csrfCookie) throw new Error('CSRF cookie was not set.');

  const response = await fetch(`${baseUrl}/api/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': tokenBody.data.token,
      Cookie: csrfCookie
    },
    body: JSON.stringify({ nombre: 'Servicio no autorizado' })
  });
  assert.equal(response.status, 401);
});

for (const path of ['/api/users', '/api/schedule/blocked-dates']) {
  test(`client and blocked-date administration reject visitors: ${path}`, async () => {
    assert.equal((await fetch(`${baseUrl}${path}`)).status, 401);
    const tokenResponse = await fetch(`${baseUrl}/api/auth/csrf`);
    const tokenBody = await tokenResponse.json() as { data: { token: string } };
    const cookie = tokenResponse.headers.get('set-cookie')?.split(';')[0];
    assert.ok(cookie);
    for (const method of ['POST', 'PATCH', 'DELETE']) {
      const response: Response = await fetch(`${baseUrl}${path}${method === 'POST' ? '' : '/507f1f77bcf86cd799439011'}`, {
        method, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': tokenBody.data.token, Cookie: cookie }, body: '{}'
      });
      assert.equal(response.status, 401);
    }
  });
}
