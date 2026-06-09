import { Request, Response } from "express";
import Education from "../modules/EducationSchema";
import { deleteImage, uploadImage } from "../utils/cloudinaryUpload";

const parseBoolean = (value: unknown) =>
  value === true || value === "true" || value === "1";

export const createEducation = async (req: Request, res: Response) => {
  let uploadedPublicId = "";

  try {
    let schoolImage: string | undefined;
    let schoolImagePublicId: string | undefined;

    if (req.file) {
      const upload = await uploadImage(req.file, "portfolio/education", {
        transformation: [
          { width: 512, height: 512, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      schoolImage = upload.secure_url;
      schoolImagePublicId = upload.public_id;
      uploadedPublicId = upload.public_id;
    }

    const isCurrent = parseBoolean(req.body.isCurrent);
    const education = await Education.create({
      schoolName: String(req.body.schoolName || "").trim(),
      degree: String(req.body.degree || "").trim() || undefined,
      fieldOfStudy: String(req.body.fieldOfStudy || "").trim(),
      startDate: req.body.startDate,
      endDate: isCurrent ? undefined : req.body.endDate || undefined,
      description: String(req.body.description || "").trim() || undefined,
      schoolImage,
      schoolImagePublicId,
      isCurrent,
    });

    return res.status(201).json(education);
  } catch {
    await deleteImage(uploadedPublicId).catch(() => undefined);
    return res
      .status(500)
      .json({ message: "Failed to create education" });
  }
};

export const getAllEducation = async (_req: Request, res: Response) => {
  try {
    const data = await Education.find().sort({ startDate: -1 });
    return res.status(200).json(data);
  } catch {
    return res
      .status(500)
      .json({ message: "Failed to fetch education records" });
  }
};

export const getEducationById = async (req: Request, res: Response) => {
  try {
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }
    return res.status(200).json(education);
  } catch {
    return res
      .status(500)
      .json({ message: "Failed to fetch education record" });
  }
};

export const updateEducation = async (req: Request, res: Response) => {
  let uploadedPublicId = "";

  try {
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }

    const oldPublicId = education.schoolImagePublicId;
    if (req.file) {
      const upload = await uploadImage(req.file, "portfolio/education", {
        transformation: [
          { width: 512, height: 512, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      education.schoolImage = upload.secure_url;
      education.schoolImagePublicId = upload.public_id;
      uploadedPublicId = upload.public_id;
    }

    const isCurrent = parseBoolean(req.body.isCurrent);
    education.schoolName = String(req.body.schoolName || "").trim();
    education.degree = String(req.body.degree || "").trim() || undefined;
    education.fieldOfStudy = String(req.body.fieldOfStudy || "").trim();
    education.startDate = req.body.startDate;
    education.endDate = isCurrent
      ? undefined
      : req.body.endDate || undefined;
    education.description =
      String(req.body.description || "").trim() || undefined;
    education.isCurrent = isCurrent;
    await education.save();

    if (req.file) {
      await deleteImage(oldPublicId).catch((error) =>
        console.error("Failed to delete old education image:", error),
      );
    }
    return res.status(200).json(education);
  } catch {
    await deleteImage(uploadedPublicId).catch(() => undefined);
    return res
      .status(500)
      .json({ message: "Failed to update education record" });
  }
};

export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }

    await deleteImage(education.schoolImagePublicId);
    await education.deleteOne();
    return res
      .status(200)
      .json({ message: "Education record deleted successfully" });
  } catch {
    return res
      .status(500)
      .json({ message: "Failed to delete education record" });
  }
};
