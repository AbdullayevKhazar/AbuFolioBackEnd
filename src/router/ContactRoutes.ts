import express from "express";
import { createContact, getAllContacts } from "../controller/ContactController";
import { isAdmin, verifyToken } from "../middleware/auth";

const contactRoutes = express.Router();

contactRoutes.get("/", verifyToken, isAdmin, getAllContacts);

contactRoutes.post("/", createContact);

export default contactRoutes;
