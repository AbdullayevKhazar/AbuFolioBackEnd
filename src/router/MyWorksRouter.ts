import { Router } from "express";
import {
  addWork,
  deleteWork,
  getWork,
  getWorks,
  updateWork,
} from "../controller/MyWorksController";
import upload from "../middleware/multer";
import { isAdmin, verifyToken } from "../middleware/auth";

const myWorksRoutes = Router();

myWorksRoutes.get("/", getWorks);
myWorksRoutes.get("/:id", getWork);
myWorksRoutes.post(
  "/add-work",
  verifyToken,
  isAdmin,
  upload.single("mainImage"),
  addWork,
);
myWorksRoutes.delete("/:id", verifyToken, isAdmin, deleteWork);
myWorksRoutes.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("mainImage"),
  updateWork,
);
export default myWorksRoutes;
