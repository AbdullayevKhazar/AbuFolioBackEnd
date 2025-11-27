import express from "express";
import {
  createExperience,
  deleteExperience,
  getAllExperiences,
  getExperienceById,
  updateExperience,
} from "../controller/ExperiencesController";

const experienceRoutes = express.Router();

experienceRoutes.get("/", getAllExperiences);
experienceRoutes.post("/", createExperience);
experienceRoutes.get("/:id", getExperienceById);
experienceRoutes.put("/:id", updateExperience);
experienceRoutes.delete("/:id", deleteExperience);

export default experienceRoutes;
