import { type Request, type Response } from 'express';
import { NotaModel } from '../models/nota.model.ts';

export const getNotas = async (_req: Request, res: Response) => {
    try {
        const notas = await NotaModel.find();
        return res.status(200).json(notas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error al obtener las notas' });
    }
};

export const createNota = async (req: Request, res: Response) => {
    const { titulo, contenido } = req.body ?? {};

    if (typeof titulo !== 'string' || typeof contenido !== 'string' ||
        !titulo.trim() || !contenido.trim()) {
        return res.status(400).json({
            ok: false,
            msg: 'El título y el contenido son obligatorios y deben ser texto',
        });
    }

    try {
        const nuevaNota = new NotaModel({ titulo, contenido });
        await nuevaNota.save();

        return res.status(201).json({
            ok: true,
            msg: 'Nota creada con éxito',
            data: nuevaNota,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error al crear la nota' });
    }
};
