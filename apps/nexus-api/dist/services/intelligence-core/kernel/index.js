"use strict";
// ---------------------------------------------------------------------------
// Intelligence Core — Kernel
// Central orchestration layer. Bootstraps all intelligence sub-systems and
// drives the Observe→Remember→Learn→Reason→Predict→Simulate→Plan→Execute→
// Evaluate→Improve→Evolve capability loop.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCapability = registerCapability;
exports.getCapability = getCapability;
exports.registeredCapabilities = registeredCapabilities;
exports.runIntelligenceCycle = runIntelligenceCycle;
const logger_1 = require("../../logger");
// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
const registry = new Map();
function registerCapability(handler) {
    registry.set(handler.name, handler);
    (0, logger_1.logInfo)("intelligence_kernel_capability_registered", { capability: handler.name });
}
function getCapability(name) {
    return registry.get(name);
}
function registeredCapabilities() {
    return Array.from(registry.keys());
}
// ---------------------------------------------------------------------------
// Intelligence cycle
// ---------------------------------------------------------------------------
const CANONICAL_CYCLE = [
    "observe",
    "remember",
    "learn",
    "reason",
    "predict",
    "simulate",
    "plan",
    "execute",
    "evaluate",
    "improve",
    "evolve",
];
/**
 * Run a full or partial intelligence cycle.
 * Each capability receives the shared context enriched with prior outputs.
 * Failures are captured without aborting subsequent capabilities.
 */
async function runIntelligenceCycle(ctx, capabilities = CANONICAL_CYCLE) {
    const start = Date.now();
    const outputs = {};
    const errors = {};
    const capabilitiesRun = [];
    (0, logger_1.logInfo)("intelligence_cycle_started", {
        cycleId: ctx.cycleId,
        objective: ctx.objective,
        capabilities,
    });
    for (const name of capabilities) {
        const handler = registry.get(name);
        if (!handler) {
            (0, logger_1.logInfo)("intelligence_cycle_capability_skipped", { cycleId: ctx.cycleId, capability: name });
            continue;
        }
        try {
            const enrichedCtx = {
                ...ctx,
                inputs: { ...ctx.inputs, ...outputs },
            };
            outputs[name] = await handler.run(enrichedCtx);
            capabilitiesRun.push(name);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            errors[name] = msg;
            (0, logger_1.logError)("intelligence_cycle_capability_error", {
                cycleId: ctx.cycleId,
                capability: name,
                error: msg,
            });
        }
    }
    const result = {
        cycleId: ctx.cycleId,
        capabilitiesRun,
        outputs,
        errors,
        durationMs: Date.now() - start,
    };
    (0, logger_1.logInfo)("intelligence_cycle_completed", {
        cycleId: ctx.cycleId,
        capabilitiesRun,
        errorCount: Object.keys(errors).length,
        durationMs: result.durationMs,
    });
    return result;
}
//# sourceMappingURL=index.js.map