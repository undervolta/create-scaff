#!/usr/bin/env node
import { log } from "./utils";
import { parseArgs } from "./args";
import { readFile, writeFile } from "node:fs/promises";
import * as fs from "./fs";
import { installDependencies, initializeGit, getLatestVersion } from "./init";

const COMPILER_VERSION = "0.1.3";

async function main() {
	log.info("Initializing ScaffScript project...");

	const args = process.argv.slice(2);
	const input = await parseArgs(...args);
	
	if (!input)
		process.exit(1);
	
	const copied = await fs.copyTemplate(`../templates/${input.template}`, input.targetPath);

	const latestVersion = await getLatestVersion();
	const pkg = (await readFile(`${input.targetPath}/package.json`, "utf8"))
		.replace("{LATEST_VERSION}", latestVersion)
		.replace("{COMPILER_VERSION}", COMPILER_VERSION);
	await writeFile(`${input.targetPath}/package.json`, pkg);

	const installed = await installDependencies(input.template, input.targetPath);
	
	if (input.initGit) {
		const initGit = await initializeGit(input.targetPath);
	
		if (!initGit)
			process.exit(1);
	}

	if (input.projectName && input.ideVersion) {
		await fs.copyGameMakerProject(input.targetPath, input.projectName, input.ideVersion);
	}
	
	if (!copied || !installed)
		process.exit(1);

	console.log("");
	log.info("ScaffScript project initialized successfully.");
	log.info(`You can now use \x1b[32m${input.template} run <script> -- <command> [args]\x1b[0m. Use \x1b[32m${input.template} run help\x1b[0m for more information.`);
}

await main();
