import { client } from "@/trigger";
import { eventTrigger } from "@trigger.dev/sdk";

// Sample job that runs when triggered
export const sampleJob = client.defineJob({
  id: "sample-job",
  name: "Sample Job",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "sample.event",
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info("Sample job started", { payload });
    
    // Simulate some work
    await io.sleep("wait-1-second", 1000);
    
    await io.logger.info("Sample job completed");
    
    return {
      message: "Job completed successfully",
      timestamp: new Date().toISOString(),
    };
  },
}); 