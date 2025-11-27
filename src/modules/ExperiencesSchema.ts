import mongoose from "mongoose";
const { Schema } = mongoose;

interface Experiences {}

const ExperiencesSchema = new Schema(
  {
    companyName: { type: String, required: true },
    position: { type: String, required: true },
    companyImage: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
    isCurrentJob: { type: Boolean, default: false },
    myContributions: { type: [String], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<Experiences>("Experiences", ExperiencesSchema);
