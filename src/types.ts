export type TemplateType = "bun" | "pnpm" | "npm";

export type CLIResult = { 
    targetPath: string; 
    template: TemplateType; 
    ideVersion: string | null; 
    initGit: boolean; 
    projectName: string | null; 
};
