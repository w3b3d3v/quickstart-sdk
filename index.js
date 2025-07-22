#!/usr/bin/env node

const { input } = require("@inquirer/prompts");
const fs = require("fs-extra");
const path = require("path");
const figlet = require("figlet");

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

A quickstart project created with quickstart-sdk.

## Project Structure

- \`contracts/develop/\` - Smart contract development files
- \`contracts/deploy/\` - Smart contract deployment scripts
- \`front/\` - Frontend application code
- \`cloud-functions/\` - Cloud function implementations

## Getting Started

1. Navigate to the project directory: \`cd ${trimmedProjectName}\`
2. Set up your development environment
3. Start building your application!

## Workflows

This project includes GitHub Actions workflows for:
- Frontend build and testing
- Documentation generation and deployment
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
  } catch (error) {
    console.error("Error creating project:", error.message);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = { displayWelcomeArt, init };

// Run the CLI if this file is executed directly
if (require.main === module) {
  init();
}
