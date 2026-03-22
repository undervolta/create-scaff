import { log } from "./utils";
import spawn from "cross-spawn";
import type { TemplateType } from "./types";

function runSpawn(cmd: string, targetDir: string, args: string | string[]) {
	return new Promise((resolve, reject) => {
		console.log("\x1b[0m");
		
		const child = spawn(cmd, Array.isArray(args) ? args : [args], {
			cwd: targetDir,
			stdio: "inherit"
		});

		child.on("error", reject);
		child.on("close", code => {
			if (code === 0) resolve(true);
			else reject(new Error(`Install failed with exit code ${code}`));
		});
	});
}

/**
 * Install dependencies for a template
 * @param template Template type
 * @param targetDir Target directory
 * @returns Promise that resolves when the dependencies are installed
 */
export async function installDependencies(template: TemplateType, targetDir: string) {
	try {
		await runSpawn(template, targetDir, "install");
		return true;
	} 
	catch (error) {
		log.error(`Failed to install dependencies: ${error}`);
		return false;
	}
}

/**
 * Initialize a new Git repository
 * @param targetDir Target directory
 * @returns Promise that resolves when the repository is initialized
 */
export async function initializeGit(targetDir: string) {
	try {
		await runSpawn("git", targetDir, "init");
		return true;
	} 
	catch (error) {
		log.error(`Failed to initialize Git repository: ${error}`);
		return false;
	}
}
