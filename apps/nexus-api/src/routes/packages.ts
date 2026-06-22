import { Router, Request, Response } from "express";
import { sendPackageDownloadNotification } from "../services/emailService";

const router = Router();

/**
 * POST /api/packages/:id/ready
 * Triggered by the Package Engine when a package has finished generating.
 * Sends a download notification email to the requesting user.
 */
router.post("/:id/ready", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      customerEmail,
      customerName,
      packageName,
      packageType,
      assetCount,
      fileSize,
      downloadUrl,
      expiresAt,
    } = req.body;

    await sendPackageDownloadNotification(customerEmail, {
      customerName,
      packageName,
      packageId: id,
      packageType,
      assetCount,
      fileSize,
      generatedAt: new Date(),
      downloadUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
