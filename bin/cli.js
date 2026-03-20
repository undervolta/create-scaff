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
  console.log("\x1B[0m");
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
      projectName = await getProjectName();
      if (!projectName)
        return null;
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
    projectName = await getProjectName();
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
  const res = await getInput("Package manager \x1B[90m(bun/pnpm/NPM)\x1B[0m: ") ?? "npm";
  if (!["bun", "pnpm", "npm"].includes(res)) {
    log.error(`Invalid template: \x1B[33m${res}\x1B[0m. Please specify a valid template (\x1B[32mbun\x1B[0m, \x1B[32mpnpm\x1B[0m, or \x1B[32mnpm\x1B[0m). Aborting...`);
    return null;
  }
  return res;
}
async function getProjectName() {
  const res = await getInput("GameMaker project name: ");
  if (!res) {
    log.error("No project name specified. Please specify a valid project name for the new GameMaker project (\x1B[32m-t=<project_name>\x1B[0m). Aborting...");
    return null;
  }
  return res;
}
async function getIDEVersion() {
  const res = await getInput("GameMaker IDE version: ");
  if (!res) {
    log.error("No IDE version specified. Please specify a valid IDE version (\x1B[32m--ide=<version>\x1B[0m). Aborting...");
    return null;
  }
  return res;
}

// src/index.ts
log.info("Initializing ScaffScript project...");
var args = process.argv.slice(2);
var input = await parseArgs(...args);
if (!input)
  process.exit(1);
log.info("ScaffScript project initialized successfully.");
console.log("---");
log.info("You can now use \x1B[32mscaff <command> [args]\x1B[0m. Use \x1B[32mscaff help\x1B[0m for more information.");
console.log(JSON.stringify(input, null, 2));
