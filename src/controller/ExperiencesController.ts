import { Request, Response } from "express";
import Experiences from "../modules/ExperiencesSchema";
import { deleteImage, uploadImage } from "../utils/cloudinaryUpload";

const parseContributions = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseBoolean = (value: unknown) =>
  value === true || value === "true" || value === "1";

export const createExperience = async (req: Request, res: Response) => {
  let uploadedPublicId = "";

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Company image is required" });
    }

    const upload = await uploadImage(req.file, "portfolio/experiences", {
      transformation: [
        { width: 512, height: 512, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });
    uploadedPublicId = upload.public_id;

    const isCurrentJob = parseBoolean(req.body.isCurrentJob);
    const contributions = parseContributions(req.body.myContributions);
    if (!contributions.length) {
      await deleteImage(uploadedPublicId);
      return res
        .status(400)
        .json({ message: "At least one contribution is required" });
    }

    const experience = await Experiences.create({
      companyName: String(req.body.companyName || "").trim(),
      position: String(req.body.position || "").trim(),
      companyImage: upload.secure_url,
      companyImagePublicId: upload.public_id,
      startDate: req.body.startDate,
      endDate: isCurrentJob ? undefined : req.body.endDate || undefined,
      isCurrentJob,
      myContributions: contributions,
    });

    return res.status(201).json(experience);
  } catch (error) {
    await deleteImage(uploadedPublicId).catch(() => undefined);
    return res
      .status(500)
      .json({ message: "Failed to create experience" });
  }
};

export const getAllExperiences = async (_req: Request, res: Response) => {
  try {
    const data = await Experiences.find().sort({ startDate: -1 });
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: "Failed to fetch experiences" });
  }
};

export const getExperienceById = async (req: Request, res: Response) => {
  try {
    const experience = await Experiences.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }
    return res.status(200).json(experience);
  } catch {
    return res.status(500).json({ message: "Failed to fetch experience" });
  }
};

export const updateExperience = async (req: Request, res: Response) => {
  let newPublicId = "";

  try {
    const experience = await Experiences.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    let companyImage = experience.companyImage;
    let companyImagePublicId = experience.companyImagePublicId;
    const oldPublicId = experience.companyImagePublicId;

    if (req.file) {
      const upload = await uploadImage(req.file, "portfolio/experiences", {
        transformation: [
          { width: 512, height: 512, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      newPublicId = upload.public_id;
      companyImage = upload.secure_url;
      companyImagePublicId = upload.public_id;
    }

    const isCurrentJob = parseBoolean(req.body.isCurrentJob);
    const contributions = parseContributions(req.body.myContributions);
    if (!contributions.length) {
      await deleteImage(newPublicId);
      return res
        .status(400)
        .json({ message: "At least one contribution is required" });
    }

    experience.companyName = String(req.body.companyName || "").trim();
    experience.position = String(req.body.position || "").trim();
    experience.companyImage = companyImage;
    experience.companyImagePublicId = companyImagePublicId;
    experience.startDate = req.body.startDate;
    experience.endDate = isCurrentJob
      ? undefined
      : req.body.endDate || undefined;
    experience.isCurrentJob = isCurrentJob;
    experience.myContributions = contributions;
    await experience.save();

    if (req.file) {
      await deleteImage(oldPublicId).catch((error) =>
        console.error("Failed to delete old experience image:", error),
      );
    }

    return res.status(200).json(experience);
  } catch {
    await deleteImage(newPublicId).catch(() => undefined);
    return res.status(500).json({ message: "Failed to update experience" });
  }
};

export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const experience = await Experiences.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    await deleteImage(experience.companyImagePublicId);
    await experience.deleteOne();
    return res
      .status(200)
      .json({ message: "Experience deleted successfully" });
  } catch {
    return res.status(500).json({ message: "Failed to delete experience" });
  }
};
