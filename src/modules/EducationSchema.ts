import mongoose from "mongoose";
const { Schema } = mongoose;

interface Education {
  schoolName: string;
  degree?: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  schoolImage?: string;
  isCurrent?: boolean;
}

const EducationSchema = new Schema<Education>(
  {
    schoolName: { type: String, required: true },
    degree: { type: String, required: false },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String },
    schoolImage: { type: String },
    isCurrent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<Education>("Educations", EducationSchema);
