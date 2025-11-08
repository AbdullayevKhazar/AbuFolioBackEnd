import upload from "../middleware/multer";
import {
  addSkill,
  deleteSkills,
  getSkill,
  getSkills,
  updateSkill,
} from "./../controller/SkillsController";
import { Router } from "express";

const skillsRoutes = Router();

skillsRoutes.get("/", getSkills);
skillsRoutes.get("/:id", getSkill);
skillsRoutes.post("/add-skill", addSkill);
skillsRoutes.delete("/delete/:id", deleteSkills);
skillsRoutes.put("/update/:id", updateSkill);

export default skillsRoutes;
