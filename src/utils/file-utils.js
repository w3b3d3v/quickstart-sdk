const fs = require("fs-extra");
const path = require("path");

/**
 * Ensure directory structure exists
 * @param {string[]} directories - Array of directory paths to create
 * @returns {Promise<void>}
 */
async function ensureDirectories(directories) {
  const promises = directories.map((dir) => fs.ensureDir(dir));
  await Promise.all(promises);
}

/**
 * Safely remove a directory or file
 * @param {string} targetPath - Path to remove
 * @returns {Promise<void>}
 */
async function safeRemove(targetPath) {
  try {
    if (await fs.pathExists(targetPath)) {
      await fs.remove(targetPath);
      console.log(`✅ Removed: ${targetPath}`);
    }
  } catch (error) {
    console.warn(
      `⚠️  Warning: Failed to remove ${targetPath}: ${error.message}`
    );
  }
}

/**
 * Move files from source to destination, handling overwrites
 * @param {string} sourcePath - Source directory
 * @param {string} destPath - Destination directory
 * @returns {Promise<void>}
 */
async function moveDirectoryContents(sourcePath, destPath) {
  if (!(await fs.pathExists(sourcePath))) {
    throw new Error(`Source path does not exist: ${sourcePath}`);
  }

  const items = await fs.readdir(sourcePath);

  for (const item of items) {
    const sourceItemPath = path.join(sourcePath, item);
    const destItemPath = path.join(destPath, item);

    await fs.move(sourceItemPath, destItemPath, { overwrite: true });
  }

  console.log(`✅ Moved contents from ${sourcePath} to ${destPath}`);
}

/**
 * Write multiple files in parallel
 * @param {Array<{path: string, content: string}>} files - Array of file objects
 * @returns {Promise<void>}
 */
async function writeFiles(files) {
  const promises = files.map(({ path: filePath, content }) =>
    fs.writeFile(filePath, content)
  );
  await Promise.all(promises);
}

/**
 * Check if a path exists
 * @param {string} targetPath - Path to check
 * @returns {Promise<boolean>}
 */
async function pathExists(targetPath) {
  return fs.pathExists(targetPath);
}

/**
 * Clean up temporary files and directories
 * @param {string[]} paths - Array of paths to clean up
 * @returns {Promise<void>}
 */
async function cleanupTempFiles(paths) {
  console.log("🧹 Cleaning up temporary files...");

  const cleanupPromises = paths.map(async (tempPath) => {
    try {
      await safeRemove(tempPath);
    } catch (error) {
      console.warn(
        `⚠️  Warning: Failed to clean up ${tempPath}: ${error.message}`
      );
    }
  });

  await Promise.all(cleanupPromises);
  console.log("✅ Temporary files cleaned up!");
}

module.exports = {
  ensureDirectories,
  safeRemove,
  moveDirectoryContents,
  writeFiles,
  pathExists,
  cleanupTempFiles,
};
