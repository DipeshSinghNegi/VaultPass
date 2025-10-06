import { Schema, model, models } from "mongoose";

export interface IUser {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export const User = models.User || model<IUser>("User", UserSchema);


