import {
  addSkill,
  deleteSkills,
  getSkill,
  getSkills,
  updateSkill,
} from "./../controller/SkillsController";
import { Router } from "express";
import upload from "../middleware/multer";

const skillsRoutes = Router();

skillsRoutes.get("/", getSkills);
skillsRoutes.get("/:id", getSkill);
skillsRoutes.post("/add-skill", upload.single("image"), addSkill);
skillsRoutes.delete("/delete/:id", deleteSkills);
skillsRoutes.put("/update/:id", upload.single("image"), updateSkill);

export default skillsRoutes;
