import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  _id: { type: String, required: true },
  owner: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });
export const BookingLockModel = mongoose.model('BookingLock', schema);
