import multer from "multer";
import fs from "fs";

export const upload = (file) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      fs.mkdirSync("uploads", { recursive: true });
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });
  const upload = multer({ storage });
  return upload;
};
