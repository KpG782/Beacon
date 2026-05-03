// [Harness] Minimal auth helpers — shared between API routes and middleware.
// Design: static token stored in env, no session DB needed.
//   BEACON_PASSWORD     — the password the operator enters on /login
//   BEACON_SESSION_TOKEN — random secret, becomes the session cookie value
//                          generate with: openssl rand -hex 32

export const COOKIE_NAME    = 'beacon-session'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7  // 7 days

/**
 * Validate a Bearer token sent by MCP clients (Claude Desktop, Cursor, etc.).
 * Uses BEACON_MCP_TOKEN if set, otherwise falls back to BEACON_SESSION_TOKEN.
 * Allows external agents to connect without browser cookies.
 */
export function isValidMcpToken(token: string | undefined): boolean {
  if (!token) return false
  const expected = process.env.BEACON_MCP_TOKEN ?? process.env.BEACON_SESSION_TOKEN
  if (!expected) return false
  if (token.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}

/** Returns true if auth is enabled (BEACON_PASSWORD is set in env). */
export function isAuthEnabled(): boolean {
  return !!process.env.BEACON_PASSWORD
}

/**
 * Validate a session cookie value against the expected token.
 * If auth is not configured, always returns true.
 */
export function isValidSession(cookieValue: string | undefined): boolean {
  if (!isAuthEnabled()) return true
  const expected = process.env.BEACON_SESSION_TOKEN
  // If password is set but session token isn't configured, block all access
  // so the operator knows to finish setup
  if (!expected) return false
  if (!cookieValue) return false
  // Constant-time string comparison to prevent timing attacks
  if (cookieValue.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < cookieValue.length; i++) {
    diff |= cookieValue.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}
