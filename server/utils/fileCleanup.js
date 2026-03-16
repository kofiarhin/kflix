const fs = require("fs");
const path = require("path");

const UPLOADS_ROOT = path.resolve(__dirname, "..", "uploads");

const removeFileIfExists = async (relativeFilePath) => {
  if (!relativeFilePath || typeof relativeFilePath !== "string") {
    return false;
  }

  const normalizedPath = relativeFilePath.replace(/^\/+/, "");
  const absolutePath = path.resolve(__dirname, "..", normalizedPath);

  if (!absolutePath.startsWith(UPLOADS_ROOT)) {
    return false;
  }

  try {
    await fs.promises.access(absolutePath, fs.constants.F_OK);
    await fs.promises.unlink(absolutePath);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  removeFileIfExists,
};
