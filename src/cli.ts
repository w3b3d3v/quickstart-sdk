import { input } from "@inquirer/prompts";
import * as path from "path";
import { displayWelcomeArt } from "./utils/ascii-art";
import { createProjectStructure, createProjectFiles } from "./project/scaffold";
import { setupFrontendWithPolkadotDapp } from "./frontend/setup";

/**
 * Input validation function type
 */
type ValidationFunction = (input: string) => boolean | string;

/**
 * Main CLI initialization function
 */
export async function init(): Promise<void> {
  try {
    // Display welcome ASCII art
    await displayWelcomeArt();

    // Prompt for project name using the new inquirer API
    const projectName: string = await input({
      message: "Enter your project name:",
      validate: ((input: string): boolean | string =>
        input.trim()
          ? true
          : "Project name cannot be empty.") as ValidationFunction,
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `\n⚠️  Project structure created successfully, but frontend setup encountered an issue:`
      );
      console.error(`   ${errorMessage}`);
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating project:", errorMessage);
    process.exit(1);
  }
}
