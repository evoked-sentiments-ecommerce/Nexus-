import {
  type GeneratePackageInput,
  type GeneratedPackage,
  generateAndStorePackage,
} from "../services/packageGenerator";
import { type Job, type JobHandler, queue } from "../queue/queue";

export type PackageJobPayload = GeneratePackageInput;
export type PackageJobResult = GeneratedPackage;

const packageJobHandler: JobHandler<PackageJobPayload, PackageJobResult> = async (
  job: Job<PackageJobPayload, PackageJobResult>,
): Promise<PackageJobResult> => {
  return generateAndStorePackage(job.payload);
};

queue.register<PackageJobPayload, PackageJobResult>("package", packageJobHandler);

export const enqueuePackageJob = (
  payload: PackageJobPayload,
  options: { maxAttempts?: number } = {},
): Job<PackageJobPayload> => {
  return queue.enqueue<PackageJobPayload>("package", payload, options);
};
