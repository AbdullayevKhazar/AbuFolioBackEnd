import { Request, Response } from "express";
import MyWorks from "../modules/MyWorksSchema";
import { deleteImage, uploadImage } from "../utils/cloudinaryUpload";

const parseBoolean = (value: unknown) =>
  value === true || value === "true" || value === "1";

const parseTechnologies = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return [...new Set(value.map(String).map((item) => item.trim()))].filter(
      Boolean,
    );
  }

  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parseTechnologies(parsed);
  } catch {
    // The admin form also supports comma-separated values.
  }

  return [...new Set(value.split(",").map((item) => item.trim()))].filter(
    Boolean,
  );
};

const isValidUrl = (value: string) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const parseWorkPayload = (body: Request["body"]) => {
  const displayOrder = Number(body.displayOrder || 0);
  return {
    projectName: String(body.projectName || "").trim(),
    shortDescription: String(body.shortDescription || "").trim(),
    projectDetails: String(body.projectDetails || "").trim(),
    usingTech: parseTechnologies(body.usingTech),
    category: String(body.category || "Web Application").trim(),
    projectLink: String(body.projectLink || "").trim(),
    githubLink: String(body.githubLink || "").trim(),
    isLive: parseBoolean(body.isLive),
    isFeatured: parseBoolean(body.isFeatured),
    displayOrder:
      Number.isFinite(displayOrder) && displayOrder >= 0
        ? Math.floor(displayOrder)
        : 0,
  };
};

const validatePayload = (payload: ReturnType<typeof parseWorkPayload>) => {
  if (!payload.projectName) return "Project name is required.";
  if (payload.projectName.length > 100)
    return "Project name cannot exceed 100 characters.";
  if (!payload.shortDescription) return "Short description is required.";
  if (payload.shortDescription.length > 180)
    return "Short description cannot exceed 180 characters.";
  if (!payload.projectDetails) return "Project details are required.";
  if (payload.projectDetails.length > 2000)
    return "Project details cannot exceed 2000 characters.";
  if (!payload.usingTech.length)
    return "At least one technology is required.";
  if (!payload.category) return "Project category is required.";
  if (payload.isLive && !payload.projectLink)
    return "A live URL is required when the project is marked as live.";
  if (!isValidUrl(payload.projectLink) || !isValidUrl(payload.githubLink))
    return "Project and GitHub links must be valid HTTP(S) URLs.";
  return null;
};

const uploadCover = (file: Express.Multer.File) =>
  uploadImage(file, "portfolio/works", {
    transformation: [
      { width: 1600, height: 1000, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

export const getWorks = async (req: Request, res: Response) => {
  try {
    const filter = req.query.featured === "true" ? { isFeatured: true } : {};
    const requestedLimit = Number(req.query.limit);
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 0;
    const query = MyWorks.find(filter).sort({
      isFeatured: -1,
      displayOrder: 1,
      createdAt: -1,
    });
    if (limit) query.limit(limit);

    res.status(200).json(await query);
  } catch {
    res.status(500).json({ message: "Failed to load projects." });
  }
};

export const getWork = async (req: Request, res: Response) => {
  try {
    const work = await MyWorks.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: "Project not found." });
    }
    res.status(200).json(work);
  } catch {
    res.status(500).json({ message: "Failed to load the project." });
  }
};

export const addWork = async (req: Request, res: Response) => {
  let uploadedPublicId = "";
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Project cover image is required." });
    }

    const payload = parseWorkPayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const upload = await uploadCover(req.file);
    uploadedPublicId = upload.public_id;
    const savedWork = await MyWorks.create({
      ...payload,
      mainImage: upload.secure_url,
      publicId: upload.public_id,
    });

    res.status(201).json(savedWork);
  } catch (error) {
    console.error("Error adding work:", error);
    await deleteImage(uploadedPublicId).catch(() => undefined);
    res.status(500).json({ message: "Failed to add the project." });
  }
};

export const deleteWork = async (req: Request, res: Response) => {
  try {
    const work = await MyWorks.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: "Project not found." });
    }

    await work.deleteOne();
    await deleteImage(work.publicId).catch((error) =>
      console.error("Project image cleanup failed:", error),
    );
    res.status(200).json({ message: "Project deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete the project." });
  }
};

export const updateWork = async (req: Request, res: Response) => {
  let replacementPublicId = "";
  try {
    const existingWork = await MyWorks.findById(req.params.id);
    if (!existingWork) {
      return res.status(404).json({ message: "Project not found." });
    }

    const payload = parseWorkPayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const previousPublicId = existingWork.publicId;
    let mainImage = existingWork.mainImage;
    let publicId = previousPublicId;

    if (req.file) {
      const upload = await uploadCover(req.file);
      mainImage = upload.secure_url;
      publicId = upload.public_id;
      replacementPublicId = upload.public_id;
    }

    existingWork.set({ ...payload, mainImage, publicId });
    const updatedWork = await existingWork.save();

    if (req.file) {
      await deleteImage(previousPublicId).catch((error) =>
        console.error("Old project image cleanup failed:", error),
      );
    }

    res.status(200).json(updatedWork);
  } catch (error) {
    console.error("Update error:", error);
    await deleteImage(replacementPublicId).catch(() => undefined);
    res.status(500).json({ message: "Failed to update the project." });
  }
};
