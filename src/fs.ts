import { log } from "./utils";
import { cp, mkdir } from "fs/promises";
import { dirname, join, resolve } from "path";
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
export async function copyTemplate(source: string, target: string): Promise<boolean> {
	try {
		const sourceDir = join(__dirname, "../templates", source);
		const targetDir = resolve(target);

		await cp(sourceDir, targetDir, {
			recursive: true,
			force: true,
			errorOnExist: false
		});

		return true;
	} 
	catch (error) {
		log.error(`Failed to copy template: ${error}`);
		return false;
	}
}

/**
 * Create a directory
 * @param dirPath Directory path
 * @returns Promise that resolves when the directory is created
 */
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
