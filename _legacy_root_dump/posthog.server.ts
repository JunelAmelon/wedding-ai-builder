import { PostHog } from "posthog-node";

let serverClient: PostHog | null = null;

function getServerClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!serverClient) {
    serverClient = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return serverClient;
}

export function trackServer(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const client = getServerClient();
  if (!client) {
    // eslint-disable-next-line no-console
    console.debug("[analytics:server:dev]", event, distinctId, properties);
    return;
  }
  client.capture({ distinctId, event, properties });
}
