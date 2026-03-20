import { log } from "./utils";
import { cp, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//const templateDir = path.join(__dirname, "../templates/basic");

/**
 * Copy a template to a target directory
 * @param sourceDir Source directory
 * @param targetDir Target directory
 * @returns Promise that resolves when the template is copied
 */
export async function copyTemplate(sourceDir: string, targetDir: string): Promise<boolean> {
	try {
		await cp(sourceDir, targetDir, {
			recursive: true,
			force: true,
			errorOnExist: false
		});

		return true;
	} catch (error) {
		log.error(`Failed to copy template: ${error}`);
		return false;
	}
}

export async function createDir(dirPath: string) {
	const createDir = join(__dirname, "../", dirPath);

	try {
		await mkdir(createDir, { recursive: true });
	} catch (error) {
		log.error(`Failed to create directory: ${error}`);
		return false;
	}

	return true;
}
