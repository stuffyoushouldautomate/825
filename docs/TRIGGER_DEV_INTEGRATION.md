# Trigger.dev Integration Guide

This document explains how to use Trigger.dev for background job processing in the Bulldozer Search application.

## Overview

Trigger.dev is a background job processing platform that allows you to:

- Run long-running tasks asynchronously
- Schedule jobs to run at specific times
- Handle webhooks and events
- Monitor job execution and retry failed jobs

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
TRIGGER_API_KEY="your_api_key_here"
TRIGGER_API_URL="https://trigger.henjii.com"
TRIGGER_ENDPOINT="https://trigger.henjii.com"
```

### Project Structure

```
├── trigger.ts              # Trigger.dev client configuration
├── trigger.config.ts       # Trigger.dev project configuration
├── jobs/                   # Job definitions
│   ├── index.ts           # Job registry
│   └── sample-job.ts      # Sample job
└── app/api/trigger/       # API routes for Trigger.dev
    └── route.ts           # Webhook handler
```

## Usage

### Creating Jobs

Jobs are defined in the `jobs/` directory. Here's an example:

```typescript
import { client } from '@/trigger'
import { eventTrigger } from '@trigger.dev/sdk'

export const myJob = client.defineJob({
  id: 'my-job',
  name: 'My Job',
  version: '0.0.1',
  trigger: eventTrigger({
    name: 'my.event'
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info('Job started', { payload })

    // Your job logic here

    return { success: true }
  }
})
```

### Triggering Jobs

You can trigger jobs by sending events:

```typescript
import { client } from '@/trigger'

await client.sendEvent({
  name: 'my.event',
  payload: { data: 'example' }
})
```

### Testing

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Visit the test page: http://localhost:3000/test-trigger

3. Click "Trigger Sample Job" to test the integration

4. Check the Trigger.dev dashboard for job execution logs

## API Routes

### `/api/trigger`

This route handles webhooks and job triggers from Trigger.dev. It's automatically configured when you use the `createAppRoute` helper.

### `/api/test-trigger`

A test endpoint that triggers the sample job. Used for testing the integration.

## Monitoring

- **Trigger.dev Dashboard**: Monitor job execution, logs, and performance
- **Job Logs**: View detailed logs for each job run
- **Retry Logic**: Automatic retry for failed jobs
- **Metrics**: Track job success rates and execution times

## Best Practices

1. **Job Naming**: Use descriptive names for jobs and events
2. **Error Handling**: Always handle errors in your job functions
3. **Logging**: Use `io.logger` for structured logging
4. **Idempotency**: Make jobs idempotent to handle retries safely
5. **Timeouts**: Set appropriate timeouts for long-running jobs

## Troubleshooting

### Common Issues

1. **Job not triggering**: Check that the event name matches between trigger and sender
2. **Authentication errors**: Verify your API key is correct
3. **Network issues**: Ensure your app can reach the Trigger.dev API

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=trigger.dev
```

## Next Steps

1. Create job definitions for your specific use cases
2. Set up scheduled jobs for regular tasks
3. Integrate with external APIs and webhooks
4. Monitor job performance and optimize as needed
