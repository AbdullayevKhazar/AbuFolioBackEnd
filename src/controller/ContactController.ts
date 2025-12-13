import { Request, Response } from "express";
import Contact from "../modules/ContactSchema";

export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contacts", error });
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    const savedContact = await Contact.create({ name, email, message });
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(500).json({ message: "Failed to create contact", error });
  }
};
