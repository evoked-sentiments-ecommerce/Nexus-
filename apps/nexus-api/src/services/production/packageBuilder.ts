// ---------------------------------------------------------------------------
// Package Builder — assembles multiple assets into a delivery package
// ---------------------------------------------------------------------------

import { logInfo, logError } from "../logger";

export interface AssetReference {
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: Buffer | string;
}

export interface PackageManifest {
  packageId: string;
  assets: Array<{ name: string; type: string; size: number; url?: string }>;
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

const packageStore = new Map<string, PackageManifest>();

export async function buildPackage(packageId: string, assets: AssetReference[]): Promise<PackageResult> {
  logInfo("package_build_started", { packageId, assetCount: assets.length });

  try {
    const manifest: PackageManifest = {
      packageId,
      assets: assets.map((a) => ({ name: a.name, type: a.type, size: a.size, url: a.url })),
      totalSize: assets.reduce((s, a) => s + a.size, 0),
      createdAt: new Date().toISOString(),
    };

    packageStore.set(packageId, manifest);

    const manifestUrl = `${process.env.R2_PUBLIC_URL ?? "https://storage.nexus.app"}/packages/${packageId}/manifest.json`;

    logInfo("package_built", { packageId, assetCount: assets.length });
    return { packageId, manifestUrl, assetCount: assets.length, status: "ready", manifest };
  } catch (err) {
    logError("package_build_error", { packageId, message: err instanceof Error ? err.message : String(err) });
    return {
      packageId,
      manifestUrl: "",
      assetCount: 0,
      status: "failed",
      manifest: { packageId, assets: [], totalSize: 0, createdAt: new Date().toISOString() },
    };
  }
}

export function listPackageAssets(packageId: string): PackageManifest | null {
  return packageStore.get(packageId) ?? null;
}
