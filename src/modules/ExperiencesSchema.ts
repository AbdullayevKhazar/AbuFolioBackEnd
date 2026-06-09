import mongoose from "mongoose";
const { Schema } = mongoose;

interface Experience {
  companyName: string;
  position: string;
  companyImage: string;
  companyImagePublicId?: string;
  startDate: Date;
  endDate?: Date;
  isCurrentJob: boolean;
  myContributions: string[];
}

const ExperiencesSchema = new Schema<Experience>(
  {
    companyName: { type: String, required: true },
    position: { type: String, required: true },
    companyImage: { type: String, required: true },
    companyImagePublicId: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: false },
    isCurrentJob: { type: Boolean, default: false },
    myContributions: { type: [String], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<Experience>("Experiences", ExperiencesSchema);
