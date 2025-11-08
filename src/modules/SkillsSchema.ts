import mongoose from "mongoose";
const { Schema } = mongoose;

interface Skills {
  name: string;
  description: string;
  iconName: string;
}

const SkillsSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true, maxLength: 100 },
  iconName: { type: String, required: true },
});

export default mongoose.model<Skills>("Skills", SkillsSchema);
