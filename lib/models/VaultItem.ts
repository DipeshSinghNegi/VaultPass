import { Schema, model, models, Types } from "mongoose";

export interface IVaultItem {
  userId: Types.ObjectId;
  encrypted: string; // base64
  iv: string; // base64
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema = new Schema<IVaultItem>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
  encrypted: { type: String, required: true },
  iv: { type: String, required: true }
}, { timestamps: true });

export const VaultItem = models.VaultItem || model<IVaultItem>("VaultItem", VaultItemSchema);


