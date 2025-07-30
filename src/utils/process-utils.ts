import { spawn, SpawnOptions } from "child_process";

/**
 * Result of command execution
 */
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Options for command execution
 */
export interface ExecuteCommandOptions extends SpawnOptions {
  showOutput?: boolean;
}

/**
 * Execute a command and return a promise with the result
 * @param command - The command to execute
 * @param args - Arguments for the command
 * @param options - Options for spawn
 */
export function executeCommand(
  command: string,
  args: string[],
  options: ExecuteCommandOptions = {}
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const defaultOptions: ExecuteCommandOptions = {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
      ...options,
    };

    const process = spawn(command, args, defaultOptions);

    let stdout = "";
    let stderr = "";

    if (process.stdout) {
      process.stdout.on("data", (data: Buffer) => {
        const message = data.toString();
        stdout += message;
        if (options.showOutput !== false) {
          (process.stdout as NodeJS.WriteStream).write(message);
        }
      });
    }

    if (process.stderr) {
      process.stderr.on("data", (data: Buffer) => {
        const message = data.toString();
        stderr += message;
        if (options.showOutput !== false) {
          (process.stderr as NodeJS.WriteStream).write(message);
        }
      });
    }

    process.on("close", (exitCode: number | null) => {
      resolve({ stdout, stderr, exitCode: exitCode || 0 });
    });

    process.on("error", (error: Error) => {
      reject(error);
    });
  });
}

/**
 * Clone a git repository
 * @param repoUrl - Repository URL to clone
 * @param targetDir - Target directory for cloning
 * @param cwd - Working directory
 */
export async function cloneRepository(
  repoUrl: string,
  targetDir: string,
  cwd: string
): Promise<CommandResult> {
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
 * @param cwd - Working directory
 */
export async function installDependencies(cwd: string): Promise<CommandResult> {
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
 * @param cwd - Working directory
 */
export async function buildProject(cwd: string): Promise<CommandResult> {
  console.log("🔨 Building the project...");

  const result = await executeCommand("yarn", ["build"], { cwd });

  if (result.exitCode !== 0) {
    throw new Error(`yarn build failed: ${result.stderr}`);
  }

  console.log("✅ Project built successfully!");
  return result;
}
