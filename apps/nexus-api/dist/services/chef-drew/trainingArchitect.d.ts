import { HospitalityContext } from "./index";
export interface SOP {
    title: string;
    department: string;
    steps: string[];
    frequency: string;
}
export interface HACCPPlan {
    hazardAnalysis: string[];
    criticalControlPoints: string[];
    monitoring: string[];
    corrective: string[];
}
export interface OnboardingProgram {
    weeks: number;
    checklist: string[];
    learningPath: string[];
}
export interface TrainingPackage {
    sops: SOP[];
    haccpPlan: HACCPPlan;
    onboarding: OnboardingProgram;
    generatedAt: string;
}
export declare function generateSOPs(context: HospitalityContext): Promise<SOP[]>;
export declare function generateHACCPPlan(context: HospitalityContext): Promise<HACCPPlan>;
export declare function generateOnboardingProgram(context: HospitalityContext): Promise<OnboardingProgram>;
export declare function generateTrainingProgram(context: HospitalityContext): Promise<TrainingPackage>;
//# sourceMappingURL=trainingArchitect.d.ts.map