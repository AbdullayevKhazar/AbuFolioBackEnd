import mongoose from "mongoose";
const { Schema } = mongoose;

interface myWorks {
  imageUrl: string;
  publicId: string;
  projectName: string;
  projectDetails: string;
  usingTech: string[];
  projectLink: string;
  githubLink?: string;
  isLive: boolean;
  timestamp?: Date;
}

const MyWorksSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    projectName: { type: String, required: true },
    projectDetails: { type: String, required: true, maxLength: 200 },
    usingTech: { type: [String], required: true },
    projectLink: { type: String, required: true },
    githubLink: { type: String, required: false },
    isLive: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<myWorks>("MyWorks", MyWorksSchema);
