import { MenuItem, Menu, MenuEngineeringAnalysis, HospitalityContext } from "./index";
export interface MenuEngineeringResult {
    analysis: MenuEngineeringAnalysis;
    classifiedItems: MenuItem[];
}
export declare function engineerMenu(context: HospitalityContext, items: MenuItem[]): MenuEngineeringResult;
export declare function generateMenuStructure(context: HospitalityContext): Promise<Partial<Menu>>;
//# sourceMappingURL=menuEngineer.d.ts.map