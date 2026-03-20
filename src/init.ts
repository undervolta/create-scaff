import { log } from "./utils";
import { spawn } from "child_process";
import type { TemplateType } from "./types";

/**
 * Install dependencies for a template
 * @param template Template type
 * @returns Promise that resolves when the dependencies are installed
 */
export function installDependencies(template: TemplateType) {
	try {
		switch (template) {
			case "bun":
				spawn("bun", ["install"], {
					stdio: "inherit"
				});
			break;

			case "pnpm":
				spawn("pnpm", ["install"], {
					stdio: "inherit"
				});
			break;

			case "npm":
				spawn("npm", ["install"], {
					stdio: "inherit"
				});
			break;
		}

		return true;
	} catch (error) {
		log.error(`Failed to install dependencies: ${error}`);
		return false;
	}
}
