#!/usr/bin/env node

const { input } = require("@inquirer/prompts");
const fs = require("fs-extra");
const path = require("path");
const figlet = require("figlet");
const { spawn } = require("child_process");

function displayWelcomeArt() {
  return new Promise((resolve, reject) => {
    figlet(
      "POLKADOT CLOUD STARTER",
      {
        font: "Small",
        horizontalLayout: "universal smushing",
        verticalLayout: "default",
        width: 120,
      },
      (err, data) => {
        if (err) {
          console.log("Something went wrong with figlet...");
          console.dir(err);
          reject(err);
          return;
        }

        const logo = [
          "             ..            ",
          "             ::::..        ",
          "          .:;;::::.        ",
          "     .+XXXXXXx;:::.        ",
          "     .:::;+xxXXx+;.        ",
          "     .::::::::;;:..        ",
          "     .:::::::::::::::.     ",
          "     ...:;+;:::::::::..    ",
          " .:+xxXXXXXXXxx+;::::..    ",
          " .:+++++++xxxXXXXXX+;..    ",
          " .:++++++++++++++;::..     ",
          "  .:;+++++++++++++++++++:. ",
          "    ....:+x+++++++++++++;. ",
          "   .+xxxxXXXXXXxxxx+++++;. ",
          "   .++++++++xxXXXXXXXXx+:. ",
          "   .++++++++++:..          ",
          "   ..:;++++++;             ",
          "         ..:;;             ",
        ];

        // Split the figlet text into lines
        const textLines = data.trim().split("\n");
        const terminalWidth = process.stdout.columns || 120;

        // Center the logo
        const centerLogo = (lines) => {
          const maxLength = Math.max(...lines.map((line) => line.length));
          const padding = Math.max(
            0,
            Math.floor((terminalWidth - maxLength) / 2)
          );
          return lines.map((line) => " ".repeat(padding) + line);
        };

        // Center the text
        const centerText = (lines) => {
          const maxLength = Math.max(...lines.map((line) => line.length));
          const padding = Math.max(
            0,
            Math.floor((terminalWidth - maxLength) / 2)
          );
          return lines.map((line) => " ".repeat(padding) + line);
        };

        console.log("\n");

        // Display the logo horizontally first
        const centeredLogo = centerLogo(logo);
        centeredLogo.forEach((line) => console.log(line));

        console.log("\n");

        // Then display the centered text
        const centeredText = centerText(textLines);
        centeredText.forEach((line) => console.log(line));

        console.log(
          "\nWelcome to Polkadot Cloud Project Starter by ⚡WEB3DEV ⚡\n"
        );
        resolve();
      }
    );
  });
}

/**
 * Execute create-polkadot-dapp by cloning the w3b3d3v repository and using it locally
 * @param {string} projectDir - The main project directory
 * @param {string} projectName - The project name to use for the front app
 */
async function setupFrontendWithPolkadotDapp(projectDir, projectName) {
  return new Promise((resolve, reject) => {
    console.log("\n🚀 Setting up frontend with create-polkadot-dapp...");
    console.log("📦 Cloning w3b3d3v/create-polkadot-dapp repository...");

    const frontDir = path.join(projectDir, "front");
    const tempRepoDir = path.join(projectDir, "temp-create-polkadot-dapp");

    // First, clone the w3b3d3v repository
    const gitCloneProcess = spawn(
      "git",
      [
        "clone",
        "https://github.com/w3b3d3v/create-polkadot-dapp.git",
        tempRepoDir,
      ],
      {
        cwd: projectDir,
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
      }
    );

    let cloneOutput = "";
    let cloneErrorOutput = "";

    gitCloneProcess.stdout.on("data", (data) => {
      const message = data.toString();
      cloneOutput += message;
      process.stdout.write(message);
    });

    gitCloneProcess.stderr.on("data", (data) => {
      const message = data.toString();
      cloneErrorOutput += message;
      process.stderr.write(message);
    });

    gitCloneProcess.on("close", (cloneCode) => {
      if (cloneCode !== 0) {
        console.error(
          `\n❌ Failed to clone repository with exit code ${cloneCode}`
        );
        reject(new Error(`Git clone failed: ${cloneErrorOutput}`));
        return;
      }

      console.log("✅ Repository cloned successfully!");
      console.log("🔧 Installing dependencies in the cloned repository...");

      // Install dependencies in the cloned repo
      const npmInstallProcess = spawn("yarn", ["install"], {
        cwd: tempRepoDir,
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
      });

      let installOutput = "";
      let installErrorOutput = "";

      npmInstallProcess.stdout.on("data", (data) => {
        const message = data.toString();
        installOutput += message;
        process.stdout.write(message);
      });

      npmInstallProcess.stderr.on("data", (data) => {
        const message = data.toString();
        installErrorOutput += message;
        process.stderr.write(message);
      });

      npmInstallProcess.on("close", (installCode) => {
        if (installCode !== 0) {
          console.error(
            `\n❌ Failed to install dependencies with exit code ${installCode}`
          );
          // Clean up temp directory
          fs.removeSync(tempRepoDir);
          reject(new Error(`yarn install failed: ${installErrorOutput}`));
          return;
        }

        console.log("✅ Dependencies installed successfully!");
        console.log("🔨 Building the project...");

        // Build the TypeScript project
        const buildProcess = spawn("yarn", ["build"], {
          cwd: tempRepoDir,
          stdio: ["pipe", "pipe", "pipe"],
          shell: true,
        });

        let buildOutput = "";
        let buildErrorOutput = "";

        buildProcess.stdout.on("data", (data) => {
          const message = data.toString();
          buildOutput += message;
          process.stdout.write(message);
        });

        buildProcess.stderr.on("data", (data) => {
          const message = data.toString();
          buildErrorOutput += message;
          process.stderr.write(message);
        });

        buildProcess.on("close", (buildCode) => {
          if (buildCode !== 0) {
            console.error(
              `\n❌ Failed to build project with exit code ${buildCode}`
            );
            // Clean up temp directory
            fs.removeSync(tempRepoDir);
            reject(new Error(`yarn build failed: ${buildErrorOutput}`));
            return;
          }

          console.log("✅ Project built successfully!");
          console.log("🎨 Creating frontend project...");

          // Now run the create-polkadot-dapp script from the built dist directory
          const createAppProcess = spawn(
            "node",
            [
              path.join(tempRepoDir, "dist", "src", "bin", "main.js"),
              "--project-name",
              `${projectName}-frontend`,
              "--template",
              "react-solidity-hardhat",
            ],
            {
              cwd: frontDir,
              stdio: ["pipe", "pipe", "pipe"],
              shell: true,
            }
          );

          let appOutput = "";
          let appErrorOutput = "";

          createAppProcess.stdout.on("data", (data) => {
            const message = data.toString();
            appOutput += message;
            process.stdout.write(message);
          });

          createAppProcess.stderr.on("data", (data) => {
            const message = data.toString();
            appErrorOutput += message;
            process.stderr.write(message);
          });

          createAppProcess.on("close", (appCode) => {
            // Clean up the temporary repository directory
            console.log("🧹 Cleaning up temporary files...");
            try {
              fs.removeSync(tempRepoDir);
              console.log("✅ Temporary files cleaned up!");
            } catch (cleanupError) {
              console.warn(
                "⚠️  Warning: Failed to clean up temporary directory:",
                cleanupError.message
              );
            }

            if (appCode === 0) {
              console.log("✅ Frontend project created!");
              console.log("🔧 Reorganizing frontend structure...");

              try {
                // Define paths
                const createdProjectPath = path.join(
                  frontDir,
                  `${projectName}-frontend`
                );
                const frontendSourcePath = path.join(
                  createdProjectPath,
                  "frontend"
                );
                const contractsPath = path.join(
                  createdProjectPath,
                  "contracts"
                );

                // Move contents from nested frontend directory to front directory
                if (fs.existsSync(frontendSourcePath)) {
                  const items = fs.readdirSync(frontendSourcePath);
                  for (const item of items) {
                    const sourcePath = path.join(frontendSourcePath, item);
                    const destPath = path.join(frontDir, item);
                    fs.moveSync(sourcePath, destPath, { overwrite: true });
                  }
                  console.log("✅ Frontend files moved to correct location!");
                }

                // Remove the contracts folder (we have our own structure)
                if (fs.existsSync(contractsPath)) {
                  fs.removeSync(contractsPath);
                  console.log("✅ Removed duplicate contracts folder!");
                }

                // Remove create-react-app generated README if it exists
                const readmePath = path.join(frontDir, "README.md");
                if (fs.existsSync(readmePath)) {
                  fs.removeSync(readmePath);
                  console.log("✅ Removed create-react-app README!");
                }

                // Clean up the now-empty nested structure
                if (fs.existsSync(createdProjectPath)) {
                  fs.removeSync(createdProjectPath);
                  console.log("✅ Cleaned up nested directories!");
                }

                console.log("\n✅ Frontend setup completed successfully!");
                resolve({ success: true, output: appOutput });
              } catch (reorganizeError) {
                console.warn(
                  "⚠️  Warning: Failed to reorganize frontend structure:",
                  reorganizeError.message
                );
                console.log("\n✅ Frontend setup completed with minor issues!");
                resolve({ success: true, output: appOutput });
              }
            } else {
              console.error(
                `\n❌ Frontend setup failed with exit code ${appCode}`
              );
              reject(
                new Error(`create-polkadot-dapp failed: ${appErrorOutput}`)
              );
            }
          });

          createAppProcess.on("error", (error) => {
            // Clean up temp directory on error
            try {
              fs.removeSync(tempRepoDir);
            } catch (cleanupError) {
              console.warn(
                "⚠️  Warning: Failed to clean up temporary directory:",
                cleanupError.message
              );
            }
            console.error(
              "\n❌ Failed to execute create-polkadot-dapp:",
              error.message
            );
            reject(error);
          });
        });

        buildProcess.on("error", (error) => {
          // Clean up temp directory on error
          try {
            fs.removeSync(tempRepoDir);
          } catch (cleanupError) {
            console.warn(
              "⚠️  Warning: Failed to clean up temporary directory:",
              cleanupError.message
            );
          }
          console.error("\n❌ Failed to build project:", error.message);
          reject(error);
        });
      });

      npmInstallProcess.on("error", (error) => {
        // Clean up temp directory on error
        try {
          fs.removeSync(tempRepoDir);
        } catch (cleanupError) {
          console.warn(
            "⚠️  Warning: Failed to clean up temporary directory:",
            cleanupError.message
          );
        }
        console.error("\n❌ Failed to install dependencies:", error.message);
        reject(error);
      });
    });

    gitCloneProcess.on("error", (error) => {
      console.error("\n❌ Failed to clone repository:", error.message);
      reject(error);
    });
  });
}

async function init() {
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

  try {
    // Create folder structure
    await fs.ensureDir(path.join(projectDir, "contracts/develop"));
    await fs.ensureDir(path.join(projectDir, "contracts/deploy"));
    await fs.ensureDir(path.join(projectDir, "front"));
    await fs.ensureDir(path.join(projectDir, "cloud-functions"));
    await fs.ensureDir(path.join(projectDir, ".cursor/rules"));
    await fs.ensureDir(path.join(projectDir, ".github/workflows"));

    // Create cursor rules file
    await fs.writeFile(
      path.join(projectDir, ".cursor/rules/project-structure.mdc"),
      `# Project Structure Rules

## Directory Structure
- \`contracts/develop/\` - Smart contract development files
- \`contracts/deploy/\` - Smart contract deployment scripts
- \`front/\` - Frontend application code
- \`cloud-functions/\` - Cloud function implementations

## Coding Guidelines
- Follow consistent naming conventions
- Add proper documentation for all functions
- Maintain clean code structure
`
    );

    // Create GitHub workflow files
    await fs.writeFile(
      path.join(projectDir, ".github/workflows/frontend-build.yml"),
      `name: Frontend Build

on:
  push:
    branches: [ main, develop ]
    paths: [ 'front/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'front/**' ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: front/package-lock.json
    
    - name: Install dependencies
      run: |
        cd front
        npm ci
    
    - name: Build
      run: |
        cd front
        npm run build
    
    - name: Test
      run: |
        cd front
        npm test
`
    );

    await fs.writeFile(
      path.join(projectDir, ".github/workflows/docs-build.yml"),
      `name: Documentation Build

on:
  push:
    branches: [ main ]
    paths: [ 'docs/**', '*.md' ]
  pull_request:
    branches: [ main ]
    paths: [ 'docs/**', '*.md' ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install documentation dependencies
      run: |
        npm install -g @docusaurus/core @docusaurus/preset-classic
    
    - name: Build documentation
      run: |
        if [ -d "docs" ]; then
          echo "Building documentation..."
          # Add your documentation build commands here
        else
          echo "No docs directory found, skipping documentation build"
        fi
    
    - name: Deploy to GitHub Pages
      if: github.ref == 'refs/heads/main'
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
`
    );

    // Create baseline files
    await fs.writeFile(
      path.join(projectDir, "README.md"),
      `# ${trimmedProjectName}

A quickstart Polkadot project created with quickstart-sdk.

## Project Structure

- \`contracts/develop/\` - Smart contract development files
- \`contracts/deploy/\` - Smart contract deployment scripts  
- \`front/\` - React frontend application with Polkadot integration
- \`cloud-functions/\` - Cloud function implementations

## Frontend Features

The frontend is built with:
- **React** - Modern UI framework
- **Polkadot API (PAPI)** - For blockchain interactions
- **Solidity + Hardhat** - Smart contract development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast development tooling

## Getting Started

1. Navigate to the frontend directory: \`cd ${trimmedProjectName}/front\`
2. Start the development server: \`npm run dev\`
3. Open your browser to the displayed URL

## Development Workflow

### Frontend Development
\`\`\`bash
cd front
npm run dev      # Start development server
npm run build    # Build for production
npm test         # Run tests
\`\`\`

### Smart Contracts
- Development contracts go in \`contracts/develop/\`
- Deployment scripts go in \`contracts/deploy/\`

## Workflows

This project includes GitHub Actions workflows for:
- Frontend build and testing
- Documentation generation and deployment

## Learn More

- [Polkadot Documentation](https://docs.polkadot.network/)
- [create-polkadot-dapp (w3b3d3v fork)](https://github.com/w3b3d3v/create-polkadot-dapp)
- [React Documentation](https://reactjs.org/)
`
    );

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

// Export functions for testing
module.exports = { displayWelcomeArt, setupFrontendWithPolkadotDapp, init };

// Run the CLI if this file is executed directly
if (require.main === module) {
  init();
}
