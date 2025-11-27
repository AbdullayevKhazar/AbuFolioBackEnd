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
educationRoutes.post("/create-education", createEducation);
educationRoutes.get("/:id", getEducationById);
educationRoutes.put("/update/:id", updateEducation);
educationRoutes.delete("/delete/:id", deleteEducation);

export default educationRoutes;
