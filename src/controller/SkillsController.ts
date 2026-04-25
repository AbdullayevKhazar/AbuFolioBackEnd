import { Request, Response } from "express";
import Skill from "../modules/SkillsSchema";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";

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
    const { name, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Skill image is required" });
    }

    const uploadToCloudinary = () =>
      new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "skills" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const result = await uploadToCloudinary();

    const newSkill = new Skill({
      name,
      description,
      imageUrl: result.secure_url,
      publicId: result.public_id,
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
    const { name, description } = req.body;
    const file = req.file;

    const existingSkill = await Skill.findById(id);
    if (!existingSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    let imageUrl = existingSkill.imageUrl;
    let publicId = existingSkill.publicId;

    if (file) {
      if (existingSkill.publicId) {
        await cloudinary.uploader.destroy(existingSkill.publicId);
      }

      const uploadToCloudinary = () =>
        new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "skills" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });

      const result = await uploadToCloudinary();
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const updatedSkill = await Skill.findByIdAndUpdate(
      id,
      {
        name,
        description,
        imageUrl,
        publicId,
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
