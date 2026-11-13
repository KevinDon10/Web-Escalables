import mongoose from 'mongoose';

export const dbConnection = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/', {
            dbName: 'notas-db',
        });
        console.log('Base de datos conectada con éxito');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
};
