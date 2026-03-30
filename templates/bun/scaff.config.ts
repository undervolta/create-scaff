import type { ScaffConfig } from "@scaffscript/types";

export default {
	clearOutputDir: false,
	noIntegration: true,
	production: false,
	source: "./src",
	tabType: "1t",
	targetPlatform: "all",
	useGmAssetPath: true
	// add more as needed
} satisfies Partial<ScaffConfig>;
