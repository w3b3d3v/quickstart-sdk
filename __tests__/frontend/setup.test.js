const path = require("path");

// Mock the dependencies
const mockProcessUtils = {
  executeCommand: jest.fn(),
  cloneRepository: jest.fn(),
  installDependencies: jest.fn(),
  buildProject: jest.fn(),
};

const mockFileUtils = {
  pathExists: jest.fn(),
  moveDirectoryContents: jest.fn(),
  safeRemove: jest.fn(),
  cleanupTempFiles: jest.fn(),
};

jest.mock("../../src/utils/process-utils", () => mockProcessUtils);
jest.mock("../../src/utils/file-utils", () => mockFileUtils);

const {
  setupFrontendWithPolkadotDapp,
  reorganizeFrontendStructure,
  validateFrontendSetup,
} = require("../../src/frontend/setup");

describe("Frontend Setup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setupFrontendWithPolkadotDapp", () => {
    const projectDir = "/test/project";
    const projectName = "test-project";

    test("should complete frontend setup successfully", async () => {
      // Mock successful operations
      mockProcessUtils.cloneRepository.mockResolvedValue({
        stdout: "Cloned successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.installDependencies.mockResolvedValue({
        stdout: "Installed successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.buildProject.mockResolvedValue({
        stdout: "Built successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.executeCommand.mockResolvedValue({
        stdout: "Frontend created successfully",
        stderr: "",
        exitCode: 0,
      });

      // Mock file operations
      mockFileUtils.pathExists.mockResolvedValue(true);
      mockFileUtils.moveDirectoryContents.mockResolvedValue();
      mockFileUtils.safeRemove.mockResolvedValue();
      mockFileUtils.cleanupTempFiles.mockResolvedValue();

      const result = await setupFrontendWithPolkadotDapp(
        projectDir,
        projectName
      );

      expect(result).toEqual({
        success: true,
        output: "Frontend created successfully",
      });

      // Verify all steps were called
      expect(mockProcessUtils.cloneRepository).toHaveBeenCalledWith(
        "https://github.com/w3b3d3v/create-polkadot-dapp.git",
        path.join(projectDir, "temp-create-polkadot-dapp"),
        projectDir
      );
      expect(mockProcessUtils.installDependencies).toHaveBeenCalled();
      expect(mockProcessUtils.buildProject).toHaveBeenCalled();
      expect(mockProcessUtils.executeCommand).toHaveBeenCalledWith(
        "node",
        expect.arrayContaining([
          expect.stringContaining("main.js"),
          "--project-name",
          `${projectName}-frontend`,
          "--template",
          "react-solidity-hardhat",
        ]),
        expect.objectContaining({
          cwd: path.join(projectDir, "front"),
        })
      );
      expect(mockFileUtils.cleanupTempFiles).toHaveBeenCalled();
    });

    test("should handle git clone failure", async () => {
      mockProcessUtils.cloneRepository.mockRejectedValue(
        new Error("Git clone failed: Permission denied")
      );
      mockFileUtils.cleanupTempFiles.mockResolvedValue();

      await expect(
        setupFrontendWithPolkadotDapp(projectDir, projectName)
      ).rejects.toThrow("Git clone failed: Permission denied");

      expect(mockFileUtils.cleanupTempFiles).toHaveBeenCalled();
    });

    test("should handle dependency installation failure", async () => {
      mockProcessUtils.cloneRepository.mockResolvedValue({
        stdout: "Cloned successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.installDependencies.mockRejectedValue(
        new Error("yarn install failed: Network error")
      );
      mockFileUtils.cleanupTempFiles.mockResolvedValue();

      await expect(
        setupFrontendWithPolkadotDapp(projectDir, projectName)
      ).rejects.toThrow("yarn install failed: Network error");

      expect(mockFileUtils.cleanupTempFiles).toHaveBeenCalled();
    });

    test("should handle build failure", async () => {
      mockProcessUtils.cloneRepository.mockResolvedValue({
        stdout: "Cloned successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.installDependencies.mockResolvedValue({
        stdout: "Installed successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.buildProject.mockRejectedValue(
        new Error("yarn build failed: TypeScript errors")
      );
      mockFileUtils.cleanupTempFiles.mockResolvedValue();

      await expect(
        setupFrontendWithPolkadotDapp(projectDir, projectName)
      ).rejects.toThrow("yarn build failed: TypeScript errors");

      expect(mockFileUtils.cleanupTempFiles).toHaveBeenCalled();
    });

    test("should handle create-polkadot-dapp failure", async () => {
      mockProcessUtils.cloneRepository.mockResolvedValue({
        stdout: "Cloned successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.installDependencies.mockResolvedValue({
        stdout: "Installed successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.buildProject.mockResolvedValue({
        stdout: "Built successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.executeCommand.mockResolvedValue({
        stdout: "",
        stderr: "Template not found",
        exitCode: 1,
      });
      mockFileUtils.cleanupTempFiles.mockResolvedValue();

      await expect(
        setupFrontendWithPolkadotDapp(projectDir, projectName)
      ).rejects.toThrow("create-polkadot-dapp failed: Template not found");

      expect(mockFileUtils.cleanupTempFiles).toHaveBeenCalled();
    });
  });

  describe("reorganizeFrontendStructure", () => {
    const frontDir = "/test/project/front";
    const projectName = "test-project";

    test("should reorganize frontend structure successfully", async () => {
      mockFileUtils.pathExists.mockImplementation((path) => {
        if (path.includes("frontend")) return Promise.resolve(true);
        if (path.includes("contracts")) return Promise.resolve(true);
        if (path.includes("README.md")) return Promise.resolve(true);
        if (path.includes(`${projectName}-frontend`))
          return Promise.resolve(true);
        return Promise.resolve(false);
      });
      mockFileUtils.moveDirectoryContents.mockResolvedValue();
      mockFileUtils.safeRemove.mockResolvedValue();

      await reorganizeFrontendStructure(frontDir, projectName);

      expect(mockFileUtils.moveDirectoryContents).toHaveBeenCalledWith(
        path.join(frontDir, `${projectName}-frontend`, "frontend"),
        frontDir
      );
      expect(mockFileUtils.safeRemove).toHaveBeenCalledTimes(3); // contracts, README, nested dir
    });

    test("should handle missing frontend source directory", async () => {
      mockFileUtils.pathExists.mockImplementation((path) => {
        if (path.includes(`${projectName}-frontend/frontend`))
          return Promise.resolve(false);
        return Promise.resolve(true);
      });
      mockFileUtils.safeRemove.mockResolvedValue();

      await reorganizeFrontendStructure(frontDir, projectName);

      expect(mockFileUtils.moveDirectoryContents).not.toHaveBeenCalled();
      expect(mockFileUtils.safeRemove).toHaveBeenCalledTimes(3); // contracts, README, nested dir
    });

    test("should handle file operation errors gracefully", async () => {
      mockFileUtils.pathExists.mockResolvedValue(true);
      mockFileUtils.moveDirectoryContents.mockRejectedValue(
        new Error("Permission denied")
      );

      await expect(
        reorganizeFrontendStructure(frontDir, projectName)
      ).rejects.toThrow("Permission denied");
    });
  });

  describe("validateFrontendSetup", () => {
    const projectDir = "/test/project";

    test("should validate successful setup", async () => {
      mockFileUtils.pathExists.mockResolvedValue(true);
      mockProcessUtils.executeCommand
        .mockResolvedValueOnce({
          stdout: "git version 2.34.1",
          stderr: "",
          exitCode: 0,
        })
        .mockResolvedValueOnce({ stdout: "1.22.19", stderr: "", exitCode: 0 });

      const result = await validateFrontendSetup(projectDir);

      expect(result).toEqual({
        valid: true,
        errors: [],
      });
    });

    test("should detect missing frontend directory", async () => {
      mockFileUtils.pathExists.mockResolvedValue(false);
      mockProcessUtils.executeCommand
        .mockResolvedValueOnce({
          stdout: "git version 2.34.1",
          stderr: "",
          exitCode: 0,
        })
        .mockResolvedValueOnce({ stdout: "1.22.19", stderr: "", exitCode: 0 });

      const result = await validateFrontendSetup(projectDir);

      expect(result).toEqual({
        valid: false,
        errors: ["Frontend directory does not exist"],
      });
    });

    test("should detect missing git", async () => {
      mockFileUtils.pathExists.mockResolvedValue(true);
      mockProcessUtils.executeCommand
        .mockRejectedValueOnce(new Error("git not found"))
        .mockResolvedValueOnce({ stdout: "1.22.19", stderr: "", exitCode: 0 });

      const result = await validateFrontendSetup(projectDir);

      expect(result).toEqual({
        valid: false,
        errors: ["Git is not available"],
      });
    });

    test("should detect missing yarn and npm", async () => {
      mockFileUtils.pathExists.mockResolvedValue(true);
      mockProcessUtils.executeCommand
        .mockResolvedValueOnce({
          stdout: "git version 2.34.1",
          stderr: "",
          exitCode: 0,
        })
        .mockRejectedValueOnce(new Error("yarn not found"))
        .mockRejectedValueOnce(new Error("npm not found"));

      const result = await validateFrontendSetup(projectDir);

      expect(result).toEqual({
        valid: false,
        errors: ["Neither yarn nor npm is available"],
      });
    });

    test("should fallback to npm when yarn is not available", async () => {
      mockFileUtils.pathExists.mockResolvedValue(true);
      mockProcessUtils.executeCommand
        .mockResolvedValueOnce({
          stdout: "git version 2.34.1",
          stderr: "",
          exitCode: 0,
        })
        .mockRejectedValueOnce(new Error("yarn not found"))
        .mockResolvedValueOnce({ stdout: "8.19.2", stderr: "", exitCode: 0 });

      const result = await validateFrontendSetup(projectDir);

      expect(result).toEqual({
        valid: true,
        errors: [],
      });
    });
  });
});
