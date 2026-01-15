import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

/**
 * Get encryption key from environment variable.
 * The key must be 32 bytes (256 bits) for AES-256.
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required. Generate with: openssl rand -hex 32'
    )
  }

  // If the key is provided as hex string (64 chars = 32 bytes)
  if (key.length === 64) {
    return Buffer.from(key, 'hex')
  }

  // If provided as base64 (44 chars = 32 bytes)
  if (key.length === 44) {
    return Buffer.from(key, 'base64')
  }

  throw new Error(
    'ENCRYPTION_KEY must be 32 bytes. Provide as 64-char hex string or 44-char base64 string.'
  )
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a base64-encoded string containing: IV + encrypted data + auth tag
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8')
  encrypted = Buffer.concat([encrypted, cipher.final()])

  const authTag = cipher.getAuthTag()

  // Combine IV + encrypted data + auth tag
  const combined = Buffer.concat([iv, encrypted, authTag])

  return combined.toString('base64')
}

/**
 * Decrypt a base64-encoded encrypted string.
 * Expects format: IV (16 bytes) + encrypted data + auth tag (16 bytes)
 */
export function decrypt(encryptedBase64: string): string {
  const key = getEncryptionKey()
  const combined = Buffer.from(encryptedBase64, 'base64')

  // Extract IV, encrypted data, and auth tag
  const iv = combined.subarray(0, IV_LENGTH)
  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH)
  const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString('utf8')
}

/**
 * Check if a string looks like it was encrypted with the old base64-only method.
 * Old format: just base64-encoded plaintext (starts with "sk-")
 * New format: base64-encoded binary data (IV + ciphertext + auth tag)
 */
export function isLegacyEncryption(encryptedBase64: string): boolean {
  try {
    const decoded = Buffer.from(encryptedBase64, 'base64').toString('utf8')
    // Old method just base64-encoded the API key directly
    // API keys start with "sk-" for OpenAI or "sk-ant-" for Anthropic
    return decoded.startsWith('sk-')
  } catch {
    return false
  }
}

/**
 * Decrypt an API key, handling both legacy and new encryption formats.
 */
export function decryptApiKey(encryptedBase64: string): string {
  // Check if this is legacy (just base64-encoded)
  if (isLegacyEncryption(encryptedBase64)) {
    // Return the base64-decoded key directly (legacy format)
    return Buffer.from(encryptedBase64, 'base64').toString('utf8')
  }

  // Otherwise, use proper decryption
  return decrypt(encryptedBase64)
}
