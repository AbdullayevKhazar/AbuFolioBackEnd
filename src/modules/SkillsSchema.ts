import mongoose from "mongoose";
const { Schema } = mongoose;

interface Skills {
  name: string;
  description: string;
  imageUrl?: string;
  publicId?: string;
  iconSlug?: string;
  iconColor?: string;
}

const SkillsSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true, maxLength: 100 },
  imageUrl: { type: String },
  publicId: { type: String },
  iconSlug: { type: String, trim: true, lowercase: true },
  iconColor: {
    type: String,
    trim: true,
    uppercase: true,
    match: /^[0-9A-F]{6}$/,
  },
});

export default mongoose.model<Skills>("Skills", SkillsSchema);
