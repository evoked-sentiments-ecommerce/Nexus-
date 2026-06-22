export interface SentryConfig {
    dsn: string;
    environment: string;
    release?: string;
    tracesSampleRate?: number;
}
export interface PostHogConfig {
    apiKey: string;
    host: string;
}
export interface MonitoringConfig {
    sentry: SentryConfig | null;
    posthog: PostHogConfig | null;
}
export interface CaptureEventProperties {
    [key: string]: unknown;
}
export declare function resolveMonitoringConfig(): MonitoringConfig;
/**
 * Initialise Sentry SDK.
 *
 * Call once at application startup (e.g. in your Express entry point) before
 * registering any routes or middleware.
 *
 * Install the SDK first:
 *   npm install @sentry/node @sentry/tracing
 *
 * Then replace the stub body with:
 *   import * as Sentry from "@sentry/node";
 *   Sentry.init({ dsn: config.dsn, environment: config.environment, ... });
 */
export declare function initSentry(config: SentryConfig): void;
/**
 * Capture an exception in Sentry.
 *
 * Replace the stub body with:
 *   import * as Sentry from "@sentry/node";
 *   Sentry.captureException(error, { extra: context });
 */
export declare function captureException(error: Error, context?: Record<string, unknown>): void;
/**
 * Capture a plain message in Sentry.
 *
 * Replace the stub body with:
 *   import * as Sentry from "@sentry/node";
 *   Sentry.captureMessage(message, level);
 */
export declare function captureMessage(message: string, level?: "fatal" | "error" | "warning" | "info" | "debug"): void;
/**
 * Set Sentry user context (call after authenticating a request).
 *
 * Replace the stub body with:
 *   import * as Sentry from "@sentry/node";
 *   Sentry.setUser(user ? { id: user.id, email: user.email } : null);
 */
export declare function setSentryUser(user: {
    id: string;
    email?: string;
} | null): void;
/**
 * Initialise PostHog SDK.
 *
 * Call once at application startup.
 *
 * Install the SDK first:
 *   npm install posthog-node
 *
 * Then replace the stub body with:
 *   import { PostHog } from "posthog-node";
 *   const client = new PostHog(config.apiKey, { host: config.host });
 *   export { client as posthogClient };
 */
export declare function initPostHog(config: PostHogConfig): void;
/**
 * Capture an analytics event in PostHog.
 *
 * @param distinctId  Unique identifier for the user/session.
 * @param event       Event name (snake_case convention recommended).
 * @param properties  Key-value pairs attached to the event.
 *
 * Replace the stub body with:
 *   posthogClient.capture({ distinctId, event, properties });
 */
export declare function captureEvent(distinctId: string, event: string, properties?: CaptureEventProperties): void;
/**
 * Identify a user and set their properties in PostHog.
 *
 * Replace the stub body with:
 *   posthogClient.identify({ distinctId, properties });
 */
export declare function identifyUser(distinctId: string, properties: CaptureEventProperties): void;
/**
 * Associate a user with a group (org, team, workspace, etc.) in PostHog.
 *
 * Replace the stub body with:
 *   posthogClient.groupIdentify({ groupType, groupKey, properties });
 */
export declare function groupIdentify(groupType: string, groupKey: string, properties?: CaptureEventProperties): void;
/**
 * Initialise all configured monitoring integrations.
 *
 * ```ts
 * // In your Express entry point:
 * import { bootstrapMonitoring } from "./services/monitoring";
 * bootstrapMonitoring();
 * ```
 */
export declare function bootstrapMonitoring(): MonitoringConfig;
//# sourceMappingURL=monitoring.d.ts.map