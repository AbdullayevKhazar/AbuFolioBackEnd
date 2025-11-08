import { Router } from "express";
import {
  addWork,
  deleteWork,
  getWork,
  getWorks,
  updateWork,
} from "../controller/MyWorksController";
import upload from "../middleware/multer";

const myWorksRoutes = Router();

myWorksRoutes.get("/", getWorks);
myWorksRoutes.get("/:id", getWork);
myWorksRoutes.post("/add-work", upload.single("imageUrl"), addWork);
myWorksRoutes.delete("/:id", deleteWork);
myWorksRoutes.put("/:id", updateWork);

export default myWorksRoutes;
