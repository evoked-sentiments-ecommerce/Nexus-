"use strict";
// ---------------------------------------------------------------------------
// Package Builder — assembles multiple assets into a delivery package
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPackage = buildPackage;
exports.listPackageAssets = listPackageAssets;
const logger_1 = require("../logger");
const packageStore = new Map();
async function buildPackage(packageId, assets) {
    (0, logger_1.logInfo)("package_build_started", { packageId, assetCount: assets.length });
    try {
        const manifest = {
            packageId,
            assets: assets.map((a) => ({ name: a.name, type: a.type, size: a.size, url: a.url })),
            totalSize: assets.reduce((s, a) => s + a.size, 0),
            createdAt: new Date().toISOString(),
        };
        packageStore.set(packageId, manifest);
        const manifestUrl = `${process.env.R2_PUBLIC_URL ?? "https://storage.nexus.app"}/packages/${packageId}/manifest.json`;
        (0, logger_1.logInfo)("package_built", { packageId, assetCount: assets.length });
        return { packageId, manifestUrl, assetCount: assets.length, status: "ready", manifest };
    }
    catch (err) {
        (0, logger_1.logError)("package_build_error", { packageId, message: err instanceof Error ? err.message : String(err) });
        return {
            packageId,
            manifestUrl: "",
            assetCount: 0,
            status: "failed",
            manifest: { packageId, assets: [], totalSize: 0, createdAt: new Date().toISOString() },
        };
    }
}
function listPackageAssets(packageId) {
    return packageStore.get(packageId) ?? null;
}
//# sourceMappingURL=packageBuilder.js.map