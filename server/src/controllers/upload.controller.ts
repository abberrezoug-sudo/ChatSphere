import { Request, Response } from "express";

export const uploadFile = (
  req: Request,
  res: Response
) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  return res.json({
    message: "Upload successful",

    file: {
      url: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    },
  });
};