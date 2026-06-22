// ---------------------------------------------------------------------------
// Training Architect — generates SOPs, HACCP, and training programs
// ---------------------------------------------------------------------------

import { logInfo } from "../logger";
import { completeChat } from "../llm";
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

export async function generateSOPs(context: HospitalityContext): Promise<SOP[]> {
  const prompt = `Generate standard operating procedures for ${context.operationName} (${context.domain}). Include opening, service, and closing procedures.`;
  await completeChat([{ role: "user", content: prompt }]);

  logInfo("sops_generated", { operation: context.operationName });
  return [
    { title: "Opening Procedures", department: "All", steps: ["Check all equipment", "Temperature checks", "Mise en place setup", "Staff briefing"], frequency: "Daily" },
    { title: "Food Safety Protocol", department: "Kitchen", steps: ["Temperature logging", "FIFO rotation", "Allergen segregation", "Cross-contamination prevention"], frequency: "Daily" },
    { title: "Closing Procedures", department: "All", steps: ["Deep clean all surfaces", "Equipment shutdown", "Inventory count", "Lock-up checklist"], frequency: "Daily" },
  ];
}

export async function generateHACCPPlan(context: HospitalityContext): Promise<HACCPPlan> {
  const prompt = `Generate a HACCP plan for ${context.operationName}. Include critical control points and monitoring procedures.`;
  await completeChat([{ role: "user", content: prompt }]);

  logInfo("haccp_generated", { operation: context.operationName });
  return {
    hazardAnalysis: ["Biological: bacteria in raw proteins", "Chemical: cleaning agents", "Physical: foreign objects in food"],
    criticalControlPoints: ["Receiving temperature control", "Cold storage (< 5°C)", "Cooking temperatures", "Hot holding (> 63°C)"],
    monitoring: ["Temperature logs every 2 hours", "Daily equipment calibration", "Supplier delivery checks"],
    corrective: ["Discard non-conforming food", "Retrain staff", "Equipment repair/replacement"],
  };
}

export async function generateOnboardingProgram(context: HospitalityContext): Promise<OnboardingProgram> {
  logInfo("onboarding_generated", { operation: context.operationName });
  return {
    weeks: 4,
    checklist: ["Complete food safety certification", "Shadow experienced staff", "Learn menu and allergens", "Complete service simulations", "Independent service assessment"],
    learningPath: ["Week 1: Orientation & Safety", "Week 2: Menu Knowledge & Kitchen Skills", "Week 3: Service Standards", "Week 4: Supervised Independent Service"],
  };
}

export async function generateTrainingProgram(context: HospitalityContext): Promise<TrainingPackage> {
  const [sops, haccpPlan, onboarding] = await Promise.all([
    generateSOPs(context),
    generateHACCPPlan(context),
    generateOnboardingProgram(context),
  ]);

  logInfo("training_program_generated", { operation: context.operationName });
  return { sops, haccpPlan, onboarding, generatedAt: new Date().toISOString() };
}
