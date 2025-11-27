import { Request, Response } from "express";
import EducationSchema from "../modules/EducationSchema";

// CREATE
export const createEducation = async (req: Request, res: Response) => {
  try {
    const experience = await EducationSchema.create(req.body);
    res.status(201).json(experience);
  } catch (error) {
    res.status(500).json({ message: "Failed to create experience", error });
  }
};

export const getAllEducation = async (_req: Request, res: Response) => {
  try {
    const data = await EducationSchema.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch experiences", error });
  }
};

// GET ONE
export const getEducationById = async (req: Request, res: Response) => {
  try {
    const experience = await EducationSchema.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }
    res.status(200).json(experience);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch experience", error });
  }
};

// UPDATE
export const updateEducation = async (req: Request, res: Response) => {
  try {
    const updated = await EducationSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update experience", error });
  }
};

// DELETE
export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const deleted = await EducationSchema.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.status(200).json({ message: "Experience deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete experience", error });
  }
};
