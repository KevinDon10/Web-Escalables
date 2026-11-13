import assert from 'node:assert/strict';
import test from 'node:test';
import { DateTime } from 'luxon';
import type { AppConfig } from '../config/env.ts';
import { AppError } from '../helpers/errors.ts';
import { getAppointmentStart, isWithinChangeWindow } from './schedule.service.ts';

const config: AppConfig = {
  NODE_ENV: 'test',
  PORT: 8080,
  MONGODB_URI: 'mongodb://127.0.0.1:27017',
  FRONTEND_ORIGIN: 'http://localhost:4200',
  JWT_SECRET: 'j'.repeat(40),
  CSRF_SECRET: 'c'.repeat(40),
  BUSINESS_TIMEZONE: 'America/Mexico_City'
};

test('appointment times use the configured business timezone', () => {
  const start = getAppointmentStart(config, '2026-11-16', '10:00');
  assert.equal(start.zoneName, 'America/Mexico_City');
  assert.equal(start.toFormat('yyyy-MM-dd HH:mm'), '2026-11-16 10:00');
});

test('appointment start rejects invalid calendar dates and times', () => {
  assert.throws(() => getAppointmentStart(config, '2026-02-30', '10:00'), AppError);
  assert.throws(() => getAppointmentStart(config, '2026-11-16', '25:00'), AppError);
});

test('change window closes less than 24 hours before the appointment', () => {
  assert.equal(isWithinChangeWindow(DateTime.now().plus({ hours: 25 })), false);
  assert.equal(isWithinChangeWindow(DateTime.now().plus({ hours: 23 })), true);
});
