const { input } = require("@inquirer/prompts");
const path = require("path");
const { displayWelcomeArt } = require("./utils/ascii-art");
const {
  createProjectStructure,
  createProjectFiles,
} = require("./project/scaffold");
const { setupFrontendWithPolkadotDapp } = require("./frontend/setup");

/**
 * Main CLI initialization function
 * @returns {Promise<void>}
 */
async function init() {
  try {
    // Display welcome ASCII art
    await displayWelcomeArt();

    // Prompt for project name using the new inquirer API
    const projectName = await input({
      message: "Enter your project name:",
      validate: (input) =>
        input.trim() ? true : "Project name cannot be empty.",
    });

    const trimmedProjectName = projectName.trim();
    const projectDir = path.join(process.cwd(), trimmedProjectName);

    // Create base project structure
    console.log(`Creating project structure for "${trimmedProjectName}"...`);
    await createProjectStructure(projectDir);

    // Create project configuration files
    await createProjectFiles(projectDir, trimmedProjectName);

    console.log(
      `Project "${trimmedProjectName}" created successfully at ${projectDir}!`
    );
    console.log(`\nCreated files:`);
    console.log(`- .cursor/rules/project-structure.mdc`);
    console.log(`- .github/workflows/frontend-build.yml`);
    console.log(`- .github/workflows/docs-build.yml`);
    console.log(`- README.md`);

    // Set up frontend with create-polkadot-dapp
    try {
      await setupFrontendWithPolkadotDapp(projectDir, trimmedProjectName);

      console.log(
        `\n🎉 Complete! Your Polkadot project "${trimmedProjectName}" is ready!`
      );
      console.log(`\n📁 Project structure:`);
      console.log(`   ├── contracts/`);
      console.log(`   │   ├── develop/    # Smart contract development`);
      console.log(`   │   └── deploy/     # Contract deployment scripts`);
      console.log(
        `   ├── front/          # React frontend with Polkadot integration`
      );
      console.log(`   ├── cloud-functions/ # Cloud function implementations`);
      console.log(`   ├── .cursor/        # Cursor IDE configuration`);
      console.log(`   └── .github/        # CI/CD workflows`);
      console.log(`\n🚀 Next steps:`);
      console.log(`   1. cd ${trimmedProjectName}/front`);
      console.log(`   2. npm run dev`);
      console.log(`\n📖 Check the README.md for more details!`);
    } catch (error) {
      console.error(
        `\n⚠️  Project structure created successfully, but frontend setup encountered an issue:`
      );
      console.error(`   ${error.message}`);
      console.log(`\n✨ You can manually setup the frontend later by running:`);
      console.log(`   cd ${trimmedProjectName}/front`);
      console.log(
        `   npx --yes --package=https://github.com/w3b3d3v/create-polkadot-dapp create-polkadot-dapp --project-name temp-frontend --template react-solidity-hardhat`
      );
      console.log(
        `   Then move the contents of temp-frontend/frontend/ to the current directory`
      );
      console.log(`\n📁 Your project structure is ready at: ${projectDir}`);
    }
  } catch (error) {
    console.error("Error creating project:", error.message);
    process.exit(1);
  }
}

module.exports = {
  init,
};
