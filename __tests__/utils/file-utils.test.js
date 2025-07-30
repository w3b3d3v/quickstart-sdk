const path = require("path");

// Create a more comprehensive mock for fs-extra when used via TypeScript
const mockFsExtra = {
  ensureDir: jest.fn(),
  pathExists: jest.fn(),
  remove: jest.fn(),
  readdir: jest.fn(),
  move: jest.fn(),
  writeFile: jest.fn(),
};

// Mock fs-extra
jest.mock("fs-extra", () => mockFsExtra);

const {
  ensureDirectories,
  safeRemove,
  moveDirectoryContents,
  writeFiles,
  pathExists,
  cleanupTempFiles,
} = require("../../src/utils/file-utils");

describe("File Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ensureDirectories", () => {
    test("should create all directories", async () => {
      mockFsExtra.ensureDir.mockResolvedValue();

      const directories = ["/test/dir1", "/test/dir2", "/test/dir3"];
      await ensureDirectories(directories);

      expect(mockFsExtra.ensureDir).toHaveBeenCalledTimes(3);
      expect(mockFsExtra.ensureDir).toHaveBeenCalledWith("/test/dir1");
      expect(mockFsExtra.ensureDir).toHaveBeenCalledWith("/test/dir2");
      expect(mockFsExtra.ensureDir).toHaveBeenCalledWith("/test/dir3");
    });

    test("should handle directory creation errors", async () => {
      mockFsExtra.ensureDir.mockRejectedValueOnce(
        new Error("Permission denied")
      );

      const directories = ["/test/dir1"];

      await expect(ensureDirectories(directories)).rejects.toThrow(
        "Permission denied"
      );
    });
  });

  describe("safeRemove", () => {
    test("should remove existing path", async () => {
      mockFsExtra.pathExists.mockResolvedValue(true);
      mockFsExtra.remove.mockResolvedValue();

      await safeRemove("/test/path");

      expect(mockFsExtra.pathExists).toHaveBeenCalledWith("/test/path");
      expect(mockFsExtra.remove).toHaveBeenCalledWith("/test/path");
    });

    test("should skip non-existing path", async () => {
      mockFsExtra.pathExists.mockResolvedValue(false);

      await safeRemove("/test/nonexistent");

      expect(mockFsExtra.pathExists).toHaveBeenCalledWith("/test/nonexistent");
      expect(mockFsExtra.remove).not.toHaveBeenCalled();
    });

    test("should handle removal errors gracefully", async () => {
      mockFsExtra.pathExists.mockResolvedValue(true);
      mockFsExtra.remove.mockRejectedValue(new Error("Permission denied"));
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      // Should not throw
      await safeRemove("/test/path");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Warning: Failed to remove /test/path")
      );
      consoleSpy.mockRestore();
    });
  });

  describe("moveDirectoryContents", () => {
    test("should move all items from source to destination", async () => {
      mockFsExtra.pathExists.mockResolvedValue(true);
      mockFsExtra.readdir.mockResolvedValue([
        "file1.txt",
        "file2.js",
        "subfolder",
      ]);
      mockFsExtra.move.mockResolvedValue();

      await moveDirectoryContents("/source", "/dest");

      expect(mockFsExtra.pathExists).toHaveBeenCalledWith("/source");
      expect(mockFsExtra.readdir).toHaveBeenCalledWith("/source");
      expect(mockFsExtra.move).toHaveBeenCalledTimes(3);
      expect(mockFsExtra.move).toHaveBeenCalledWith(
        "/source/file1.txt",
        "/dest/file1.txt",
        { overwrite: true }
      );
      expect(mockFsExtra.move).toHaveBeenCalledWith(
        "/source/file2.js",
        "/dest/file2.js",
        { overwrite: true }
      );
      expect(mockFsExtra.move).toHaveBeenCalledWith(
        "/source/subfolder",
        "/dest/subfolder",
        { overwrite: true }
      );
    });

    test("should throw error if source does not exist", async () => {
      mockFsExtra.pathExists.mockResolvedValue(false);

      await expect(
        moveDirectoryContents("/nonexistent", "/dest")
      ).rejects.toThrow("Source path does not exist: /nonexistent");

      expect(mockFsExtra.readdir).not.toHaveBeenCalled();
      expect(mockFsExtra.move).not.toHaveBeenCalled();
    });

    test("should handle move errors", async () => {
      mockFsExtra.pathExists.mockResolvedValue(true);
      mockFsExtra.readdir.mockResolvedValue(["file1.txt"]);
      mockFsExtra.move.mockRejectedValue(new Error("Destination occupied"));

      await expect(moveDirectoryContents("/source", "/dest")).rejects.toThrow(
        "Destination occupied"
      );
    });
  });

  describe("writeFiles", () => {
    test("should write all files in parallel", async () => {
      mockFsExtra.writeFile.mockResolvedValue();

      const files = [
        { path: "/test/file1.txt", content: "content1" },
        { path: "/test/file2.js", content: "content2" },
        { path: "/test/file3.md", content: "content3" },
      ];

      await writeFiles(files);

      expect(mockFsExtra.writeFile).toHaveBeenCalledTimes(3);
      expect(mockFsExtra.writeFile).toHaveBeenCalledWith(
        "/test/file1.txt",
        "content1"
      );
      expect(mockFsExtra.writeFile).toHaveBeenCalledWith(
        "/test/file2.js",
        "content2"
      );
      expect(mockFsExtra.writeFile).toHaveBeenCalledWith(
        "/test/file3.md",
        "content3"
      );
    });

    test("should handle write errors", async () => {
      mockFsExtra.writeFile.mockRejectedValueOnce(
        new Error("Permission denied")
      );

      const files = [{ path: "/test/file.txt", content: "content" }];

      await expect(writeFiles(files)).rejects.toThrow("Permission denied");
    });
  });

  describe("pathExists", () => {
    test("should return true for existing path", async () => {
      mockFsExtra.pathExists.mockResolvedValue(true);

      const result = await pathExists("/test/existing");

      expect(result).toBe(true);
      expect(mockFsExtra.pathExists).toHaveBeenCalledWith("/test/existing");
    });

    test("should return false for non-existing path", async () => {
      mockFsExtra.pathExists.mockResolvedValue(false);

      const result = await pathExists("/test/nonexistent");

      expect(result).toBe(false);
      expect(mockFsExtra.pathExists).toHaveBeenCalledWith("/test/nonexistent");
    });
  });

  describe("cleanupTempFiles", () => {
    test("should clean up all temp files", async () => {
      mockFsExtra.pathExists.mockResolvedValue(true);
      mockFsExtra.remove.mockResolvedValue();

      const paths = ["/temp/dir1", "/temp/dir2", "/temp/file.txt"];
      await cleanupTempFiles(paths);

      expect(mockFsExtra.pathExists).toHaveBeenCalledTimes(3);
      expect(mockFsExtra.remove).toHaveBeenCalledTimes(3);
    });

    test("should handle cleanup errors gracefully", async () => {
      mockFsExtra.pathExists.mockResolvedValue(true);
      mockFsExtra.remove
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error("Permission denied"))
        .mockResolvedValueOnce();

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const paths = ["/temp/dir1", "/temp/dir2", "/temp/dir3"];
      await cleanupTempFiles(paths);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Warning: Failed to remove /temp/dir2")
      );
      consoleSpy.mockRestore();
    });

    test("should handle empty paths array", async () => {
      await cleanupTempFiles([]);

      expect(mockFsExtra.pathExists).not.toHaveBeenCalled();
      expect(mockFsExtra.remove).not.toHaveBeenCalled();
    });
  });
});
