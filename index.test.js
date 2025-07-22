// Mock external dependencies
const mockInput = jest.fn();
const mockFsExtra = {
  ensureDir: jest.fn(),
  writeFile: jest.fn(),
};
const mockFiglet = jest.fn();

jest.mock("@inquirer/prompts", () => ({
  input: mockInput,
}));

jest.mock("fs-extra", () => mockFsExtra);

jest.mock("figlet", () => mockFiglet);

// Mock console methods
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Mock process.stdout.columns
Object.defineProperty(process.stdout, "columns", {
  value: 120,
  configurable: true,
});

describe("Quickstart SDK CLI", () => {
  let originalCwd;
  let originalExit;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockInput.mockClear();
    mockFsExtra.ensureDir.mockClear();
    mockFsExtra.writeFile.mockClear();
    mockFiglet.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();

    // Mock process.cwd()
    originalCwd = process.cwd;
    process.cwd = jest.fn(() => "/test/directory");

    // Mock process.exit
    originalExit = process.exit;
    process.exit = jest.fn();
  });

  afterEach(() => {
    // Restore original functions
    process.cwd = originalCwd;
    process.exit = originalExit;
  });

  afterAll(() => {
    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe("displayWelcomeArt", () => {
    beforeEach(() => {
      // Reset the require cache to get fresh module
      delete require.cache[require.resolve("./index.js")];
    });

    test("should display welcome art successfully", async () => {
      mockFiglet.mockImplementation((text, options, callback) => {
        callback(null, "POLKADOT CLOUD STARTER");
      });

      const { displayWelcomeArt } = require("./index.js");

      await expect(displayWelcomeArt()).resolves.toBeUndefined();

      expect(mockFiglet).toHaveBeenCalledWith(
        "POLKADOT CLOUD STARTER",
        expect.objectContaining({
          font: "Small",
          horizontalLayout: "universal smushing",
          verticalLayout: "default",
          width: 120,
        }),
        expect.any(Function)
      );

      expect(mockConsoleLog).toHaveBeenCalledWith("\n");
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "\nWelcome to Polkadot Cloud Project Starter by ⚡WEB3DEV ⚡\n"
      );
    });

    test("should handle figlet error", async () => {
      const figletError = new Error("Figlet error");
      mockFiglet.mockImplementation((text, options, callback) => {
        callback(figletError, null);
      });

      const { displayWelcomeArt } = require("./index.js");

      await expect(displayWelcomeArt()).rejects.toThrow("Figlet error");

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Something went wrong with figlet..."
      );
    });
  });

  describe("init function", () => {
    beforeEach(() => {
      delete require.cache[require.resolve("./index.js")];

      // Mock successful figlet call for displayWelcomeArt
      mockFiglet.mockImplementation((text, options, callback) => {
        callback(null, "POLKADOT CLOUD STARTER");
      });
    });

    test("should create project successfully with valid input", async () => {
      mockInput.mockResolvedValue("my-test-project");
      mockFsExtra.ensureDir.mockResolvedValue();
      mockFsExtra.writeFile.mockResolvedValue();

      const { init } = require("./index.js");

      await init();

      // Verify input prompt
      expect(mockInput).toHaveBeenCalledWith({
        message: "Enter your project name:",
        validate: expect.any(Function),
      });

      // Verify directory creation
      expect(mockFsExtra.ensureDir).toHaveBeenCalledWith(
        "/test/directory/my-test-project/contracts/develop"
      );
      expect(mockFsExtra.ensureDir).toHaveBeenCalledWith(
        "/test/directory/my-test-project/contracts/deploy"
      );
      expect(mockFsExtra.ensureDir).toHaveBeenCalledWith(
        "/test/directory/my-test-project/front"
      );
      expect(mockFsExtra.ensureDir).toHaveBeenCalledWith(
        "/test/directory/my-test-project/cloud-functions"
      );
      expect(mockFsExtra.ensureDir).toHaveBeenCalledWith(
        "/test/directory/my-test-project/.cursor/rules"
      );
      expect(mockFsExtra.ensureDir).toHaveBeenCalledWith(
        "/test/directory/my-test-project/.github/workflows"
      );

      // Verify file creation
      expect(mockFsExtra.writeFile).toHaveBeenCalledWith(
        "/test/directory/my-test-project/.cursor/rules/project-structure.mdc",
        expect.stringContaining("# Project Structure Rules")
      );
      expect(mockFsExtra.writeFile).toHaveBeenCalledWith(
        "/test/directory/my-test-project/.github/workflows/frontend-build.yml",
        expect.stringContaining("name: Frontend Build")
      );
      expect(mockFsExtra.writeFile).toHaveBeenCalledWith(
        "/test/directory/my-test-project/.github/workflows/docs-build.yml",
        expect.stringContaining("name: Documentation Build")
      );
      expect(mockFsExtra.writeFile).toHaveBeenCalledWith(
        "/test/directory/my-test-project/README.md",
        expect.stringContaining("# my-test-project")
      );

      // Verify success message
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Project "my-test-project" created successfully at /test/directory/my-test-project!'
      );
    });

    test("should handle project names with whitespace", async () => {
      mockInput.mockResolvedValue("  my project with spaces  ");
      mockFsExtra.ensureDir.mockResolvedValue();
      mockFsExtra.writeFile.mockResolvedValue();

      const { init } = require("./index.js");

      await init();

      expect(mockFsExtra.ensureDir).toHaveBeenCalledWith(
        "/test/directory/my project with spaces/contracts/develop"
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Project "my project with spaces" created successfully at /test/directory/my project with spaces!'
      );
    });

    test("should handle file system errors gracefully", async () => {
      mockInput.mockResolvedValue("test-project");
      const fsError = new Error("Permission denied");
      mockFsExtra.ensureDir.mockRejectedValue(fsError);

      const { init } = require("./index.js");

      await init();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error creating project:",
        "Permission denied"
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test("should validate project name input", async () => {
      // First call with empty string, second call with valid name
      mockInput.mockResolvedValueOnce("my-project");
      mockFsExtra.ensureDir.mockResolvedValue();
      mockFsExtra.writeFile.mockResolvedValue();

      const { init } = require("./index.js");

      await init();

      const inputCall = mockInput.mock.calls[0][0];

      // Test validation function
      expect(inputCall.validate("")).toBe("Project name cannot be empty.");
      expect(inputCall.validate("   ")).toBe("Project name cannot be empty.");
      expect(inputCall.validate("valid-name")).toBe(true);
    });
  });

  describe("File content generation", () => {
    test("should generate correct cursor rules file content", async () => {
      mockInput.mockResolvedValue("test-project");
      mockFiglet.mockImplementation((text, options, callback) => {
        callback(null, "POLKADOT CLOUD STARTER");
      });
      mockFsExtra.ensureDir.mockResolvedValue();
      mockFsExtra.writeFile.mockResolvedValue();

      const { init } = require("./index.js");
      await init();

      const cursorRulesCall = mockFsExtra.writeFile.mock.calls.find((call) =>
        call[0].includes("project-structure.mdc")
      );

      expect(cursorRulesCall[1]).toContain("# Project Structure Rules");
      expect(cursorRulesCall[1]).toContain("contracts/develop/");
      expect(cursorRulesCall[1]).toContain("front/");
    });

    test("should generate correct GitHub workflow files", async () => {
      mockInput.mockResolvedValue("test-project");
      mockFiglet.mockImplementation((text, options, callback) => {
        callback(null, "POLKADOT CLOUD STARTER");
      });
      mockFsExtra.ensureDir.mockResolvedValue();
      mockFsExtra.writeFile.mockResolvedValue();

      const { init } = require("./index.js");
      await init();

      const frontendWorkflowCall = mockFsExtra.writeFile.mock.calls.find(
        (call) => call[0].includes("frontend-build.yml")
      );
      const docsWorkflowCall = mockFsExtra.writeFile.mock.calls.find((call) =>
        call[0].includes("docs-build.yml")
      );

      expect(frontendWorkflowCall[1]).toContain("name: Frontend Build");
      expect(frontendWorkflowCall[1]).toContain("npm ci");
      expect(frontendWorkflowCall[1]).toContain("npm run build");

      expect(docsWorkflowCall[1]).toContain("name: Documentation Build");
      expect(docsWorkflowCall[1]).toContain("@docusaurus/core");
    });

    test("should generate README with correct project name", async () => {
      mockInput.mockResolvedValue("my-awesome-project");
      mockFiglet.mockImplementation((text, options, callback) => {
        callback(null, "POLKADOT CLOUD STARTER");
      });
      mockFsExtra.ensureDir.mockResolvedValue();
      mockFsExtra.writeFile.mockResolvedValue();

      const { init } = require("./index.js");
      await init();

      const readmeCall = mockFsExtra.writeFile.mock.calls.find((call) =>
        call[0].includes("README.md")
      );

      expect(readmeCall[1]).toContain("# my-awesome-project");
      expect(readmeCall[1]).toContain("cd my-awesome-project");
      expect(readmeCall[1]).toContain(
        "This project includes GitHub Actions workflows for:"
      );
    });
  });

  describe("Integration tests", () => {
    test("should handle the complete flow successfully", async () => {
      mockInput.mockResolvedValue("integration-test-project");
      mockFiglet.mockImplementation((text, options, callback) => {
        callback(null, "POLKADOT CLOUD STARTER");
      });
      mockFsExtra.ensureDir.mockResolvedValue();
      mockFsExtra.writeFile.mockResolvedValue();

      const { init } = require("./index.js");

      await init();

      // Verify the complete flow
      expect(mockFiglet).toHaveBeenCalled();
      expect(mockInput).toHaveBeenCalled();
      expect(mockFsExtra.ensureDir).toHaveBeenCalledTimes(6);
      expect(mockFsExtra.writeFile).toHaveBeenCalledTimes(4);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Project "integration-test-project" created successfully at /test/directory/integration-test-project!'
      );
    });
  });
});
