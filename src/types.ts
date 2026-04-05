export const RUNNER_VERSION = "0.1.3";

export type TemplateType = "bun" | "pnpm" | "npm";

export type CLIResult = { 
    targetPath: string; 
    template: TemplateType; 
    ideVersion: string | null; 
    initGit: boolean; 
    projectName: string | null; 
};
