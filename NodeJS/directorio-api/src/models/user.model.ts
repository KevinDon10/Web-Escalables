import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "El username  es obligatorio"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
  },
  role: {
    type: String,
    required: true,
    default: "USER_ROLE",
    enum: ["ADMIN_ROLE", "USER_ROLE"],
  },
});

// userSchema.method.toJSON = function () {
//   const { password, ...user } = this.toObject();
//   return user;
// }

export const UserModel = mongoose.model("User", userSchema);
