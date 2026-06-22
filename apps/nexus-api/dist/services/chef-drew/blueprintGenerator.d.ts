import { HospitalityContext, HospitalityBlueprint } from "./index";
export interface BlueprintGenerationResult {
    blueprint: HospitalityBlueprint;
    pdfResult: {
        url: string;
        key: string;
        size: number;
        generatedAt: Date;
    } | null;
}
export declare function generateBlueprint(context: HospitalityContext, sessionId?: string): Promise<BlueprintGenerationResult>;
//# sourceMappingURL=blueprintGenerator.d.ts.map