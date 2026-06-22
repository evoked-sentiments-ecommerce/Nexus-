"use strict";
// ---------------------------------------------------------------------------
// Kernel — Central orchestration layer for the Nexus Intelligence Core.
//
// The Kernel wires together all intelligence subsystems (memory, planner,
// reasoning, executor, learning, evolution) and exposes a single entry point
// for running an intelligence cycle against a given context.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModule = registerModule;
exports.getModule = getModule;
exports.runCycle = runCycle;
exports.registeredModules = registeredModules;
const logger_1 = require("../logger");
// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
const registry = new Map();
/**
 * Register an intelligence module with the kernel.
 * Later registrations overwrite earlier ones for the same module name.
 */
function registerModule(handler) {
    registry.set(handler.name, handler);
    (0, logger_1.logInfo)("kernel_module_registered", { module: handler.name });
}
/**
 * Return the handler registered for a given module, or undefined.
 */
function getModule(name) {
    return registry.get(name);
}
// ---------------------------------------------------------------------------
// Cycle execution
// ---------------------------------------------------------------------------
/**
 * Run an ordered intelligence cycle.
 *
 * Modules execute sequentially in the order supplied (defaults to the
 * canonical pipeline order).  Each module receives the shared KernelContext;
 * its output is stored in the result bag and can be accessed by subsequent
 * modules via the context meta field if wired accordingly.
 *
 * Failures in one module are captured and logged without aborting the rest of
 * the pipeline.
 */
async function runCycle(ctx, modules = [
    "memory",
    "planner",
    "reasoning",
    "executor",
    "learning",
    "evolution",
]) {
    const start = Date.now();
    const outputs = {};
    const errors = {};
    const modulesRun = [];
    (0, logger_1.logInfo)("kernel_cycle_started", { sessionId: ctx.sessionId, modules });
    for (const name of modules) {
        const handler = registry.get(name);
        if (!handler) {
            (0, logger_1.logInfo)("kernel_module_skipped", { sessionId: ctx.sessionId, module: name, reason: "not_registered" });
            continue;
        }
        try {
            outputs[name] = await handler.run(ctx);
            modulesRun.push(name);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            errors[name] = message;
            (0, logger_1.logError)("kernel_module_error", { sessionId: ctx.sessionId, module: name, error: message });
        }
    }
    const result = {
        sessionId: ctx.sessionId,
        modulesRun,
        durationMs: Date.now() - start,
        outputs,
        errors,
    };
    (0, logger_1.logInfo)("kernel_cycle_completed", {
        sessionId: ctx.sessionId,
        modulesRun,
        durationMs: result.durationMs,
        errorCount: Object.keys(errors).length,
    });
    return result;
}
// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
/**
 * Return the names of all currently registered modules.
 */
function registeredModules() {
    return Array.from(registry.keys());
}
//# sourceMappingURL=index.js.map