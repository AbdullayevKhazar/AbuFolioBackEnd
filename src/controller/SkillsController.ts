import { Request, Response } from "express";
import Skill from "../modules/SkillsSchema";

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
    const { name, description, iconName } = req.body; // added iconName

    const newSkill = new Skill({
      name,
      description,
      iconName,
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
    await Skill.findByIdAndDelete(id);
    res.status(200).send("Skill deleted");
  } catch (error) {}
};
export const updateSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, iconName } = req.body;

    const updatedSkill = await Skill.findByIdAndUpdate(id, {
      name,
      description,
      iconName,
    });
    if (!updatedSkill) {
      return res.status(404).json({ message: "Work not found" });
    }

    res.status(200).json(updatedSkill);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
