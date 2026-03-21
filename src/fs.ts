import { log } from "./utils";
import { cp, mkdir, access, rename, readFile, writeFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


/**
 * Check if the file exists
 * @param path Path to the file
 * @returns Whether the file exists
 */
export async function fileExists(path: string): Promise<boolean> {
	return access(path).then(() => true).catch(() => false);
}

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

		const gitIgnorePath = join(__dirname, "../templates/.gitignore");
		
		if (!(await fileExists(join(targetDir, ".gitignore"))))
			await cp(gitIgnorePath, join(targetDir, ".gitignore"));
		else {
			log.warn(`\x1b[34m.gitignore\x1b[0m file already exists in the target directory. Please add \x1b[32mnode_modules\x1b[0m and \x1b[32m.out\x1b[0m to the existing \x1b[34m.gitignore\x1b[0m file.`);
		}

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
	} 
	catch (error) {
		log.error(`Failed to create directory: ${error}`);
		return false;
	}

	return true;
}

export async function copyGameMakerProject(target: string, projectName: string, ideVersion: string): Promise<boolean> {
	try {
		const sourceDir = join(__dirname, "../templates", "gamemaker");
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
	}
	catch (error) {
		log.error(`Failed to copy GameMaker project: ${error}`);
		return false;
	}
}
