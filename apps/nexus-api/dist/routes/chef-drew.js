"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailService_1 = require("../services/emailService");
const router = (0, express_1.Router)();
/**
 * POST /api/chef-drew/blueprints/:id/ready
 * Triggered by the Chef Drew Engine when a hospitality blueprint is complete.
 * Sends a blueprint ready notification email to the requesting user.
 */
router.post("/blueprints/:id/ready", async (req, res) => {
    try {
        const { id } = req.params;
        const { customerEmail, customerName, blueprintTitle, conceptType, cuisineType, viewUrl, downloadUrl, } = req.body;
        await (0, emailService_1.sendBlueprintReadyNotification)(customerEmail, {
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});
exports.default = router;
//# sourceMappingURL=chef-drew.js.map