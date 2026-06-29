"use client";

import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // pas de clé -> no-op silencieux (dev)
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
  initialized = true;
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!initialized) {
    // dev sans clé : log console pour visibilité pendant le dev
    // eslint-disable-next-line no-console
    console.debug("[analytics:dev]", event, properties);
    return;
  }
  posthog.capture(event, properties);
}

export { posthog };
