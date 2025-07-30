# Quickstarter SDK - Development Plan

## Objective

Create a CLI project starter (`npx quickstart init`) that scaffolds a Web3 monorepo with modular testing (Foundry / Hardhat) and deployment workflows, including front-end, cloud functions, docs and CI/CD ready to ship as an npm global package.

## Milestone Roadmap

| Version | Scope                                          | Status      |
| ------- | ---------------------------------------------- | ----------- |
| v0.1.0  | Initial folder & baseline files                | ✅ Complete |
| v0.2.0  | Install base dependencies                      | Pending     |
| v0.3.0  | Foundry w/ UUPS pattern in `contracts/develop` | Pending     |
| v0.4.0  | Hardhat w/ Asset Hub in `contracts/deploy`     | Pending     |
| v0.5.0  | create-polkadot-dapp scaffold in `/front`      | ✅ Complete |
| v0.6.0  | Docs skeleton in `/docs`                       | Pending     |
| v0.7.0  | GitHub Workflows CI/CD                         | Pending     |
| v0.8.0  | Setup Cloud Services                           | Pending     |
| v0.9.0  | `.env`, `.gitignore`, secrets handling         | Pending     |
| v1.0.0  | Public release & contributing guides           | Pending     |

## Recent Updates (v0.5.0)

✅ **Frontend Integration Complete**

- Integrated `create-polkadot-dapp` (w3b3d3v fork) with `react-solidity-hardhat` template
- Automatic frontend scaffolding in `/front` directory using GitHub package source
- Uses `--project-name` and `--template` CLI options
- Comprehensive error handling and user feedback
- Updated README with frontend development workflow

### Frontend Features Added

- React frontend with Polkadot API (PAPI) integration
- Solidity smart contract support with Hardhat
- Tailwind CSS for styling
- Vite for fast development
- ReactiveDOT + dotconnect for wallet interactions

### Technical Implementation

- Uses `npx --package=https://github.com/w3b3d3v/create-polkadot-dapp` to ensure w3b3d3v fork usage
- Fallback instructions provide manual setup command if automated setup fails
- Real-time output display during frontend scaffolding process

## High-level Steps

1. CLI Boilerplate in TypeScript with `commander` + `inquirer` + `figlet`.
2. Prompt flow: project name ➔ testing stack (Foundry + Hardhat) ➔ author/social links.
3. Template generator to copy folders/files and interpolate variables.
4. Versioned release branch strategy + semantic versioning.
5. Documentation & examples.

## Risks

- Foundry/Hardhat compatibility nuances.
- Cross-platform shell commands.
- Keeping templates up to date with ecosystem.

- Make it compatible with mac and linux.

## Definition of Done

- `npx quickstarter-sdk@latest init` produces a runnable monorepo.
- All prompts behave as described.
- CI passes and package published to npm.
