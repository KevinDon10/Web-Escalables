import mongoose from 'mongoose';
import type { RequestHandler } from 'express';
import { AppError } from '../helpers/errors.ts';
import { AppointmentModel } from '../models/appointment.model.ts';

export const getMyNotifications: RequestHandler = async (req, res) => {
  const appointments = await AppointmentModel.find({
    clienteId: req.user!.id,
    notificacionCliente: { $ne: '' }
  }).sort({ updatedAt: -1 }).limit(50);
  res.json({
    ok: true,
    data: appointments.map(appointment => ({
      _id: appointment.id,
      citaId: appointment.id,
      mensaje: appointment.notificacionCliente,
      leida: appointment.notificacionLeida,
      createdAt: appointment.updatedAt
    }))
  });
};

export const markNotificationRead: RequestHandler = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params['id'])) throw new AppError(400, 'El identificador de la notificación no es válido.');
  const appointment = await AppointmentModel.findOneAndUpdate(
    { _id: req.params['id'], clienteId: req.user!.id, notificacionCliente: { $ne: '' } },
    { notificacionLeida: true },
    { returnDocument: 'after' }
  );
  if (!appointment) throw new AppError(404, 'No se encontró la notificación.');
  res.json({
    ok: true,
    data: {
      _id: appointment.id,
      citaId: appointment.id,
      mensaje: appointment.notificacionCliente,
      leida: appointment.notificacionLeida,
      createdAt: appointment.updatedAt
    }
  });
};
