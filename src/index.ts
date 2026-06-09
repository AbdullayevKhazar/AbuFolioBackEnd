import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import skillsRoutes from "./router/SkillsRouter";
import myWorksRoutes from "./router/MyWorksRouter";
import authRoutes from "./router/AuthRoutes";
import experienceRoutes from "./router/ExperiencesRouter";
import educationRoutes from "./router/EducationsRouter";
import contactRoutes from "./router/ContactRoutes";
import { ensureSuperAdmin } from "./utils/ensureSuperAdmin";

dotenv.config();

const app = express();
const allowedOrigins = (
  process.env.CORS_ORIGINS || "https://xab.net.az,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

const port = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

app.use("/api/skills", skillsRoutes);
app.use("/api/my-works", myWorksRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (_req, res) => {
  res.status(200).send("API is running...");
});

async function main() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not set in environment variables.");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables.");
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");
  await ensureSuperAdmin();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});
