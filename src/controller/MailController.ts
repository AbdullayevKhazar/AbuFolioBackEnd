import nodemailer from "nodemailer";
import { Request, Response } from "express";
export const sendMail = async (req: Request, res: Response) => {
  const { to, subject, text } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "",
        pass: "",
      },
    });

    const mailOptions = {
      from: "",
      to,
      subject,
      text,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error });
  }
};
