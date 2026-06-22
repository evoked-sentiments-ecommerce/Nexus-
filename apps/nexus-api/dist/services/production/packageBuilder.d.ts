export interface AssetReference {
    name: string;
    type: string;
    size: number;
    url?: string;
    data?: Buffer | string;
}
export interface PackageManifest {
    packageId: string;
    assets: Array<{
        name: string;
        type: string;
        size: number;
        url?: string;
    }>;
    totalSize: number;
    createdAt: string;
}
export interface PackageResult {
    packageId: string;
    manifestUrl: string;
    assetCount: number;
    status: "ready" | "pending" | "failed";
    manifest: PackageManifest;
}
export declare function buildPackage(packageId: string, assets: AssetReference[]): Promise<PackageResult>;
export declare function listPackageAssets(packageId: string): PackageManifest | null;
//# sourceMappingURL=packageBuilder.d.ts.map