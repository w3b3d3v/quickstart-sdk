# Quickstart SDK

A CLI tool to quickly scaffold full-stack Polkadot dApps with modern tooling and best practices.

## ✨ Features

- 🚀 **Quick Setup**: Create a complete Polkadot project in seconds
- ⚡ **Modern Stack**: React + TypeScript + Vite + Tailwind CSS
- 🏗️ **Smart Contracts**: Solidity + Hardhat development environment
- 🎨 **Beautiful UI**: Pre-configured with modern design components
- 🧪 **Testing Ready**: Jest testing setup included
- 📦 **CI/CD**: GitHub Actions workflows pre-configured
- 🎯 **TypeScript**: Full type safety throughout the project

### Usage

1. Run the command and follow the interactive prompts:

```bash
npx quickstart-sdk
```

2. Enter your project name when prompted

3. The CLI will automatically:

   - Create the project structure
   - Set up the frontend with create-polkadot-dapp
   - Install dependencies
   - Configure development tools

4. Navigate to your project and start developing:

```bash
cd your-project-name/front
npm run dev
```

## 📁 Generated Project Structure

```
your-project/
├── contracts/
│   ├── develop/        # Smart contract development
│   └── deploy/         # Deployment scripts
├── front/              # React frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── types.ts    # TypeScript definitions
│   │   └── wagmi-config.ts # Blockchain configuration
│   ├── package.json
│   └── vite.config.ts
├── cloud-functions/    # Serverless functions
├── .cursor/           # Cursor IDE configuration
├── .github/           # CI/CD workflows
│   └── workflows/
│       ├── frontend-build.yml
│       └── docs-build.yml
└── README.md          # Project documentation
```

## 🛠️ Frontend Stack

The generated frontend includes:

- **[React 18](https://reactjs.org/)** - Modern UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Fast build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Polkadot API (PAPI)](https://papi.how/)** - Blockchain interactions
- **[Solidity](https://soliditylang.org/)** - Smart contract language
- **[Hardhat](https://hardhat.org/)** - Ethereum development environment

## 📋 Requirements

- **Node.js** >= 20.0.0
- **npm** >= 8.0.0 or **yarn** >= 1.22.0
- **Git** (for cloning dependencies)

### Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run build`         | Compile TypeScript to JavaScript         |
| `npm run dev`           | Run CLI in development mode with ts-node |
| `npm test`              | Run the test suite                       |
| `npm run test:watch`    | Run tests in watch mode                  |
| `npm run test:coverage` | Run tests with coverage report           |
| `npm start`             | Run the compiled CLI                     |

### Project Architecture

The SDK is built with TypeScript and follows a modular architecture:

```
src/
├── cli.ts              # Main CLI orchestration
├── index.ts            # Entry point and exports
├── utils/
│   ├── ascii-art.ts    # Welcome banner display
│   ├── file-utils.ts   # File system operations
│   └── process-utils.ts # Process spawning utilities
├── frontend/
│   └── setup.ts        # Frontend initialization logic
└── project/
    └── scaffold.ts     # Project structure creation
```

#### Key Modules

- **CLI Module** (`src/cli.ts`): Orchestrates the entire project creation flow
- **Frontend Setup** (`src/frontend/setup.ts`): Handles cloning and configuring create-polkadot-dapp
- **File Utils** (`src/utils/file-utils.ts`): Provides utilities for file operations
- **Process Utils** (`src/utils/process-utils.ts`): Manages external command execution
- **Project Scaffold** (`src/project/scaffold.ts`): Creates base project structure and configuration files

## 🧪 Testing

The project includes comprehensive tests covering:

- ✅ **Unit Tests**: Individual module functionality
- ✅ **Integration Tests**: End-to-end workflow testing
- ✅ **Error Handling**: Failure scenarios and recovery
- ✅ **File Operations**: Directory creation and cleanup
- ✅ **Process Management**: External command execution

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `npm test`
5. **Build the project**: `npm run build`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines

- ✅ Write TypeScript with proper type annotations
- ✅ Add tests for new functionality
- ✅ Follow existing code style and patterns
- ✅ Update documentation as needed
- ✅ Ensure all tests pass before submitting
