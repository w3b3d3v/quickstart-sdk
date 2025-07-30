import * as fs from "fs-extra";
import * as path from "path";

/**
 * Ensure directory structure exists
 * @param directories - Array of directory paths to create
 */
export async function ensureDirectories(directories: string[]): Promise<void> {
  const promises = directories.map((dir) => fs.ensureDir(dir));
  await Promise.all(promises);
}

/**
 * Safely remove a directory or file
 * @param targetPath - Path to remove
 */
export async function safeRemove(targetPath: string): Promise<void> {
  try {
    if (await fs.pathExists(targetPath)) {
      await fs.remove(targetPath);
      console.log(`✅ Removed: ${targetPath}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(
      `⚠️  Warning: Failed to remove ${targetPath}: ${errorMessage}`
    );
  }
}

/**
 * Move files from source to destination, handling overwrites
 * @param sourcePath - Source directory
 * @param destPath - Destination directory
 */
export async function moveDirectoryContents(
  sourcePath: string,
  destPath: string
): Promise<void> {
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
 * File object for writing multiple files
 */
export interface FileToWrite {
  path: string;
  content: string;
}

/**
 * Write multiple files in parallel
 * @param files - Array of file objects
 */
export async function writeFiles(files: FileToWrite[]): Promise<void> {
  const promises = files.map(({ path: filePath, content }) =>
    fs.writeFile(filePath, content)
  );
  await Promise.all(promises);
}

/**
 * Check if a path exists
 * @param targetPath - Path to check
 */
export async function pathExists(targetPath: string): Promise<boolean> {
  return fs.pathExists(targetPath);
}

/**
 * Clean up temporary files and directories
 * @param paths - Array of paths to clean up
 */
export async function cleanupTempFiles(paths: string[]): Promise<void> {
  console.log("🧹 Cleaning up temporary files...");

  const cleanupPromises = paths.map(async (tempPath) => {
    try {
      await safeRemove(tempPath);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn(
        `⚠️  Warning: Failed to clean up ${tempPath}: ${errorMessage}`
      );
    }
  });

  await Promise.all(cleanupPromises);
  console.log("✅ Temporary files cleaned up!");
}
