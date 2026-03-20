export const log = {
	/**
	 * Debug log
	 * @param msg Message to log
	 */
	debug: (msg: string) => console.log('\x1b[90m[DEBUG]\x1b[0m ', msg),

	/**
	 * Info log
	 * @param msg Message to log
	 */
	info: (msg: string) => console.log('\x1b[36m[INFO]\x1b[0m  ', msg),
	
	/**
	 * Warning log
	 * @param msg Message to log
	 */
	warn: (msg: string) => console.log('\x1b[33m[WARN]\x1b[0m  ', msg),

	/**
	 * Error log
	 * @param msg Message to log
	 */
	error: (msg: string) => console.log('\x1b[31m[ERROR]\x1b[0m ', msg)
};

const readline = await import("readline/promises");

/**
 * Get user input
 * @param message Message to display
 * @returns User input
 */
export async function getInput(message: string) {
	const { stdin, stdout } = await import("process");

	const rl = readline.createInterface({
		input: stdin,
		output: stdout
	});

	const answer = await rl.question(`\x1b[35m[INPUT]\x1b[0m  ${message}\x1b[34m`);
	rl.close();

	return answer.trim();
}
