import { BlockedDateModel } from '../models/blocked-date.model.ts';
import { BusinessSettingsModel } from '../models/business-settings.model.ts';
import mongoose from 'mongoose';
import type { AppConfig } from './env.ts';

export async function connectDatabase(config: AppConfig): Promise<void> {
  await mongoose.connect(config.MONGODB_URI, { dbName: 'proyecto-db' });
  await BlockedDateModel.init();
  const settings = await BusinessSettingsModel.findOne({ clave: 'principal' });
  for (const block of settings?.fechasBloqueadas ?? []) {
    await BlockedDateModel.updateOne({ fecha: block.fecha }, { $setOnInsert: { fecha: block.fecha, motivo: block.motivo } }, { upsert: true });
  }
  if (settings?.fechasBloqueadas.length) { settings.set('fechasBloqueadas', []); await settings.save(); }
  console.log('Conectado a MongoDB: proyecto-db');
}
