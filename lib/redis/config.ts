import { Redis as UpstashRedis } from '@upstash/redis'
import Redis from 'ioredis'

export type RedisConfig = {
  useLocalRedis: boolean
  upstashRedisRestUrl?: string
  upstashRedisRestToken?: string
  localRedisUrl?: string
}

export function getRedisConfig(): RedisConfig {
  // Railway-specific Redis configuration
  const railwayRedisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL

  // Check for Railway Redis first
  if (railwayRedisUrl) {
    return {
      useLocalRedis: true,
      localRedisUrl: railwayRedisUrl
    }
  }

  // Check for Upstash Redis
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return {
      useLocalRedis: false,
      upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
      upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN
    }
  }

  // Fallback to local Redis
  const useLocalRedis = process.env.USE_LOCAL_REDIS !== 'false'
  const localRedisUrl = process.env.LOCAL_REDIS_URL || 'redis://localhost:6379'

  return {
    useLocalRedis,
    localRedisUrl
  }
}

export class RedisWrapper {
  private client: Redis | UpstashRedis

  constructor(client: Redis | UpstashRedis) {
    this.client = client
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    options?: { rev: boolean }
  ): Promise<string[]> {
    if (this.client instanceof Redis) {
      if (options?.rev) {
        return this.client.zrevrange(key, start, stop)
      } else {
        return this.client.zrange(key, start, stop)
      }
    } else {
      // Upstash Redis implementation
      const result = (await this.client.zrange(key, start, stop)) as string[]
      return options?.rev ? result.reverse() : result
    }
  }

  async hgetall<T extends Record<string, unknown>>(
    key: string
  ): Promise<T | null> {
    if (this.client instanceof Redis) {
      const result = await this.client.hgetall(key)
      return result as T
    } else {
      // Upstash Redis implementation
      const result = await this.client.hgetall(key)
      return result as T
    }
  }

  pipeline() {
    if (this.client instanceof Redis) {
      return new LocalPipelineWrapper(this.client.multi())
    } else {
      // Upstash Redis doesn't support pipeline, return a mock
      return new UpstashPipelineWrapper(this.client as UpstashRedis)
    }
  }

  async hmset(key: string, value: Record<string, any>): Promise<'OK' | number> {
    if (this.client instanceof Redis) {
      return this.client.hmset(key, value)
    } else {
      // Upstash Redis implementation
      await this.client.hset(key, value)
      return 'OK'
    }
  }

  async zadd(
    key: string,
    score: number,
    member: string
  ): Promise<number | null> {
    if (this.client instanceof Redis) {
      return this.client.zadd(key, score, member)
    } else {
      // Upstash Redis implementation
      return this.client.zadd(key, { score, member })
    }
  }

  async del(key: string): Promise<number> {
    if (this.client instanceof Redis) {
      return this.client.del(key)
    } else {
      // Upstash Redis implementation
      return this.client.del(key)
    }
  }

  async zrem(key: string, member: string): Promise<number> {
    if (this.client instanceof Redis) {
      return this.client.zrem(key, member)
    } else {
      // Upstash Redis implementation
      return this.client.zrem(key, member)
    }
  }

  async close(): Promise<void> {
    if (this.client instanceof Redis) {
      await this.client.quit()
    }
    // Upstash Redis doesn't need explicit closing
  }
}

// Mock pipeline for Upstash Redis
class UpstashPipelineWrapper {
  private client: UpstashRedis

  constructor(client: UpstashRedis) {
    this.client = client
  }

  hgetall(key: string) {
    return this.client.hgetall(key)
  }

  del(key: string) {
    return this.client.del(key)
  }

  zrem(key: string, member: string) {
    return this.client.zrem(key, member)
  }

  hmset(key: string, value: Record<string, any>) {
    return this.client.hset(key, value)
  }

  zadd(key: string, score: number, member: string) {
    return this.client.zadd(key, { score, member })
  }

  async exec() {
    // Upstash Redis doesn't support pipelining, so we return a mock result
    return [['OK', null]]
  }
}

// Local Redis pipeline wrapper
class LocalPipelineWrapper {
  private pipeline: ReturnType<Redis['multi']>

  constructor(pipeline: ReturnType<Redis['multi']>) {
    this.pipeline = pipeline
  }

  hgetall(key: string) {
    return this.pipeline.hgetall(key)
  }

  del(key: string) {
    return this.pipeline.del(key)
  }

  zrem(key: string, member: string) {
    return this.pipeline.zrem(key, member)
  }

  hmset(key: string, value: Record<string, any>) {
    return this.pipeline.hmset(key, value)
  }

  zadd(key: string, score: number, member: string) {
    return this.pipeline.zadd(key, score, member)
  }

  async exec() {
    return this.pipeline.exec()
  }
}

export async function getRedisClient(): Promise<RedisWrapper> {
  const config = getRedisConfig()

  if (config.useLocalRedis) {
    // Use local Redis (including Railway Redis)
    const redisUrl = config.localRedisUrl || 'redis://localhost:6379'

    // Parse Redis URL for Railway compatibility
    const url = new URL(redisUrl)
    const redis = new Redis({
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      username: url.username || undefined,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      // Railway-specific optimizations
      family: 4, // Force IPv4 for Railway
      enableReadyCheck: true
    })

    // Handle connection events
    redis.on('error', err => {
      console.error('Redis connection error:', err)
    })

    redis.on('connect', () => {
      console.log('Connected to Redis')
    })

    redis.on('ready', () => {
      console.log('Redis is ready')
    })

    return new RedisWrapper(redis)
  } else {
    // Use Upstash Redis
    if (!config.upstashRedisRestUrl || !config.upstashRedisRestToken) {
      throw new Error('Upstash Redis configuration is incomplete')
    }

    const upstashRedis = new UpstashRedis({
      url: config.upstashRedisRestUrl,
      token: config.upstashRedisRestToken
    })

    return new RedisWrapper(upstashRedis)
  }
}

export async function closeRedisConnection(): Promise<void> {
  // This function is called when the application shuts down
  // Railway will handle the cleanup automatically
  console.log('Closing Redis connection...')
}
