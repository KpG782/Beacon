import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

export interface UserKeys {
  groqApiKey?: string
  serpApiKey?: string
  updatedAt: string
}

// ── Encryption helpers (AES-256-GCM, per-user salt) ──────────────────────────

function getKeySecret(): string {
  const s = process.env.BEACON_SESSION_TOKEN
  if (!s) throw new Error('BEACON_SESSION_TOKEN not set')
  return s
}

function deriveKey(userId: string): Buffer {
  return scryptSync(getKeySecret() + userId, 'beacon-user-keys-v1', 32)
}

function encrypt(plaintext: string, userId: string): string {
  const key = deriveKey(userId)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

function decrypt(ciphertext: string, userId: string): string {
  const key = deriveKey(userId)
  const buf = Buffer.from(ciphertext, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final('utf8')
}

// ── Upstash REST helper ───────────────────────────────────────────────────────

async function upstash(commands: (string | number)[][]): Promise<unknown[]> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return commands.map(() => null)
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`)
  const data = (await res.json()) as Array<{ result: unknown }>
  return data.map((d) => d.result)
}

function userKeysRedisKey(userId: string): string {
  return `beacon:user:${userId}:keys`
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getUserKeys(userId: string): Promise<UserKeys | null> {
  try {
    const [raw] = await upstash([['GET', userKeysRedisKey(userId)]])
    if (!raw || typeof raw !== 'string') return null
    const stored = JSON.parse(raw) as { groq?: string; serp?: string; updatedAt: string }
    return {
      groqApiKey: stored.groq ? decrypt(stored.groq, userId) : undefined,
      serpApiKey: stored.serp ? decrypt(stored.serp, userId) : undefined,
      updatedAt: stored.updatedAt,
    }
  } catch {
    return null
  }
}

export async function saveUserKeys(
  userId: string,
  keys: { groqApiKey?: string; serpApiKey?: string }
): Promise<void> {
  const stored = {
    groq: keys.groqApiKey ? encrypt(keys.groqApiKey, userId) : undefined,
    serp: keys.serpApiKey ? encrypt(keys.serpApiKey, userId) : undefined,
    updatedAt: new Date().toISOString(),
  }
  // 90-day TTL
  await upstash([['SET', userKeysRedisKey(userId), JSON.stringify(stored), 'EX', 60 * 60 * 24 * 90]])
}

export async function deleteUserKeys(userId: string): Promise<void> {
  await upstash([['DEL', userKeysRedisKey(userId)]])
}

// Mask key for display: show only last 4 chars
export function maskKey(key: string): string {
  if (key.length <= 4) return '••••'
  return '•'.repeat(Math.min(key.length - 4, 12)) + key.slice(-4)
}
