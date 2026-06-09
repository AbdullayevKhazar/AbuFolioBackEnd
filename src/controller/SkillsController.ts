import { Request, Response } from "express";
import Skill from "../modules/SkillsSchema";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";
import type { UploadApiResponse } from "cloudinary";

const uploadSkillImage = (file: Express.Multer.File) =>
  new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "skills" },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary did not return a result"));
        } else {
          resolve(result);
        }
      },
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });

export const getSkills = async (req: Request, res: Response) => {
  try {
    const data = await Skill.find();
    res.status(200).send(data);
  } catch (error) {
    res.status(404).send(error);
  }
};

export const getSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findById(id);
    res.status(200).send(skill);
  } catch (error) {
    res.status(404).send("Skill not found");
  }
};
export const addSkill = async (req: Request, res: Response) => {
  try {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const iconSlug = String(req.body.iconSlug || "").trim().toLowerCase();
    const iconColor = String(req.body.iconColor || "")
      .trim()
      .replace("#", "")
      .toUpperCase();
    const file = req.file;

    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Skill name and description are required" });
    }

    if (!file && !iconSlug) {
      return res
        .status(400)
        .json({ message: "Select an icon or upload a custom image" });
    }

    const result = file ? await uploadSkillImage(file) : null;

    const newSkill = new Skill({
      name,
      description,
      imageUrl: result?.secure_url,
      publicId: result?.public_id,
      iconSlug: result ? undefined : iconSlug,
      iconColor: result ? undefined : iconColor || "111827",
    });

    const savedSkill = await newSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    console.error("Error adding skill:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteSkills = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.publicId) {
      await cloudinary.uploader.destroy(skill.publicId);
    }

    await Skill.findByIdAndDelete(id);
    res.status(200).send("Skill deleted");
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
export const updateSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const iconSlug = String(req.body.iconSlug || "").trim().toLowerCase();
    const iconColor = String(req.body.iconColor || "")
      .trim()
      .replace("#", "")
      .toUpperCase();
    const file = req.file;

    const existingSkill = await Skill.findById(id);
    if (!existingSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    let imageUrl = existingSkill.imageUrl;
    let publicId = existingSkill.publicId;
    let selectedIconSlug = existingSkill.iconSlug;
    let selectedIconColor = existingSkill.iconColor;

    if (file) {
      if (existingSkill.publicId) {
        await cloudinary.uploader.destroy(existingSkill.publicId);
      }

      const result = await uploadSkillImage(file);
      imageUrl = result.secure_url;
      publicId = result.public_id;
      selectedIconSlug = undefined;
      selectedIconColor = undefined;
    } else if (iconSlug) {
      if (existingSkill.publicId) {
        await cloudinary.uploader.destroy(existingSkill.publicId);
      }
      imageUrl = undefined;
      publicId = undefined;
      selectedIconSlug = iconSlug;
      selectedIconColor = iconColor || "111827";
    }

    const updatedSkill = await Skill.findByIdAndUpdate(
      id,
      {
        name,
        description,
        imageUrl,
        publicId,
        iconSlug: selectedIconSlug,
        iconColor: selectedIconColor,
      },
      { new: true, runValidators: true }
    );
    if (!updatedSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    res.status(200).json(updatedSkill);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
