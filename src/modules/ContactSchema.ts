import mongoose from "mongoose";
const { Schema } = mongoose;

interface Experiences {}

const ContactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<Experiences>("Contact", ContactSchema);
