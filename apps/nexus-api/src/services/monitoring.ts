// ---------------------------------------------------------------------------
// Monitoring Service — Sentry (error tracking) and PostHog (analytics)
// integration layer for the Nexus API.
//
// Environment variables:
//   SENTRY_DSN          — Sentry project DSN (optional; monitoring disabled if absent)
//   POSTHOG_API_KEY     — PostHog project API key (optional)
//   POSTHOG_HOST        — PostHog ingest host (defaults to https://app.posthog.com)
//   NODE_ENV            — Used to set Sentry environment tag
// ---------------------------------------------------------------------------

import { logWarn, logInfo } from "./logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Configuration resolution
// ---------------------------------------------------------------------------

function resolveSentryConfig(): SentryConfig | null {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logWarn("Sentry DSN not configured — error tracking disabled");
    return null;
  }
  return {
    dsn,
    environment: process.env.NODE_ENV ?? "production",
    release: process.env.npm_package_version,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
  };
}

function resolvePostHogConfig(): PostHogConfig | null {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) {
    logWarn("PostHog API key not configured — analytics disabled");
    return null;
  }
  return {
    apiKey,
    host: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
  };
}

export function resolveMonitoringConfig(): MonitoringConfig {
  return {
    sentry: resolveSentryConfig(),
    posthog: resolvePostHogConfig(),
  };
}

// ---------------------------------------------------------------------------
// Sentry integration
// ---------------------------------------------------------------------------

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
export function initSentry(config: SentryConfig): void {
  // Stub — replace with real SDK call once @sentry/node is installed.
  logInfo("Sentry initialised", {
    environment: config.environment,
    release: config.release ?? "unknown",
    tracesSampleRate: config.tracesSampleRate,
  });
  void config;
}

/**
 * Capture an exception in Sentry.
 *
 * Replace the stub body with:
 *   import * as Sentry from "@sentry/node";
 *   Sentry.captureException(error, { extra: context });
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
): void {
  // Stub — replace with real SDK call once @sentry/node is installed.
  void error;
  void context;
}

/**
 * Capture a plain message in Sentry.
 *
 * Replace the stub body with:
 *   import * as Sentry from "@sentry/node";
 *   Sentry.captureMessage(message, level);
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
): void {
  // Stub — replace with real SDK call once @sentry/node is installed.
  void message;
  void level;
}

/**
 * Set Sentry user context (call after authenticating a request).
 *
 * Replace the stub body with:
 *   import * as Sentry from "@sentry/node";
 *   Sentry.setUser(user ? { id: user.id, email: user.email } : null);
 */
export function setSentryUser(user: { id: string; email?: string } | null): void {
  // Stub — replace with real SDK call once @sentry/node is installed.
  void user;
}

// ---------------------------------------------------------------------------
// PostHog integration
// ---------------------------------------------------------------------------

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
export function initPostHog(config: PostHogConfig): void {
  // Stub — replace with real SDK call once posthog-node is installed.
  logInfo("PostHog initialised", { host: config.host });
  void config;
}

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
export function captureEvent(
  distinctId: string,
  event: string,
  properties?: CaptureEventProperties
): void {
  // Stub — replace with real SDK call once posthog-node is installed.
  void distinctId;
  void event;
  void properties;
}

/**
 * Identify a user and set their properties in PostHog.
 *
 * Replace the stub body with:
 *   posthogClient.identify({ distinctId, properties });
 */
export function identifyUser(
  distinctId: string,
  properties: CaptureEventProperties
): void {
  // Stub — replace with real SDK call once posthog-node is installed.
  void distinctId;
  void properties;
}

/**
 * Associate a user with a group (org, team, workspace, etc.) in PostHog.
 *
 * Replace the stub body with:
 *   posthogClient.groupIdentify({ groupType, groupKey, properties });
 */
export function groupIdentify(
  groupType: string,
  groupKey: string,
  properties?: CaptureEventProperties
): void {
  // Stub — replace with real SDK call once posthog-node is installed.
  void groupType;
  void groupKey;
  void properties;
}

// ---------------------------------------------------------------------------
// Bootstrap helper — call at application startup
// ---------------------------------------------------------------------------

/**
 * Initialise all configured monitoring integrations.
 *
 * ```ts
 * // In your Express entry point:
 * import { bootstrapMonitoring } from "./services/monitoring";
 * bootstrapMonitoring();
 * ```
 */
export function bootstrapMonitoring(): MonitoringConfig {
  const config = resolveMonitoringConfig();

  if (config.sentry) {
    initSentry(config.sentry);
  }

  if (config.posthog) {
    initPostHog(config.posthog);
  }

  return config;
}
