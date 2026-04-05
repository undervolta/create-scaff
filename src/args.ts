import type { CLIResult, TemplateType } from "./types";
import { log, getInput } from "./utils";

/**
 * Parse command line arguments
 * @param args Array of command line arguments
 * @returns Whether the arguments are valid
 */
export async function parseArgs(...args: string[]): Promise<CLIResult | null> {
	let targetPath = args[1];

	const options = [...args];
	options.shift();

	let ideVersion = options.find(opt => opt.startsWith("--ide"))?.split("=")[1] ?? null;
	let template: TemplateType | null = options.find(opt => opt.startsWith("--template") || opt.startsWith("-t"))?.split("=")[1] as TemplateType ?? "npm";
	let projectName = options.find(opt => opt.startsWith("--name") || opt.startsWith("-n"))?.split("=")[1] ?? targetPath?.split('/').pop() ?? null;
	let initGit = options.includes("--git");

	// no arguments
	if (!targetPath) {
		targetPath = await getInput("Project name/path: ");
		if (!targetPath) {
			log.error("No project name/path specified. Please specify a valid project name/path. Aborting...");
			return null;
		}

		template = await getTemplate();
		if (!template)
			return null;

		const newProject = await getInput("Create new GameMaker project? \x1b[90m(y/N)\x1b[0m -> ");
		if (newProject.toLowerCase() === "y") {
			const lastName = targetPath.split('/').pop()!;

			projectName = await getProjectName(lastName);

			if (!projectName || (projectName === ""))
				projectName = lastName;

			ideVersion = await getIDEVersion();
			if (!ideVersion)
				return null;
		}

		const git = await getInput("Initialize a new Git repository? \x1b[90m(y/N)\x1b[0m -> ");
		if (git.toLowerCase() === "y")
			initGit = true;
		
		return {
			targetPath,
			ideVersion,
			template,
			initGit,
			projectName
		}
	}

	// no template
	if (!["bun", "pnpm", "npm"].includes(template)) {
		template = await getTemplate();

		if (!template)
			return null;
	}
	
	// no ide version
	if (!ideVersion && (options.includes("--new") || options.includes("-n"))) {
		ideVersion = await getIDEVersion();
		
		if (!ideVersion)
			return null;
	}
	
	// no project name
	if (!projectName && (options.includes("--new") || options.includes("-n"))) {
		projectName = await getProjectName(targetPath.split('/').pop()!);

		if (!projectName)
			return null;
	}

	// remove quotes
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
	const res = (await getInput("Package manager \x1b[90m(bun/pnpm/NPM)\x1b[0m: ")).toLowerCase();
	
	if (!["bun", "pnpm", "npm", ""].includes(res)) {
		log.error(`Invalid template: \x1b[33m${res}\x1b[0m. Please specify a valid template (\x1b[32mbun\x1b[0m, \x1b[32mpnpm\x1b[0m, or \x1b[32mnpm\x1b[0m). Aborting...`);
		return null;
	}

	return res !== "" ? res as TemplateType : "npm";
}

async function getProjectName(defaultName: string) {
	return await getInput(`GameMaker project name \x1b[90m(${defaultName})\x1b[0m: `);
}

async function getIDEVersion() {
	const res = await getInput("GameMaker IDE version: ");

	if (!res) {
		log.error("No IDE version specified. Please specify a valid IDE version (\x1b[32m--ide=<version>\x1b[0m). Aborting...");
		return null;
	}

	return res;
}
