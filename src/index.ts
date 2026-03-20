#!/usr/bin/env node
import { log } from "./utils";
import { parseArgs } from "./args";
import * as fs from "./fs";

log.info("Initializing ScaffScript project...");

const args = process.argv.slice(2);
const input = await parseArgs(...args);

if (!input) 
	process.exit(1);

const created = await fs.createDir(input.targetPath);

log.info("ScaffScript project initialized successfully.");
log.info("You can now use \x1b[32mscaff <command> [args]\x1b[0m. Use \x1b[32mscaff help\x1b[0m for more information.");

console.log(JSON.stringify(input, null, 2));
