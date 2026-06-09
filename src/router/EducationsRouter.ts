import express from "express";
import {
  createEducation,
  deleteEducation,
  getAllEducation,
  getEducationById,
  updateEducation,
} from "../controller/EducationController";
import { isAdmin, verifyToken } from "../middleware/auth";
import upload from "../middleware/multer";

const educationRoutes = express.Router();

educationRoutes.get("/", getAllEducation);

educationRoutes.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("schoolImage"),
  createEducation,
);

educationRoutes.get("/:id", getEducationById);

educationRoutes.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("schoolImage"),
  updateEducation,
);

educationRoutes.delete("/:id", verifyToken, isAdmin, deleteEducation);

export default educationRoutes;
