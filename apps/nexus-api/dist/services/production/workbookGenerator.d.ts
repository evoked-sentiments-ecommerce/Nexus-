import { MenuItem } from "../chef-drew";
export interface WorkbookResult {
    buffer: Buffer;
    filename: string;
}
export declare function generateFinancialModel(_data: Record<string, unknown>): Promise<WorkbookResult>;
export declare function generateFoodCostSheet(items: MenuItem[]): Promise<WorkbookResult>;
export declare function generateLaborPlanSheet(schedule: Record<string, unknown>[]): Promise<WorkbookResult>;
export declare function generateBudgetTemplate(_data: Record<string, unknown>): Promise<WorkbookResult>;
//# sourceMappingURL=workbookGenerator.d.ts.map