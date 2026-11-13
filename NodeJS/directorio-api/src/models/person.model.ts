import mongoose from "mongoose";

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre es obligatorio"]
    },
    username: {
        type: String,
        required: [true, "El nombre de usuario es obligatorio"],
        unique: [true, "El nombre de usuario ya existe"]
    },
    email: {
        type: String,
        required: [true, "El correo electrónico es obligatorio"],
        unique: [true, "El correo electrónico ya existe"]
    },
    image: {
        type: String,
    }
})

export const PersonModel = mongoose.model("Person", personSchema);