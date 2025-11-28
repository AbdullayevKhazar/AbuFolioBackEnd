import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import skillsRoutes from "./router/SkillsRouter";
import myWorksRoutes from "./router/MyWorksRouter";
import authRoutes from "./router/AuthRoutes";
import experienceRoutes from "./router/ExperiencesRouter";
import educationRoutes from "./router/EducationsRouter";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://admin:admin@cluster0.igvqt.mongodb.net/?appName=Cluster0";

app.use("/api/skills", skillsRoutes);
app.use("/api/my-works", myWorksRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/education", educationRoutes);

app.get("/", (_req, res) => {
  res.status(200).send("API is running...");
});

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
