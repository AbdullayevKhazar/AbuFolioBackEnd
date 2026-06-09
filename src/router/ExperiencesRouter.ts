import express from "express";
import {
  createExperience,
  deleteExperience,
  getAllExperiences,
  getExperienceById,
  updateExperience,
} from "../controller/ExperiencesController";
import { isAdmin, verifyToken } from "../middleware/auth";
import upload from "../middleware/multer";

const experienceRoutes = express.Router();

experienceRoutes.get("/", getAllExperiences);
experienceRoutes.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("companyImage"),
  createExperience,
);
experienceRoutes.get("/:id", getExperienceById);
experienceRoutes.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("companyImage"),
  updateExperience,
);
experienceRoutes.delete("/:id", verifyToken, isAdmin, deleteExperience);

export default experienceRoutes;
