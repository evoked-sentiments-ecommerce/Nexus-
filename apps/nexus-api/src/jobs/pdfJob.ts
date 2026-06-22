import {
  type GeneratePDFInput,
  type GeneratedPDFAsset,
  generateAndStorePDF,
} from "../services/pdfGenerator";
import { type Job, type JobHandler, queue } from "../queue/queue";

export type PDFJobPayload = GeneratePDFInput;
export type PDFJobResult = GeneratedPDFAsset;

const pdfJobHandler: JobHandler<PDFJobPayload, PDFJobResult> = async (
  job: Job<PDFJobPayload, PDFJobResult>,
): Promise<PDFJobResult> => {
  return generateAndStorePDF(job.payload);
};

queue.register<PDFJobPayload, PDFJobResult>("pdf", pdfJobHandler);

export const enqueuePDFJob = (
  payload: PDFJobPayload,
  options: { maxAttempts?: number } = {},
): Job<PDFJobPayload> => {
  return queue.enqueue<PDFJobPayload>("pdf", payload, options);
};
