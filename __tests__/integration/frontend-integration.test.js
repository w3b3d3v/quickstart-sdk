const path = require("path");

// Mock all dependencies
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

const mockScaffold = {
  createProjectStructure: jest.fn(),
  createProjectFiles: jest.fn(),
};

const mockAsciiArt = {
  displayWelcomeArt: jest.fn(),
};

const mockInput = jest.fn();

jest.mock("../../src/utils/process-utils", () => mockProcessUtils);
jest.mock("../../src/utils/file-utils", () => mockFileUtils);
jest.mock("../../src/project/scaffold", () => mockScaffold);
jest.mock("../../src/utils/ascii-art", () => mockAsciiArt);
jest.mock("@inquirer/prompts", () => ({ input: mockInput }));

const { init } = require("../../src/cli");
const { setupFrontendWithPolkadotDapp } = require("../../src/frontend/setup");

describe("Frontend Integration Tests", () => {
  let originalCwd;
  let originalExit;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock process.cwd() for consistent testing
    originalCwd = process.cwd;
    process.cwd = jest.fn(() => "/test/workspace");

    // Mock process.exit to prevent test termination
    originalExit = process.exit;
    process.exit = jest.fn();
  });

  afterEach(() => {
    // Restore original functions
    process.cwd = originalCwd;
    process.exit = originalExit;
  });

  describe("Complete Frontend Setup Flow", () => {
    test("should complete the entire frontend setup successfully", async () => {
      // Setup all mocks for successful execution
      mockAsciiArt.displayWelcomeArt.mockResolvedValue();
      mockInput.mockResolvedValue("test-project");
      mockScaffold.createProjectStructure.mockResolvedValue();
      mockScaffold.createProjectFiles.mockResolvedValue();

      // Mock successful frontend setup
      mockProcessUtils.cloneRepository.mockResolvedValue({
        stdout: "Cloned successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.installDependencies.mockResolvedValue({
        stdout: "Dependencies installed",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.buildProject.mockResolvedValue({
        stdout: "Project built",
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

      // Execute the complete flow
      await init();

      // Verify the complete flow was executed
      expect(mockAsciiArt.displayWelcomeArt).toHaveBeenCalled();
      expect(mockInput).toHaveBeenCalledWith({
        message: "Enter your project name:",
        validate: expect.any(Function),
      });
      expect(mockScaffold.createProjectStructure).toHaveBeenCalledWith(
        "/test/workspace/test-project"
      );
      expect(mockScaffold.createProjectFiles).toHaveBeenCalledWith(
        "/test/workspace/test-project",
        "test-project"
      );
      expect(mockProcessUtils.cloneRepository).toHaveBeenCalled();
      expect(mockProcessUtils.installDependencies).toHaveBeenCalled();
      expect(mockProcessUtils.buildProject).toHaveBeenCalled();
      expect(mockProcessUtils.executeCommand).toHaveBeenCalled();
      expect(mockFileUtils.cleanupTempFiles).toHaveBeenCalled();
    });

    test("should handle frontend setup failure gracefully", async () => {
      // Setup mocks for project structure success but frontend failure
      mockAsciiArt.displayWelcomeArt.mockResolvedValue();
      mockInput.mockResolvedValue("test-project");
      mockScaffold.createProjectStructure.mockResolvedValue();
      mockScaffold.createProjectFiles.mockResolvedValue();

      // Mock frontend setup failure
      mockProcessUtils.cloneRepository.mockRejectedValue(
        new Error("Network error: Unable to clone repository")
      );
      mockFileUtils.cleanupTempFiles.mockResolvedValue();

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await init();

      // Should show error but not exit with success message
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("frontend setup encountered an issue")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Network error: Unable to clone repository")
      );

      consoleSpy.mockRestore();
    });

    test("should handle project structure creation failure", async () => {
      mockAsciiArt.displayWelcomeArt.mockResolvedValue();
      mockInput.mockResolvedValue("test-project");
      mockScaffold.createProjectStructure.mockRejectedValue(
        new Error("Permission denied")
      );

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await init();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error creating project:",
        "Permission denied"
      );
      expect(process.exit).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
    });
  });

  describe("Frontend Setup Edge Cases", () => {
    test("should handle partial file reorganization failure", async () => {
      const projectDir = "/test/project";
      const projectName = "test-project";

      // Mock successful setup until reorganization
      mockProcessUtils.cloneRepository.mockResolvedValue({
        stdout: "Cloned successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.installDependencies.mockResolvedValue({
        stdout: "Dependencies installed",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.buildProject.mockResolvedValue({
        stdout: "Project built",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.executeCommand.mockResolvedValue({
        stdout: "Frontend created successfully",
        stderr: "",
        exitCode: 0,
      });

      // Mock file operations - reorganization should fail but cleanup should work
      mockFileUtils.pathExists.mockResolvedValue(true);
      mockFileUtils.moveDirectoryContents.mockRejectedValue(
        new Error("Permission denied")
      );
      mockFileUtils.cleanupTempFiles.mockResolvedValue();

      // This should throw the reorganization error
      await expect(
        setupFrontendWithPolkadotDapp(projectDir, projectName)
      ).rejects.toThrow("Permission denied");

      expect(mockFileUtils.cleanupTempFiles).toHaveBeenCalled();
    });

    test("should handle cleanup failure during error recovery", async () => {
      const projectDir = "/test/project";
      const projectName = "test-project";

      mockProcessUtils.cloneRepository.mockResolvedValue({
        stdout: "Cloned successfully",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.installDependencies.mockRejectedValue(
        new Error("Network timeout")
      );
      mockFileUtils.cleanupTempFiles.mockRejectedValue(
        new Error("Cleanup failed")
      );

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      await expect(
        setupFrontendWithPolkadotDapp(projectDir, projectName)
      ).rejects.toThrow("Cleanup failed");

      // Cleanup should have been attempted
      expect(mockFileUtils.cleanupTempFiles).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test("should validate input correctly", async () => {
      mockAsciiArt.displayWelcomeArt.mockResolvedValue();
      mockInput.mockResolvedValue("valid-project-name");
      mockScaffold.createProjectStructure.mockResolvedValue();
      mockScaffold.createProjectFiles.mockResolvedValue();

      // Mock successful frontend setup
      mockProcessUtils.cloneRepository.mockResolvedValue({
        stdout: "Success",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.installDependencies.mockResolvedValue({
        stdout: "Success",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.buildProject.mockResolvedValue({
        stdout: "Success",
        stderr: "",
        exitCode: 0,
      });
      mockProcessUtils.executeCommand.mockResolvedValue({
        stdout: "Success",
        stderr: "",
        exitCode: 0,
      });
      mockFileUtils.pathExists.mockResolvedValue(true);
      mockFileUtils.moveDirectoryContents.mockResolvedValue();
      mockFileUtils.safeRemove.mockResolvedValue();
      mockFileUtils.cleanupTempFiles.mockResolvedValue();

      await init();

      // Check that the validation function was passed to input
      const inputCall = mockInput.mock.calls[0][0];
      expect(inputCall.validate).toBeInstanceOf(Function);

      // Test the validation function
      expect(inputCall.validate("")).toBe("Project name cannot be empty.");
      expect(inputCall.validate("   ")).toBe("Project name cannot be empty.");
      expect(inputCall.validate("valid-name")).toBe(true);
    });
  });

  describe("Performance and Reliability", () => {
    test("should handle concurrent file operations", async () => {
      const projectDir = "/test/project";
      const projectName = "test-project";

      // Mock successful operations with some delay
      mockProcessUtils.cloneRepository.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  stdout: "Cloned",
                  stderr: "",
                  exitCode: 0,
                }),
              100
            )
          )
      );
      mockProcessUtils.installDependencies.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  stdout: "Installed",
                  stderr: "",
                  exitCode: 0,
                }),
              150
            )
          )
      );
      mockProcessUtils.buildProject.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  stdout: "Built",
                  stderr: "",
                  exitCode: 0,
                }),
              200
            )
          )
      );
      mockProcessUtils.executeCommand.mockResolvedValue({
        stdout: "Created",
        stderr: "",
        exitCode: 0,
      });

      // Mock file operations
      mockFileUtils.pathExists.mockResolvedValue(true);
      mockFileUtils.moveDirectoryContents.mockResolvedValue();
      mockFileUtils.safeRemove.mockResolvedValue();
      mockFileUtils.cleanupTempFiles.mockResolvedValue();

      const startTime = Date.now();
      const result = await setupFrontendWithPolkadotDapp(
        projectDir,
        projectName
      );
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeGreaterThan(400); // Sequential operations should take time
    });
  });
});
