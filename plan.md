# Quickstarter SDK - Development Plan

## Objective

Create a CLI project starter (`npx quickstart init`) that scaffolds a Web3 monorepo with modular testing (Foundry / Hardhat) and deployment workflows, including front-end, cloud functions, docs and CI/CD ready to ship as an npm global package.

## Milestone Roadmap

| Version | Scope                                          |
| ------- | ---------------------------------------------- |
| v0.1.0  | Initial folder & baseline files                |
| v0.2.0  | Install base dependencies                      |
| v0.3.0  | Foundry w/ UUPS pattern in `contracts/develop` |
| v0.4.0  | Hardhat w/ Asset Hub in `contracts/deploy`     |
| v0.5.0  | create-polkadot-dapp scaffold in `/front`      |
| v0.6.0  | Docs skeleton in `/docs`                       |
| v0.7.0  | GitHub Workflows CI/CD                         |
| v0.8.0  | Setup Cloud Services                           |
| v0.9.0  | `.env`, `.gitignore`, secrets handling         |
| v1.0.0  | Public release & contributing guides           |

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
