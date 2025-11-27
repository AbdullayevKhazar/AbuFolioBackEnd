import { Request, Response } from "express";
import MyWorks from "../modules/MyWorksSchema";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";

export const getWorks = async (req: Request, res: Response) => {
  try {
    const works = await MyWorks.find();
    res.status(200).json(works);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
export const getWork = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const work = await MyWorks.findById(id);
    res.status(200).json(work);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
export const addWork = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const {
      projectName,
      projectDetails,
      usingTech,
      projectLink,
      githubLink,
      isLive,
    } = req.body;

    let mainImage = "";
    let publicId = "";

    if (file) {
      const uploadToCloudinary = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "my_works" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });

      const result: any = await uploadToCloudinary();
      mainImage = result.secure_url;
      publicId = result.public_id;
    }
    let parsedUsingTech: string[] = [];
    try {
      parsedUsingTech = usingTech ? JSON.parse(usingTech) : [];
    } catch {
      parsedUsingTech = usingTech
        ? usingTech.split(",").map((t: string) => t.trim())
        : [];
    }

    const newWork = new MyWorks({
      mainImage,
      publicId,
      projectName,
      projectDetails,
      usingTech: parsedUsingTech,
      projectLink,
      githubLink,
      isLive,
    });

    const savedWork = await newWork.save();
    res.status(201).json(savedWork);
  } catch (error) {
    console.error("Error adding work:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Delete work
export const deleteWork = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const work = await MyWorks.findById(id);

    if (!work) {
      return res.status(404).json({ message: "Work not found" });
    }

    if (work.publicId) {
      await cloudinary.uploader.destroy(work.publicId);
      console.log("Deleted Cloudinary image:", work.publicId);
    }

    await MyWorks.findByIdAndDelete(id);

    res.status(200).json({ message: "Work and image deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
export const updateWork = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const {
      projectName,
      projectDetails,
      usingTech,
      projectLink,
      githubLink,
      isLive,
    } = req.body;

    if (!id) return res.status(400).json({ message: "Missing work ID" });

    const existingWork = await MyWorks.findById(id);
    if (!existingWork) {
      return res.status(404).json({ message: "Work not found" });
    }

    let mainImage = existingWork.mainImage;
    let publicId = existingWork.publicId;

    if (file) {
      if (existingWork.publicId) {
        await cloudinary.uploader.destroy(existingWork.publicId);
      }

      const uploadToCloudinary = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "my_works" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });

      const result: any = await uploadToCloudinary();
      mainImage = result.secure_url;
      publicId = result.public_id;
    }

    // ✅ Parse technologies (can be JSON string or comma separated)
    let parsedUsingTech: string[] = [];
    try {
      parsedUsingTech = usingTech ? JSON.parse(usingTech) : [];
    } catch {
      parsedUsingTech = usingTech
        ? usingTech.split(",").map((t: string) => t.trim())
        : [];
    }

    const updatedWork = await MyWorks.findByIdAndUpdate(
      id,
      {
        mainImage,
        publicId,
        projectName,
        projectDetails,
        usingTech: parsedUsingTech,
        projectLink,
        githubLink,
        isLive,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedWork);
  } catch (error: any) {
    console.error("❌ Update error:", error.message || error);
    console.error(error.stack);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
