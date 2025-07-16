import { client } from "@/trigger";
import { createAppRoute } from "@trigger.dev/nextjs";

// Create the app route handler
export const { POST } = createAppRoute(client); 