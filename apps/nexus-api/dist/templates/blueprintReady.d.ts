export interface BlueprintReadyData {
    customerName: string;
    blueprintTitle: string;
    blueprintId: string;
    conceptType: string;
    cuisineType?: string;
    createdAt: Date;
    viewUrl: string;
    downloadUrl?: string;
}
export declare function blueprintReadySubject(data: BlueprintReadyData): string;
export declare function blueprintReadyHtml(data: BlueprintReadyData): string;
export declare function blueprintReadyText(data: BlueprintReadyData): string;
//# sourceMappingURL=blueprintReady.d.ts.map