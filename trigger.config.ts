import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  id: "bulldozer-search",
  name: "Bulldozer Search",
  apiKey: process.env.TRIGGER_API_KEY!,
  apiUrl: process.env.TRIGGER_API_URL || "https://trigger.henjii.com",
  endpoint: process.env.TRIGGER_ENDPOINT || "https://trigger.henjii.com",
}); 