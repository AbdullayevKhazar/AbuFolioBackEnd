import { Request, Response } from "express";
import MyWorks from "../modules/MyWorksSchema";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";

// ✅ Get all works
export const getWorks = async (req: Request, res: Response) => {
  try {
    const works = await MyWorks.find();
    res.status(200).json(works);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Get one work
export const getWork = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const work = await MyWorks.findById(id);
    res.status(200).json(work);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Add a new work (with Cloudinary upload)
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

    let imageUrl = "";
    let publicId = "";

    // Upload directly to Cloudinary if an image is attached
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
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const newWork = new MyWorks({
      imageUrl,
      publicId,
      projectName,
      projectDetails,
      usingTech: usingTech ? JSON.parse(usingTech) : [],
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

// ✅ Update work
export const updateWork = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      imageUrl,
      projectName,
      projectDetails,
      usingTech,
      projectLink,
      githubLink,
      isLive,
    } = req.body;

    const updatedWork = await MyWorks.findByIdAndUpdate(
      id,
      {
        imageUrl,
        projectName,
        projectDetails,
        usingTech,
        projectLink,
        githubLink,
        isLive,
      },
      { new: true }
    );

    if (!updatedWork) {
      return res.status(404).json({ message: "Work not found" });
    }

    res.status(200).json(updatedWork);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
