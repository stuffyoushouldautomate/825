import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "bulldozer-search",
  apiKey: process.env.TRIGGER_API_KEY!,
  apiUrl: process.env.TRIGGER_API_URL || "https://trigger.henjii.com",
}); 