import mongoose from "mongoose";

const { Schema } = mongoose;

interface MyWork {
  mainImage: string;
  publicId: string;
  projectName: string;
  shortDescription?: string;
  projectDetails: string;
  usingTech: string[];
  category: string;
  projectLink?: string;
  githubLink?: string;
  isLive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

const MyWorksSchema = new Schema(
  {
    mainImage: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true },
    projectName: { type: String, required: true, trim: true, maxLength: 100 },
    shortDescription: { type: String, trim: true, maxLength: 180 },
    projectDetails: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
    usingTech: {
      type: [String],
      required: true,
      validate: {
        validator: (items: string[]) => items.length > 0,
        message: "At least one technology is required",
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxLength: 60,
      default: "Web Application",
    },
    projectLink: { type: String, trim: true },
    githubLink: { type: String, trim: true },
    isLive: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0, min: 0, index: true },
  },
  { timestamps: true },
);

export default mongoose.model<MyWork>("MyWorks", MyWorksSchema);
