import mongoose from "mongoose";

export const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/",{
            dbName: "directorio-db",
        });
        console.log("Base de datos conectada con exito");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
};