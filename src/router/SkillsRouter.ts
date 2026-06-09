import {
  addSkill,
  deleteSkills,
  getSkill,
  getSkills,
  updateSkill,
} from "./../controller/SkillsController";
import { Router } from "express";
import upload from "../middleware/multer";
import { isAdmin, verifyToken } from "../middleware/auth";

const skillsRoutes = Router();

skillsRoutes.get("/", getSkills);
skillsRoutes.get("/:id", getSkill);
skillsRoutes.post(
  "/add-skill",
  verifyToken,
  isAdmin,
  upload.single("image"),
  addSkill,
);
skillsRoutes.delete("/delete/:id", verifyToken, isAdmin, deleteSkills);
skillsRoutes.put(
  "/update/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  updateSkill,
);

export default skillsRoutes;
