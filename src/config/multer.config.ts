import multer, { StorageEngine } from "multer";
import path from "path";
import { Request } from "express";

// Constantes reutilizables
const UPLOADS_DIR = "src/uploads";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Configuración del almacenamiento
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, UPLOADS_DIR); // Carpeta donde se guardarán las imágenes
  },
  filename: (req: Request, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Filtro de archivos para validar el tipo
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."));
  }
};

// Configuración del middleware de subida
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
