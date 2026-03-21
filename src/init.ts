import { log } from "./utils";
import { spawn } from "child_process";
import type { TemplateType } from "./types";

/**
 * Install dependencies for a template
 * @param template Template type
 * @param targetDir Target directory
 * @returns Promise that resolves when the dependencies are installed
 */
export async function installDependencies(template: TemplateType, targetDir: string) {
	try {
		spawn(template, ["install"], {
			cwd: targetDir,
			stdio: "inherit",
			shell: true
		});

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
		spawn("git", ["init"], {
			cwd: targetDir,
			stdio: "inherit",
			shell: true
		});

		return true;
	} 
	catch (error) {
		log.error(`Failed to initialize Git repository: ${error}`);
		return false;
	}
}
