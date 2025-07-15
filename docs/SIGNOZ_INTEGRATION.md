# SigNoz Integration Guide

This document explains how to use SigNoz for monitoring the Bulldozer Search application.

## Overview

SigNoz is an open-source APM (Application Performance Monitoring) tool that provides:
- Distributed tracing
- Performance monitoring
- Error tracking
- Service dependency mapping
- Custom metrics and dashboards

## Local Development Setup

### 1. Start SigNoz Locally

```bash
# Start SigNoz using Docker Compose
./scripts/start-signoz.sh

# Or manually:
docker-compose -f docker-compose.signoz.yml up -d
```

### 2. Enable Telemetry in Development

Add to your `.env.local`:

```bash
ENABLE_TELEMETRY=true
SIGNOZ_ENDPOINT=http://localhost:4318/v1/traces
```

### 3. Access SigNoz UI

- **SigNoz Dashboard**: http://localhost:3301
- **Jaeger UI**: http://localhost:16686

## Production Setup

### 1. SigNoz Cloud (Recommended)

1. Sign up at [SigNoz Cloud](https://signoz.io/)
2. Get your endpoint URL and API key
3. Set environment variables:

```bash
SIGNOZ_ENDPOINT=https://your-instance.signoz.cloud:4318/v1/traces
SIGNOZ_API_KEY=your-api-key
ENABLE_TELEMETRY=true
```

### 2. Self-Hosted SigNoz

1. Deploy SigNoz to your infrastructure
2. Set environment variables:

```bash
SIGNOZ_ENDPOINT=https://your-signoz-instance.com:4318/v1/traces
SIGNOZ_API_KEY=your-api-key
ENABLE_TELEMETRY=true
```

## What's Monitored

### Automatic Instrumentation

- **HTTP Requests**: All API calls and page requests
- **Database Queries**: Supabase/PostgreSQL operations
- **External API Calls**: OpenAI, Tavily, Google APIs
- **Performance Metrics**: Response times, throughput, error rates

### Custom Instrumentation

- **Company Data Fetching**: Tracked in `lib/actions/companies.ts`
- **User Authentication**: Login/logout events
- **Search Operations**: Query performance and results
- **Report Generation**: Company report creation and processing

## Using the Telemetry Utility

### Basic Tracing

```typescript
import { Telemetry } from '@/lib/telemetry'

// Trace a database operation
const companies = await Telemetry.traceDatabase(
  'select',
  () => supabase.from('companies').select('*'),
  'companies'
)

// Trace an API call
const response = await Telemetry.traceApiCall(
  '/api/companies',
  () => fetch('/api/companies'),
  'GET'
)

// Trace an external service call
const result = await Telemetry.traceExternalApi(
  'openai',
  '/v1/chat/completions',
  () => openai.chat.completions.create(payload)
)
```

### Adding Attributes

```typescript
// Add context to current span
Telemetry.addAttributes({
  'user.id': userId,
  'operation.type': 'search',
  'query.terms': searchTerms,
})

// Record events
Telemetry.recordEvent('user.login', {
  'user.id': userId,
  'auth.provider': 'google',
})
```

## Key Metrics to Monitor

### Performance
- **Response Time**: P95, P99 latency for API endpoints
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests

### Business Metrics
- **User Engagement**: Active users, session duration
- **Search Performance**: Query response times, result quality
- **Report Generation**: Success rate, processing time

### Infrastructure
- **Database Performance**: Query execution time, connection pool
- **External API Health**: OpenAI, Tavily, Google API response times
- **Resource Usage**: CPU, memory, disk I/O

## Troubleshooting

### Telemetry Not Working

1. Check environment variables:
   ```bash
   echo $ENABLE_TELEMETRY
   echo $SIGNOZ_ENDPOINT
   ```

2. Verify SigNoz is running:
   ```bash
   curl http://localhost:3301
   ```

3. Check application logs for telemetry errors

### High Latency

1. Check database query performance
2. Monitor external API response times
3. Review service dependencies in SigNoz UI

### Missing Traces

1. Ensure `ENABLE_TELEMETRY=true`
2. Check network connectivity to SigNoz endpoint
3. Verify API key is correct (if using SigNoz Cloud)

## Best Practices

1. **Use Meaningful Span Names**: `api.get.companies` instead of `api.call`
2. **Add Relevant Attributes**: Include user context, operation type, etc.
3. **Handle Errors Gracefully**: Always set span status on errors
4. **Avoid Over-Instrumentation**: Focus on business-critical operations
5. **Monitor Resource Usage**: Telemetry adds overhead, monitor impact

## Railway Deployment

The Dockerfile includes SigNoz environment variables. For Railway deployment:

1. Set environment variables in Railway dashboard
2. Update `SIGNOZ_ENDPOINT` to your production SigNoz instance
3. Add `SIGNOZ_API_KEY` if using SigNoz Cloud

## Support

- [SigNoz Documentation](https://signoz.io/docs/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation) 