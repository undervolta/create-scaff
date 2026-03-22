#!/usr/bin/env node
import { log } from "./utils";
import { parseArgs } from "./args";
import * as fs from "./fs";
import { installDependencies, initializeGit } from "./init";

async function main() {
	log.info("Initializing ScaffScript project...");
	
	const args = process.argv.slice(2);
	const input = await parseArgs(...args);
	
	if (!input)
		return null;
	
	const copied = await fs.copyTemplate(`../templates/${input.template}`, input.targetPath);
	const installed = await installDependencies(input.template, input.targetPath);
	
	if (input.initGit) {
		const initGit = await initializeGit(input.targetPath);
	
		if (!initGit)
			return null;
	}

	if (input.projectName && input.ideVersion) {
		await fs.copyGameMakerProject(input.targetPath, input.projectName, input.ideVersion);
	}
	
	if (!copied || !installed)
		return null;

	return input;
}

const input = await main();

if (!input)
	process.exit(1);

log.info("ScaffScript project initialized successfully.");
log.info(`You can now use \x1b[32m${input.template} run <script> -- <command> [args]\x1b[0m. Use \x1b[32m${input.template} run help\x1b[0m for more information.`);
