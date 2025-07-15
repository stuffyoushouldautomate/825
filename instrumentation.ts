import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

// Only run instrumentation in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_TELEMETRY === 'true') {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'bulldozer-search',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }),
    traceExporter: new OTLPTraceExporter({
      url: process.env.SIGNOZ_ENDPOINT || 'http://localhost:4318/v1/traces',
      headers: process.env.SIGNOZ_API_KEY ? {
        'api-key': process.env.SIGNOZ_API_KEY,
      } : {},
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Enable all auto-instrumentations
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingPaths: ['/health', '/api/health'],
        },
        '@opentelemetry/instrumentation-express': {
          ignoreLayers: ['/health', '/api/health'],
        },
      }),
    ],
  })

  sdk.start()
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0))
  })
} 