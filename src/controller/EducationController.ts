import { Request, Response } from "express";
// DİQQƏT: Modul yolunun (../modules/EducationSchema) düz olduğundan əmin olun!
import Education from "../modules/EducationSchema";

// CREATE
export const createEducation = async (req: Request, res: Response) => {
  try {
    // 'experience' əvəzinə 'newEducation' istifadə olunur
    const newEducation = await Education.create(req.body);
    res.status(201).json(newEducation);
  } catch (error) {
    // 'experience' əvəzinə 'education' istifadə olunur
    res.status(500).json({ message: "Failed to create education", error });
  }
};

// GET ALL
export const getAllEducation = async (_req: Request, res: Response) => {
  try {
    const data = await Education.find();
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch education records", error });
  }
};

// GET ONE
export const getEducationById = async (req: Request, res: Response) => {
  try {
    const education = await Education.findById(req.params.id);
    if (!education) {
      // Mesaj düzəldildi
      return res.status(404).json({ message: "Education record not found" });
    }
    res.status(200).json(education);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch education record", error });
  }
};

// UPDATE
export const updateEducation = async (req: Request, res: Response) => {
  try {
    const updated = await Education.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Education record not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update education record", error });
  }
};

// DELETE
export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const deleted = await Education.findByIdAndDelete(req.params.id);

    if (!deleted) {
      // Mesaj düzəldildi
      return res.status(404).json({ message: "Education record not found" });
    }

    // Mesaj düzəldildi
    res.status(200).json({ message: "Education record deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete education record", error });
  }
};
