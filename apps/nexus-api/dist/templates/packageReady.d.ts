export interface PackageReadyData {
    customerName: string;
    packageName: string;
    packageId: string;
    packageType: string;
    assetCount: number;
    fileSize?: string;
    generatedAt: Date;
    downloadUrl: string;
    expiresAt?: Date;
}
export declare function packageReadySubject(data: PackageReadyData): string;
export declare function packageReadyHtml(data: PackageReadyData): string;
export declare function packageReadyText(data: PackageReadyData): string;
//# sourceMappingURL=packageReady.d.ts.map