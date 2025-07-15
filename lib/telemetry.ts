import { SpanStatusCode, trace } from '@opentelemetry/api'

export class Telemetry {
  private static tracer = trace.getTracer('bulldozer-search')

  /**
   * Create a custom span for tracking operations
   */
  static async trace<T>(
    name: string,
    operation: () => Promise<T>,
    attributes: Record<string, any> = {}
  ): Promise<T> {
    const span = this.tracer.startSpan(name, {
      attributes: {
        'service.name': 'bulldozer-search',
        ...attributes,
      },
    })

    try {
      const result = await operation()
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      span.recordException(error as Error)
      throw error
    } finally {
      span.end()
    }
  }

  /**
   * Create a span for API calls
   */
  static async traceApiCall<T>(
    endpoint: string,
    operation: () => Promise<T>,
    method: string = 'GET'
  ): Promise<T> {
    return this.trace(`api.${method.toLowerCase()}.${endpoint}`, operation, {
      'http.method': method,
      'http.route': endpoint,
    })
  }

  /**
   * Create a span for database operations
   */
  static async traceDatabase<T>(
    operation: string,
    query: () => Promise<T>,
    table?: string
  ): Promise<T> {
    return this.trace(`db.${operation}`, query, {
      'db.system': 'postgresql',
      'db.table': table,
    })
  }

  /**
   * Create a span for external API calls
   */
  static async traceExternalApi<T>(
    service: string,
    endpoint: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return this.trace(`external.${service}.${endpoint}`, operation, {
      'external.service': service,
      'external.endpoint': endpoint,
    })
  }

  /**
   * Add attributes to the current span
   */
  static addAttributes(attributes: Record<string, any>): void {
    const currentSpan = trace.getActiveSpan()
    if (currentSpan) {
      currentSpan.setAttributes(attributes)
    }
  }

  /**
   * Record an event on the current span
   */
  static recordEvent(name: string, attributes: Record<string, any> = {}): void {
    const currentSpan = trace.getActiveSpan()
    if (currentSpan) {
      currentSpan.addEvent(name, attributes)
    }
  }
} 