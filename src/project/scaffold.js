const path = require("path");
const { ensureDirectories, writeFiles } = require("../utils/file-utils");

/**
 * Create the base project structure
 * @param {string} projectDir - Project directory path
 * @returns {Promise<void>}
 */
async function createProjectStructure(projectDir) {
  const directories = [
    path.join(projectDir, "contracts/develop"),
    path.join(projectDir, "contracts/deploy"),
    path.join(projectDir, "front"),
    path.join(projectDir, "cloud-functions"),
    path.join(projectDir, ".cursor/rules"),
    path.join(projectDir, ".github/workflows"),
  ];

  await ensureDirectories(directories);
}

/**
 * Generate project configuration files
 * @param {string} projectDir - Project directory path
 * @param {string} projectName - Project name
 * @returns {Promise<void>}
 */
async function createProjectFiles(projectDir, projectName) {
  const files = [
    {
      path: path.join(projectDir, ".cursor/rules/project-structure.mdc"),
      content: generateCursorRules(),
    },
    {
      path: path.join(projectDir, ".github/workflows/frontend-build.yml"),
      content: generateFrontendWorkflow(),
    },
    {
      path: path.join(projectDir, ".github/workflows/docs-build.yml"),
      content: generateDocsWorkflow(),
    },
    {
      path: path.join(projectDir, "README.md"),
      content: generateReadme(projectName),
    },
  ];

  await writeFiles(files);
}

/**
 * Generate Cursor IDE rules content
 * @returns {string}
 */
function generateCursorRules() {
  return `# Project Structure Rules

## Directory Structure
- \`contracts/develop/\` - Smart contract development files
- \`contracts/deploy/\` - Smart contract deployment scripts
- \`front/\` - Frontend application code
- \`cloud-functions/\` - Cloud function implementations

## Coding Guidelines
- Follow consistent naming conventions
- Add proper documentation for all functions
- Maintain clean code structure
`;
}

/**
 * Generate frontend build workflow
 * @returns {string}
 */
function generateFrontendWorkflow() {
  return `name: Frontend Build

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
`;
}

/**
 * Generate documentation build workflow
 * @returns {string}
 */
function generateDocsWorkflow() {
  return `name: Documentation Build

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
`;
}

/**
 * Generate README content
 * @param {string} projectName - Project name
 * @returns {string}
 */
function generateReadme(projectName) {
  return `# ${projectName}

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

1. Navigate to the frontend directory: \`cd ${projectName}/front\`
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
`;
}

module.exports = {
  createProjectStructure,
  createProjectFiles,
  generateCursorRules,
  generateFrontendWorkflow,
  generateDocsWorkflow,
  generateReadme,
};
