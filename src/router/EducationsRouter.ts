import express from "express";
import {
  createEducation,
  deleteEducation,
  getAllEducation,
  getEducationById,
  updateEducation,
} from "../controller/EducationController";

const educationRoutes = express.Router();

educationRoutes.get("/", getAllEducation);

educationRoutes.post("/", createEducation);

educationRoutes.get("/:id", getEducationById);

educationRoutes.put("/:id", updateEducation);

educationRoutes.delete("/:id", deleteEducation);

export default educationRoutes;
