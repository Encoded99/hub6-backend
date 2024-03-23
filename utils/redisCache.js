import { createClient } from 'redis'

let client

if (process.env.NODE_ENV === 'production') {
  // url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,


  client = createClient({
    url:process.env.REDIS_URL
  })
} else {
  // You should install redis and run the service command ----> redis-server
  client = createClient()
}

client.on('error', (err) => console.log('Redis Client Error', err))

async function connectRedis() {
  await client.connect()
}

connectRedis()

const defaultTTL = 60 * 15 // 60 seconds times 15 -> 15 minutes

const getOrSetCache = (cb) => cb()

export const getCache = (key) =>
  new Promise((resolve, reject) => {
    try {
      getOrSetCache(async () => {
        const data = await client.get(key)
        resolve(JSON.parse(data))
      })
    } catch (error) {
      reject(error)
    }
  })

export const setCache = (key, data, ttl = defaultTTL) =>
  new Promise((resolve, reject) => {
    try {
      getOrSetCache(async () => {
        const isOk = await client.set(key, JSON.stringify(data), {
          EX: ttl,
        })
        resolve('CACHED! ✅')
      })
    } catch (error) {
      reject(error)
    }
  })
