"use strict";
// ---------------------------------------------------------------------------
// Workbook Generator — Excel workbook generation using ExcelJS
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFinancialModel = generateFinancialModel;
exports.generateFoodCostSheet = generateFoodCostSheet;
exports.generateLaborPlanSheet = generateLaborPlanSheet;
exports.generateBudgetTemplate = generateBudgetTemplate;
const logger_1 = require("../logger");
function getExcelJS() {
    try {
        return require("exceljs");
    }
    catch {
        return null;
    }
}
async function createWorkbook() {
    const ExcelJS = getExcelJS();
    if (!ExcelJS) {
        return null;
    }
    return new ExcelJS.Workbook();
}
async function generateFinancialModel(_data) {
    (0, logger_1.logInfo)("financial_model_workbook_generating", {});
    const wb = await createWorkbook();
    if (!wb) {
        return { buffer: Buffer.from("Financial model placeholder"), filename: `financial-model-${Date.now()}.xlsx` };
    }
    const plSheet = wb.addWorksheet("P&L");
    plSheet.addRow(["Month", "Revenue", "COGS", "Gross Profit", "Operating Expenses", "Net Profit"]);
    for (let m = 1; m <= 12; m += 1) {
        plSheet.addRow([`Month ${m}`, 0, 0, 0, 0, 0]);
    }
    const cfSheet = wb.addWorksheet("Cash Flow");
    cfSheet.addRow(["Month", "Operating", "Investing", "Financing", "Net Change"]);
    const buffer = (await wb.xlsx.writeBuffer());
    (0, logger_1.logInfo)("financial_model_workbook_generated", {});
    return { buffer, filename: `financial-model-${Date.now()}.xlsx` };
}
async function generateFoodCostSheet(items) {
    (0, logger_1.logInfo)("food_cost_workbook_generating", { itemCount: items.length });
    const wb = await createWorkbook();
    if (!wb) {
        return { buffer: Buffer.from("Food cost placeholder"), filename: `food-cost-${Date.now()}.xlsx` };
    }
    const sheet = wb.addWorksheet("Food Cost");
    sheet.addRow(["Item", "Selling Price", "Food Cost", "Food Cost %", "Contribution", "Category"]);
    for (const item of items) {
        sheet.addRow([item.name, item.sellingPrice, item.foodCost, `${item.foodCostPct.toFixed(1)}%`, item.contribution, item.menuCategory]);
    }
    const buffer = (await wb.xlsx.writeBuffer());
    (0, logger_1.logInfo)("food_cost_workbook_generated", {});
    return { buffer, filename: `food-cost-${Date.now()}.xlsx` };
}
async function generateLaborPlanSheet(schedule) {
    (0, logger_1.logInfo)("labor_plan_workbook_generating", {});
    const wb = await createWorkbook();
    if (!wb) {
        return { buffer: Buffer.from("Labor plan placeholder"), filename: `labor-plan-${Date.now()}.xlsx` };
    }
    const sheet = wb.addWorksheet("Labor Plan");
    sheet.addRow(["Role", "Hours/Week", "Rate", "Headcount", "Weekly Cost"]);
    for (const row of schedule) {
        sheet.addRow([row["role"], row["hoursPerWeek"], row["hourlyRate"], row["headcount"], 0]);
    }
    const buffer = (await wb.xlsx.writeBuffer());
    return { buffer, filename: `labor-plan-${Date.now()}.xlsx` };
}
async function generateBudgetTemplate(_data) {
    (0, logger_1.logInfo)("budget_template_generating", {});
    const wb = await createWorkbook();
    if (!wb) {
        return { buffer: Buffer.from("Budget template placeholder"), filename: `budget-${Date.now()}.xlsx` };
    }
    const sheet = wb.addWorksheet("Budget");
    sheet.addRow(["Category", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Total"]);
    const categories = ["Revenue", "Food Cost", "Labor Cost", "Rent", "Utilities", "Marketing", "Other Expenses", "Net Profit"];
    for (const cat of categories) {
        sheet.addRow([cat, ...Array(13).fill(0)]);
    }
    const buffer = (await wb.xlsx.writeBuffer());
    return { buffer, filename: `budget-${Date.now()}.xlsx` };
}
//# sourceMappingURL=workbookGenerator.js.map