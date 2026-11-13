import { randomUUID } from 'node:crypto';
import { BookingLockModel } from '../models/booking-lock.model.ts';
import { AppError } from '../helpers/errors.ts';

// No TTL: expiring a lock while a paused process resumes would allow overlapping writes.
// An interrupted process leaves a lock that must be inspected before manual recovery.
export async function withBookingLocks<T>(keys: string[], action: () => Promise<T>): Promise<T> {
  const owner = randomUUID();
  const acquired: string[] = [];
  try {
    for (const key of [...new Set(keys)].sort()) {
      try {
        await BookingLockModel.create({ _id: key, owner });
        acquired.push(key);
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
          throw new AppError(409, 'Se está procesando otra operación para esta cita o barbero. Intenta nuevamente en unos segundos.', 'BOOKING_BUSY');
        }
        throw error;
      }
    }
    return await action();
  } finally {
    if (acquired.length) await BookingLockModel.deleteMany({ _id: { $in: acquired }, owner });
  }
}
