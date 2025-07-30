const path = require("path");
const {
  executeCommand,
  cloneRepository,
  installDependencies,
  buildProject,
} = require("../utils/process-utils");
const {
  pathExists,
  moveDirectoryContents,
  safeRemove,
  cleanupTempFiles,
} = require("../utils/file-utils");

/**
 * Execute create-polkadot-dapp by cloning the w3b3d3v repository and using it locally
 * @param {string} projectDir - The main project directory
 * @param {string} projectName - The project name to use for the front app
 * @returns {Promise<{success: boolean, output: string}>}
 */
async function setupFrontendWithPolkadotDapp(projectDir, projectName) {
  console.log("\n🚀 Setting up frontend with create-polkadot-dapp...");

  const frontDir = path.join(projectDir, "front");
  const tempRepoDir = path.join(projectDir, "temp-create-polkadot-dapp");

  try {
    // Step 1: Clone the w3b3d3v repository
    await cloneRepository(
      "https://github.com/w3b3d3v/create-polkadot-dapp.git",
      tempRepoDir,
      projectDir
    );

    // Step 2: Install dependencies
    await installDependencies(tempRepoDir);

    // Step 3: Build the project
    await buildProject(tempRepoDir);

    // Step 4: Create the frontend project
    console.log("🎨 Creating frontend project...");
    const createAppResult = await executeCommand(
      "node",
      [
        path.join(tempRepoDir, "dist", "src", "bin", "main.js"),
        "--project-name",
        `${projectName}-frontend`,
        "--template",
        "react-solidity-hardhat",
      ],
      { cwd: frontDir }
    );

    if (createAppResult.exitCode !== 0) {
      throw new Error(`create-polkadot-dapp failed: ${createAppResult.stderr}`);
    }

    console.log("✅ Frontend project created!");

    // Step 5: Reorganize frontend structure
    await reorganizeFrontendStructure(frontDir, projectName);

    // Step 6: Clean up temporary files
    await cleanupTempFiles([tempRepoDir]);

    console.log("\n✅ Frontend setup completed successfully!");
    return { success: true, output: createAppResult.stdout };
  } catch (error) {
    // Clean up on error
    await cleanupTempFiles([tempRepoDir]);
    throw error;
  }
}

/**
 * Reorganize the frontend structure after creation
 * @param {string} frontDir - Frontend directory
 * @param {string} projectName - Project name
 * @returns {Promise<void>}
 */
async function reorganizeFrontendStructure(frontDir, projectName) {
  console.log("🔧 Reorganizing frontend structure...");

  const createdProjectPath = path.join(frontDir, `${projectName}-frontend`);
  const frontendSourcePath = path.join(createdProjectPath, "frontend");
  const contractsPath = path.join(createdProjectPath, "contracts");

  try {
    // Move contents from nested frontend directory to front directory
    if (await pathExists(frontendSourcePath)) {
      await moveDirectoryContents(frontendSourcePath, frontDir);
      console.log("✅ Frontend files moved to correct location!");
    }

    // Remove the contracts folder (we have our own structure)
    if (await pathExists(contractsPath)) {
      await safeRemove(contractsPath);
      console.log("✅ Removed duplicate contracts folder!");
    }

    // Remove create-react-app generated README if it exists
    const readmePath = path.join(frontDir, "README.md");
    if (await pathExists(readmePath)) {
      await safeRemove(readmePath);
      console.log("✅ Removed create-react-app README!");
    }

    // Clean up the now-empty nested structure
    if (await pathExists(createdProjectPath)) {
      await safeRemove(createdProjectPath);
      console.log("✅ Cleaned up nested directories!");
    }
  } catch (error) {
    console.warn(
      "⚠️  Warning: Failed to reorganize frontend structure:",
      error.message
    );
    throw error;
  }
}

/**
 * Validate frontend setup requirements
 * @param {string} projectDir - Project directory
 * @returns {Promise<{valid: boolean, errors: string[]}>}
 */
async function validateFrontendSetup(projectDir) {
  const errors = [];

  // Check if front directory exists
  const frontDir = path.join(projectDir, "front");
  if (!(await pathExists(frontDir))) {
    errors.push("Frontend directory does not exist");
  }

  // Check for required tools (git, yarn/npm)
  try {
    await executeCommand("git", ["--version"], { showOutput: false });
  } catch (error) {
    errors.push("Git is not available");
  }

  try {
    await executeCommand("yarn", ["--version"], { showOutput: false });
  } catch (error) {
    try {
      await executeCommand("npm", ["--version"], { showOutput: false });
    } catch (npmError) {
      errors.push("Neither yarn nor npm is available");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  setupFrontendWithPolkadotDapp,
  reorganizeFrontendStructure,
  validateFrontendSetup,
};
