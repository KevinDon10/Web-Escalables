import mongoose, { type InferSchemaType } from 'mongoose';

const barberSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, maxlength: 100 },
  especialidad: { type: String, required: true, trim: true, maxlength: 120 },
  imagen: { type: String, required: true, trim: true, maxlength: 500 },
  disponible: { type: Boolean, default: true, required: true }
}, { timestamps: true, versionKey: false });

barberSchema.index({ disponible: 1, nombre: 1 });

export type BarberShape = InferSchemaType<typeof barberSchema>;
export const BarberModel = mongoose.model('Barber', barberSchema);
