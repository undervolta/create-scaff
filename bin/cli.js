#!/usr/bin/env node
import { createRequire } from "node:module";
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// src/utils.ts
var log = {
  debug: (msg) => console.log("\x1B[90m[DEBUG]\x1B[0m ", msg),
  info: (msg) => console.log("\x1B[36m[INFO]\x1B[0m  ", msg),
  warn: (msg) => console.log("\x1B[33m[WARN]\x1B[0m  ", msg),
  error: (msg) => console.log("\x1B[31m[ERROR]\x1B[0m ", msg)
};
var readline = await import("readline/promises");
async function getInput(message) {
  const { stdin, stdout } = await import("process");
  const rl = readline.createInterface({
    input: stdin,
    output: stdout
  });
  const answer = await rl.question(`\x1B[35m[INPUT]\x1B[0m  ${message}\x1B[34m`);
  rl.close();
  return answer.trim();
}

// src/args.ts
async function parseArgs(...args) {
  let targetPath = args[1];
  const options = [...args];
  options.shift();
  let ideVersion = options.find((opt) => opt.startsWith("--ide"))?.split("=")[1] ?? null;
  let template = options.find((opt) => opt.startsWith("--template") || opt.startsWith("-t"))?.split("=")[1] ?? "npm";
  let projectName = options.find((opt) => opt.startsWith("--name") || opt.startsWith("-n"))?.split("=")[1] ?? targetPath?.split("/").pop() ?? null;
  let initGit = options.includes("--git");
  if (!targetPath) {
    targetPath = await getInput("Project name/path: ");
    if (!targetPath) {
      log.error("No project name/path specified. Please specify a valid project name/path. Aborting...");
      return null;
    }
    template = await getTemplate();
    if (!template)
      return null;
    const newProject = await getInput("Create new GameMaker project? \x1B[90m(y/N)\x1B[0m -> ");
    if (newProject.toLowerCase() === "y") {
      const lastName = targetPath.split("/").pop();
      projectName = await getProjectName(lastName);
      if (!projectName || projectName === "")
        projectName = lastName;
      ideVersion = await getIDEVersion();
      if (!ideVersion)
        return null;
    }
    const git = await getInput("Initialize a new Git repository? \x1B[90m(y/N)\x1B[0m -> ");
    if (git.toLowerCase() === "y")
      initGit = true;
    return {
      targetPath,
      ideVersion,
      template,
      initGit,
      projectName
    };
  }
  if (!["bun", "pnpm", "npm"].includes(template)) {
    template = await getTemplate();
    if (!template)
      return null;
  }
  if (!ideVersion && (options.includes("--new") || options.includes("-n"))) {
    ideVersion = await getIDEVersion();
    if (!ideVersion)
      return null;
  }
  if (!projectName && (options.includes("--new") || options.includes("-n"))) {
    projectName = await getProjectName(targetPath.split("/").pop());
    if (!projectName)
      return null;
  }
  if (targetPath && targetPath.startsWith('"') && targetPath.endsWith('"'))
    targetPath = targetPath.slice(1, -1);
  if (projectName && projectName.startsWith('"') && projectName.endsWith('"'))
    projectName = projectName.slice(1, -1);
  return {
    targetPath,
    ideVersion,
    template,
    initGit,
    projectName
  };
}
async function getTemplate() {
  const res = (await getInput("Package manager \x1B[90m(bun/pnpm/NPM)\x1B[0m: ")).toLowerCase();
  if (!["bun", "pnpm", "npm", ""].includes(res)) {
    log.error(`Invalid template: \x1B[33m${res}\x1B[0m. Please specify a valid template (\x1B[32mbun\x1B[0m, \x1B[32mpnpm\x1B[0m, or \x1B[32mnpm\x1B[0m). Aborting...`);
    return null;
  }
  return res !== "" ? res : "npm";
}
async function getProjectName(defaultName) {
  return await getInput(`GameMaker project name \x1B[90m(${defaultName})\x1B[0m: `);
}
async function getIDEVersion() {
  const res = await getInput("GameMaker IDE version: ");
  if (!res) {
    log.error("No IDE version specified. Please specify a valid IDE version (\x1B[32m--ide=<version>\x1B[0m). Aborting...");
    return null;
  }
  return res;
}

// src/fs.ts
import { cp, mkdir, access, rename, readFile, writeFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
var __filename2 = fileURLToPath(import.meta.url);
var __dirname2 = dirname(__filename2);
async function fileExists(path) {
  return access(path).then(() => true).catch(() => false);
}
async function copyTemplate(source, target) {
  try {
    const sourceDir = join(__dirname2, "../templates", source);
    const targetDir = resolve(target);
    await cp(sourceDir, targetDir, {
      recursive: true,
      force: true,
      errorOnExist: false
    });
    const gitIgnorePath = join(__dirname2, "../templates/.gitignore");
    if (!await fileExists(join(targetDir, ".gitignore")))
      await cp(gitIgnorePath, join(targetDir, ".gitignore"));
    else {
      log.warn(`\x1B[34m.gitignore\x1B[0m file already exists in the target directory. Please add \x1B[32mnode_modules\x1B[0m and \x1B[32m.out\x1B[0m to the existing \x1B[34m.gitignore\x1B[0m file.`);
    }
    return true;
  } catch (error) {
    log.error(`Failed to copy template: ${error}`);
    return false;
  }
}
async function copyGameMakerProject(target, projectName, ideVersion) {
  try {
    const sourceDir = join(__dirname2, "../templates", "gamemaker");
    const targetDir = resolve(target);
    await cp(sourceDir, targetDir, {
      recursive: true,
      force: true,
      errorOnExist: false
    });
    await rename(`${targetDir}/BLANK.yyp`, `${targetDir}/${projectName}.yyp`);
    await rename(`${targetDir}/BLANK.resource_order`, `${targetDir}/${projectName}.resource_order`);
    const yypContent = await readFile(`${targetDir}/${projectName}.yyp`, "utf8");
    const newYypContent = yypContent.replace(/{PROJECT_NAME}/g, projectName).replace(/{IDE_VERSION}/g, ideVersion);
    await writeFile(`${targetDir}/${projectName}.yyp`, newYypContent);
    const room1Content = await readFile(`${targetDir}/rooms/Room1/Room1.yy`, "utf8");
    const newRoom1Content = room1Content.replace(/{PROJECT_NAME}/g, projectName);
    await writeFile(`${targetDir}/rooms/Room1/Room1.yy`, newRoom1Content);
    return true;
  } catch (error) {
    log.error(`Failed to copy GameMaker project: ${error}`);
    return false;
  }
}

// src/init.ts
import { spawn } from "child_process";
async function installDependencies(template, targetDir) {
  try {
    spawn(template, ["install"], {
      cwd: targetDir,
      stdio: "inherit",
      shell: true
    });
    return true;
  } catch (error) {
    log.error(`Failed to install dependencies: ${error}`);
    return false;
  }
}
async function initializeGit(targetDir) {
  try {
    spawn("git", ["init"], {
      cwd: targetDir,
      stdio: "inherit",
      shell: true
    });
    return true;
  } catch (error) {
    log.error(`Failed to initialize Git repository: ${error}`);
    return false;
  }
}

// src/index.ts
async function main() {
  log.info("Initializing ScaffScript project...");
  const args = process.argv.slice(2);
  const input = await parseArgs(...args);
  if (!input)
    process.exit(1);
  const copied = await copyTemplate(`../templates/${input.template}`, input.targetPath);
  const installed = await installDependencies(input.template, input.targetPath);
  if (input.initGit) {
    const initGit = await initializeGit(input.targetPath);
    if (!initGit)
      process.exit(1);
  }
  if (input.projectName && input.ideVersion) {
    await copyGameMakerProject(input.targetPath, input.projectName, input.ideVersion);
  }
  if (!copied || !installed)
    process.exit(1);
  log.info("ScaffScript project initialized successfully.");
  log.info(`You can now use \x1B[32m${input.template} run <script> -- <command> [args]\x1B[0m. Use \x1B[32m${input.template} run help\x1B[0m for more information.`);
}
main();
