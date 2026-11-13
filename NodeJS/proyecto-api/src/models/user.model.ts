import mongoose, { type InferSchemaType } from 'mongoose';

export const USER_ROLES = ['cliente', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, maxlength: 80 },
  apellidos: { type: String, required: true, trim: true, maxlength: 100 },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  telefono: { type: String, required: true, trim: true, maxlength: 30 },
  password: { type: String, required: true, select: false },
  activo: { type: Boolean, default: true, required: true },
  role: { type: String, enum: USER_ROLES, required: true, default: 'cliente' }
}, { timestamps: true, versionKey: false });

export type UserShape = InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model('User', userSchema);
