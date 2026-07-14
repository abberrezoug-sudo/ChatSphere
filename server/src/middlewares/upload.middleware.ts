import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination(_, __, cb) {
    cb(null, uploadPath);
  },
  filename(_, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const allowedExtensions = /jpeg|jpg|png|gif|pdf|docx?|zip|txt/;

export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 Mo
  },
  fileFilter(_, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.test(ext)) {
      return cb(new Error("Type de fichier non autorisé"));
    }
    cb(null, true);
  },
});