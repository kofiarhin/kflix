const fs = require("fs");
const path = require("path");
const multer = require("multer");

const PROFILE_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "profiles");
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PROFILE_IMAGE_SIZE = 3 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });
    cb(null, PROFILE_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const sanitizedBaseName = path
      .basename(file.originalname || "avatar", extension)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

    const safeBaseName = sanitizedBaseName || "avatar";
    const uniqueName = `${Date.now()}-${safeBaseName}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
  }

  return cb(null, true);
};

const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_PROFILE_IMAGE_SIZE,
    files: 1,
  },
}).single("profileImage");

module.exports = {
  uploadProfileImage,
};
