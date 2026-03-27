import crypto from 'node:crypto'
import { createCloudUser, getCloudUserByEmail, isCloudDatabaseConfigured } from './cloudDatabase.js'
import { readUsers, writeUsers } from './storage.js'

const TOKEN_TTL_SECONDS = Number(process.env.AUTH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30)
const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET ?? 'invest-track-dev-secret'

function normalizeEmail(input) {
  return String(input ?? '').trim().toLowerCase()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = hashPassword(password, salt)
  return { salt, hash }
}

function verifyPassword(password, salt, hash) {
  const computed = hashPassword(password, salt)
  const left = Buffer.from(computed, 'hex')
  const right = Buffer.from(String(hash ?? ''), 'hex')

  if (left.length !== right.length) {
    return false
  }

  return crypto.timingSafeEqual(left, right)
}

function toBase64Url(data) {
  return Buffer.from(data).toString('base64url')
}

function fromBase64Url(data) {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

function sign(payloadEncoded) {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(payloadEncoded).digest('base64url')
}

function createToken(payload) {
  const payloadEncoded = toBase64Url(JSON.stringify(payload))
  const signature = sign(payloadEncoded)
  return `${payloadEncoded}.${signature}`
}

export function verifyToken(tokenInput) {
  const token = String(tokenInput ?? '').trim()

  if (!token.includes('.')) {
    return null
  }

  const [payloadEncoded, signature] = token.split('.')

  if (!payloadEncoded || !signature) {
    return null
  }

  const expectedSignature = sign(payloadEncoded)

  if (signature.length !== expectedSignature.length) {
    return null
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadEncoded))

    if (!payload?.uid || !payload?.email || !Number.isFinite(payload?.exp)) {
      return null
    }

    if (Date.now() >= Number(payload.exp) * 1000) {
      return null
    }

    return {
      userId: String(payload.uid),
      email: String(payload.email),
    }
  } catch {
    return null
  }
}

function buildAuthResponse(user) {
  const expiresAtSeconds = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  const token = createToken({
    uid: user.id,
    email: user.email,
    exp: expiresAtSeconds,
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
    expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
  }
}

export async function registerUser(input) {
  const email = normalizeEmail(input?.email)
  const password = String(input?.password ?? '')

  if (!isValidEmail(email)) {
    throw new Error('Informe um e-mail valido.')
  }

  if (password.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres.')
  }

  const existingCloudUser = isCloudDatabaseConfigured() ? await getCloudUserByEmail(email) : null
  const users = existingCloudUser ? [] : await readUsers()
  const exists = existingCloudUser ? true : users.some((item) => item.email === email)

  if (exists) {
    throw new Error('Ja existe uma conta com esse e-mail.')
  }

  const { salt, hash } = createPasswordHash(password)
  const user = {
    id: crypto.randomUUID(),
    email,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
  }

  if (isCloudDatabaseConfigured()) {
    await createCloudUser(user)
  } else {
    users.push(user)
    await writeUsers(users)
  }

  return buildAuthResponse(user)
}

export async function loginUser(input) {
  const email = normalizeEmail(input?.email)
  const password = String(input?.password ?? '')
  const cloudUser = isCloudDatabaseConfigured() ? await getCloudUserByEmail(email) : null
  const users = cloudUser ? [] : await readUsers()
  const user = cloudUser ?? users.find((item) => item.email === email)

  if (!user) {
    throw new Error('E-mail ou senha invalidos.')
  }

  const valid = verifyPassword(password, user.passwordSalt, user.passwordHash)

  if (!valid) {
    throw new Error('E-mail ou senha invalidos.')
  }

  return buildAuthResponse(user)
}
