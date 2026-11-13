import mongoose, { type InferSchemaType } from 'mongoose';

const weeklyHourSchema = new mongoose.Schema({
  dia: { type: Number, required: true, min: 1, max: 7 },
  abierto: { type: Boolean, required: true, default: false },
  apertura: { type: String, match: /^\d{2}:\d{2}$/, default: '10:00' },
  cierre: { type: String, match: /^\d{2}:\d{2}$/, default: '20:00' }
}, { _id: false });

const blockedDateSchema = new mongoose.Schema({
  fecha: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  motivo: { type: String, trim: true, maxlength: 160, default: '' }
}, { _id: false });

const businessSettingsSchema = new mongoose.Schema({
  clave: { type: String, unique: true, required: true, default: 'principal' },
  zonaHoraria: { type: String, required: true, default: 'America/Mexico_City' },
  intervaloMinutos: { type: Number, required: true, min: 15, max: 180, default: 60 },
  horarioSemanal: { type: [weeklyHourSchema], required: true },
  fechasBloqueadas: { type: [blockedDateSchema], default: [] }
}, { timestamps: true, versionKey: false });

export type BusinessSettingsShape = InferSchemaType<typeof businessSettingsSchema>;
export const BusinessSettingsModel = mongoose.model('BusinessSettings', businessSettingsSchema);
