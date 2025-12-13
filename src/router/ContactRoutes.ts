import express from "express";
import { createContact, getAllContacts } from "../controller/ContactController";

const contactRoutes = express.Router();

contactRoutes.get("/", getAllContacts);

contactRoutes.post("/", createContact);

export default contactRoutes;
