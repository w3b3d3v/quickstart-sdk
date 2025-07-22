// Global test setup
global.console = {
  ...console,
  // Mock console methods in tests to avoid cluttered output
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Increase timeout for integration tests
jest.setTimeout(15000);

// Mock process.stdout.columns globally
Object.defineProperty(process.stdout, "columns", {
  value: 120,
  writable: true,
  configurable: true,
});

// Add custom matchers
expect.extend({
  toBeValidProjectName(received) {
    const pass = typeof received === "string" && received.trim().length > 0;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid project name`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid project name`,
        pass: false,
      };
    }
  },

  toContainDirectoryStructure(received, expected) {
    const pass = expected.every((dir) => received.includes(dir));
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to contain all directories: ${expected.join(
            ", "
          )}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to contain all directories: ${expected.join(
            ", "
          )}`,
        pass: false,
      };
    }
  },
});

// Set up environment variables for testing
process.env.NODE_ENV = "test";
