import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isAuthEnabled, isValidSession } from '@/lib/auth'

const original = { ...process.env }

afterEach(() => {
  process.env.BEACON_PASSWORD = original.BEACON_PASSWORD
  process.env.BEACON_SESSION_TOKEN = original.BEACON_SESSION_TOKEN
})

describe('isAuthEnabled', () => {
  it('returns false when BEACON_PASSWORD is not set', () => {
    delete process.env.BEACON_PASSWORD
    expect(isAuthEnabled()).toBe(false)
  })

  it('returns true when BEACON_PASSWORD is set', () => {
    process.env.BEACON_PASSWORD = 'secret'
    expect(isAuthEnabled()).toBe(true)
  })
})

describe('isValidSession', () => {
  it('returns true for any value when auth is disabled', () => {
    delete process.env.BEACON_PASSWORD
    delete process.env.BEACON_SESSION_TOKEN
    expect(isValidSession('anything')).toBe(true)
    expect(isValidSession(undefined)).toBe(true)
  })

  it('returns false when token is not configured but password is', () => {
    process.env.BEACON_PASSWORD = 'secret'
    delete process.env.BEACON_SESSION_TOKEN
    expect(isValidSession('anything')).toBe(false)
  })

  it('returns false for missing cookie', () => {
    process.env.BEACON_PASSWORD = 'secret'
    process.env.BEACON_SESSION_TOKEN = 'tok'
    expect(isValidSession(undefined)).toBe(false)
  })

  it('validates correct token', () => {
    process.env.BEACON_PASSWORD = 'secret'
    process.env.BEACON_SESSION_TOKEN = 'valid-token'
    expect(isValidSession('valid-token')).toBe(true)
  })

  it('rejects wrong token', () => {
    process.env.BEACON_PASSWORD = 'secret'
    process.env.BEACON_SESSION_TOKEN = 'valid-token'
    expect(isValidSession('wrong-token')).toBe(false)
  })

  it('rejects token with different length (avoids timing shortcut)', () => {
    process.env.BEACON_PASSWORD = 'secret'
    process.env.BEACON_SESSION_TOKEN = 'valid-token'
    expect(isValidSession('short')).toBe(false)
    expect(isValidSession('valid-token-but-longer')).toBe(false)
  })
})
