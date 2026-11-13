import mongoose, { type InferSchemaType } from 'mongoose';

export const APPOINTMENT_STATUSES = ['pendiente', 'confirmada', 'completada', 'cancelada'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

const appointmentSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  servicioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  barberoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true, index: true },
  fecha: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  hora: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  inicio: { type: Date, required: true },
  fin: { type: Date, required: true },
  precio: { type: Number, required: true, min: 0 },
  duracion: { type: Number, required: true, min: 15 },
  notas: { type: String, trim: true, maxlength: 500, default: '' },
  notificacionCliente: { type: String, trim: true, maxlength: 300, default: '' },
  notificacionLeida: { type: Boolean, default: true, required: true },
  estado: { type: String, enum: APPOINTMENT_STATUSES, default: 'pendiente', required: true }
}, { timestamps: true, versionKey: false });

appointmentSchema.index({ fecha: 1, hora: 1, estado: 1 });
appointmentSchema.index({ barberoId: 1, inicio: 1, fin: 1, estado: 1 });

export type AppointmentShape = InferSchemaType<typeof appointmentSchema>;
export const AppointmentModel = mongoose.model('Appointment', appointmentSchema);
