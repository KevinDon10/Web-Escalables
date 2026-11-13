import mongoose, { type InferSchemaType } from 'mongoose';

const serviceSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, maxlength: 100 },
  descripcion: { type: String, required: true, trim: true, maxlength: 500 },
  precio: { type: Number, required: true, min: 0 },
  duracion: { type: Number, required: true, min: 15, max: 240 },
  imagen: { type: String, required: true, trim: true, maxlength: 500 },
  categoria: { type: String, required: true, trim: true, maxlength: 60 },
  activo: { type: Boolean, default: true, required: true }
}, { timestamps: true, versionKey: false });

serviceSchema.index({ activo: 1, nombre: 1 });

export type ServiceShape = InferSchemaType<typeof serviceSchema>;
export const ServiceModel = mongoose.model('Service', serviceSchema);
