const { spawn } = require("child_process");

/**
 * Execute a command and return a promise with the result
 * @param {string} command - The command to execute
 * @param {string[]} args - Arguments for the command
 * @param {Object} options - Options for spawn
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
      ...options,
    };

    const process = spawn(command, args, defaultOptions);

    let stdout = "";
    let stderr = "";

    if (process.stdout) {
      process.stdout.on("data", (data) => {
        const message = data.toString();
        stdout += message;
        if (options.showOutput !== false) {
          process.stdout.write(message);
        }
      });
    }

    if (process.stderr) {
      process.stderr.on("data", (data) => {
        const message = data.toString();
        stderr += message;
        if (options.showOutput !== false) {
          process.stderr.write(message);
        }
      });
    }

    process.on("close", (exitCode) => {
      resolve({ stdout, stderr, exitCode });
    });

    process.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Clone a git repository
 * @param {string} repoUrl - Repository URL to clone
 * @param {string} targetDir - Target directory for cloning
 * @param {string} cwd - Working directory
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
async function cloneRepository(repoUrl, targetDir, cwd) {
  console.log(`📦 Cloning repository: ${repoUrl}`);

  const result = await executeCommand("git", ["clone", repoUrl, targetDir], {
    cwd,
  });

  if (result.exitCode !== 0) {
    throw new Error(`Git clone failed: ${result.stderr}`);
  }

  console.log("✅ Repository cloned successfully!");
  return result;
}

/**
 * Install dependencies using yarn
 * @param {string} cwd - Working directory
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
async function installDependencies(cwd) {
  console.log("🔧 Installing dependencies...");

  const result = await executeCommand("yarn", ["install"], { cwd });

  if (result.exitCode !== 0) {
    throw new Error(`yarn install failed: ${result.stderr}`);
  }

  console.log("✅ Dependencies installed successfully!");
  return result;
}

/**
 * Build a project using yarn
 * @param {string} cwd - Working directory
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
async function buildProject(cwd) {
  console.log("🔨 Building the project...");

  const result = await executeCommand("yarn", ["build"], { cwd });

  if (result.exitCode !== 0) {
    throw new Error(`yarn build failed: ${result.stderr}`);
  }

  console.log("✅ Project built successfully!");
  return result;
}

module.exports = {
  executeCommand,
  cloneRepository,
  installDependencies,
  buildProject,
};
