import mongoose from 'mongoose';

const notaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
    },
    contenido: {
        type: String,
        required: [true, 'El contenido es obligatorio'],
    },
});

export const NotaModel = mongoose.model('Nota', notaSchema);
