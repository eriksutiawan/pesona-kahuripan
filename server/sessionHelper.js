// server/sessionHelper.js — Stateless Session Encryption/Signing Helpers
const crypto = require('crypto');

// Fallback to a fixed secret if none is defined in the environment
const SECRET = process.env.SESSION_SECRET || 'pk-cms-secret-2024-pesona-kahuripan';

/**
 * Signs a session data object using HMAC-SHA256 and returns a base64url-encoded token.
 * @param {Object} data - Session payload
 * @returns {string} Signed token
 */
function signSession(data) {
  const payloadStr = JSON.stringify(data);
  const base64Payload = Buffer.from(payloadStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

/**
 * Verifies a signed session token and returns the parsed payload if valid.
 * @param {string} token - Signed session token
 * @returns {Object|null} Parsed session payload or null if invalid/tampered
 */
function verifySession(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [base64Payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(base64Payload)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      console.warn('⚠️ Session signature verification failed (invalid signature).');
      return null;
    }
    
    const payloadStr = Buffer.from(base64Payload, 'base64url').toString('utf8');
    return JSON.parse(payloadStr);
  } catch (err) {
    console.error('Error verifying session:', err);
    return null;
  }
}

module.exports = {
  signSession,
  verifySession
};
