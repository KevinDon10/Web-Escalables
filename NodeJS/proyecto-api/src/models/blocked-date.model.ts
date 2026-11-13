import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  fecha: { type: String, required: true, unique: true },
  motivo: { type: String, trim: true, maxlength: 160, default: '' }
}, { timestamps: true, versionKey: false });
export const BlockedDateModel = mongoose.model('BlockedDate', schema);
