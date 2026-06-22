import { Router, Request, Response } from "express";
import { sendBlueprintReadyNotification } from "../services/emailService";

const router = Router();

/**
 * POST /api/chef-drew/blueprints/:id/ready
 * Triggered by the Chef Drew Engine when a hospitality blueprint is complete.
 * Sends a blueprint ready notification email to the requesting user.
 */
router.post("/blueprints/:id/ready", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      customerEmail,
      customerName,
      blueprintTitle,
      conceptType,
      cuisineType,
      viewUrl,
      downloadUrl,
    } = req.body;

    await sendBlueprintReadyNotification(customerEmail, {
      customerName,
      blueprintTitle,
      blueprintId: id,
      conceptType,
      cuisineType,
      createdAt: new Date(),
      viewUrl,
      downloadUrl,
    });

    res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
