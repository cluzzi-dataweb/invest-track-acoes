import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getCloudDataByUserId, isCloudDatabaseConfigured, writeCloudDataByUserId } from './cloudDatabase.js'

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data')
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json')
const CLOUD_DIR = path.join(DATA_DIR, 'cloud')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const USERS_CLOUD_DIR = path.join(DATA_DIR, 'users-cloud')
const LEGACY_USERS_CLOUD_DIR = path.join(DATA_DIR, 'users-cloud-legacy')

const EMPTY_PORTFOLIO = { holdings: [] }
const EMPTY_APP_DATA = {
  favorites: [],
  trades: [],
  buyIntents: [],
  buyAlerts: [],
  sellAlerts: [],
}

async function ensurePortfolioFile() {
  await fs.mkdir(DATA_DIR, { recursive: true })

  try {
    await fs.access(PORTFOLIO_FILE)
  } catch {
    await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(EMPTY_PORTFOLIO, null, 2), 'utf-8')
  }
}

export async function readPortfolio() {
  await ensurePortfolioFile()
  const raw = await fs.readFile(PORTFOLIO_FILE, 'utf-8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed.holdings)) {
    return { ...EMPTY_PORTFOLIO }
  }

  return parsed
}

export async function writePortfolio(portfolio) {
  await ensurePortfolioFile()
  await fs.writeFile(PORTFOLIO_FILE, JSON.stringify(portfolio, null, 2), 'utf-8')
}

function sanitizeProfileId(input) {
  const value = String(input ?? '').trim()

  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(value)) {
    return null
  }

  return value
}

async function ensureCloudDir() {
  await fs.mkdir(CLOUD_DIR, { recursive: true })
}

async function ensureUsersFile() {
  await fs.mkdir(DATA_DIR, { recursive: true })

  try {
    await fs.access(USERS_FILE)
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2), 'utf-8')
  }
}

async function ensureUsersCloudDir() {
  await fs.mkdir(USERS_CLOUD_DIR, { recursive: true })
}

async function ensureLegacyUsersCloudDir() {
  await fs.mkdir(LEGACY_USERS_CLOUD_DIR, { recursive: true })
}

function getProfilePath(profileId) {
  return path.join(CLOUD_DIR, `${profileId}.json`)
}

function getUserCloudPath(userId) {
  return path.join(USERS_CLOUD_DIR, `${userId}.json`)
}

function getLegacyUserCloudPath(userId) {
  return path.join(LEGACY_USERS_CLOUD_DIR, `${userId}.json`)
}

function normalizeAppData(raw) {
  return {
    favorites: Array.isArray(raw?.favorites) ? raw.favorites : [],
    trades: Array.isArray(raw?.trades) ? raw.trades : [],
    buyIntents: Array.isArray(raw?.buyIntents) ? raw.buyIntents : [],
    buyAlerts: Array.isArray(raw?.buyAlerts) ? raw.buyAlerts : [],
    sellAlerts: Array.isArray(raw?.sellAlerts) ? raw.sellAlerts : [],
  }
}

export async function readCloudProfile(profileIdInput) {
  const profileId = sanitizeProfileId(profileIdInput)

  if (!profileId) {
    return null
  }

  await ensureCloudDir()
  const profilePath = getProfilePath(profileId)

  try {
    const raw = await fs.readFile(profilePath, 'utf-8')
    const parsed = JSON.parse(raw)

    return {
      profileId,
      data: normalizeAppData(parsed?.data ?? EMPTY_APP_DATA),
      updatedAt: parsed?.updatedAt ?? null,
    }
  } catch {
    return null
  }
}

export async function writeCloudProfile(profileIdInput, dataInput) {
  const profileId = sanitizeProfileId(profileIdInput)

  if (!profileId) {
    throw new Error('Identificador de perfil invalido.')
  }

  await ensureCloudDir()
  const payload = {
    profileId,
    data: normalizeAppData(dataInput),
    updatedAt: new Date().toISOString(),
  }

  await fs.writeFile(getProfilePath(profileId), JSON.stringify(payload, null, 2), 'utf-8')
  return payload
}

export async function readUsers() {
  await ensureUsersFile()
  const raw = await fs.readFile(USERS_FILE, 'utf-8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed.users)) {
    return []
  }

  return parsed.users
}

export async function writeUsers(users) {
  await ensureUsersFile()
  await fs.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf-8')
}

export async function readUserCloudData(userIdInput) {
  const userId = String(userIdInput ?? '').trim()

  if (!userId) {
    return null
  }

  if (isCloudDatabaseConfigured()) {
    const remote = await getCloudDataByUserId(userId)

    if (!remote) {
      return null
    }

    return {
      data: normalizeAppData(remote.data ?? EMPTY_APP_DATA),
      updatedAt: remote.updatedAt ?? null,
    }
  }

  await ensureUsersCloudDir()

  try {
    const raw = await fs.readFile(getUserCloudPath(userId), 'utf-8')
    const parsed = JSON.parse(raw)

    return {
      data: normalizeAppData(parsed?.data ?? EMPTY_APP_DATA),
      updatedAt: parsed?.updatedAt ?? null,
    }
  } catch {
    return null
  }
}

export async function writeUserCloudData(userIdInput, dataInput) {
  const userId = String(userIdInput ?? '').trim()

  if (!userId) {
    throw new Error('Usuario invalido para armazenamento em nuvem.')
  }

  if (isCloudDatabaseConfigured()) {
    const remote = await writeCloudDataByUserId(userId, normalizeAppData(dataInput))

    return {
      userId,
      data: normalizeAppData(remote.data ?? EMPTY_APP_DATA),
      updatedAt: remote.updatedAt ?? null,
    }
  }

  await ensureUsersCloudDir()

  const payload = {
    userId,
    data: normalizeAppData(dataInput),
    updatedAt: new Date().toISOString(),
  }

  await fs.writeFile(getUserCloudPath(userId), JSON.stringify(payload, null, 2), 'utf-8')
  return payload
}

export async function readLegacyUserCloudData(userIdInput) {
  const userId = String(userIdInput ?? '').trim()

  if (!userId) {
    return null
  }

  if (isCloudDatabaseConfigured()) {
    const remote = await getCloudDataByUserId(`legacy:${userId}`)

    if (!remote) {
      return null
    }

    return {
      data: remote.data ?? {},
      updatedAt: remote.updatedAt ?? null,
    }
  }

  await ensureLegacyUsersCloudDir()

  try {
    const raw = await fs.readFile(getLegacyUserCloudPath(userId), 'utf-8')
    const parsed = JSON.parse(raw)

    return {
      data: parsed?.data ?? {},
      updatedAt: parsed?.updatedAt ?? null,
    }
  } catch {
    return null
  }
}

export async function writeLegacyUserCloudData(userIdInput, dataInput) {
  const userId = String(userIdInput ?? '').trim()

  if (!userId) {
    throw new Error('Usuario invalido para armazenamento legado em nuvem.')
  }

  if (isCloudDatabaseConfigured()) {
    const remote = await writeCloudDataByUserId(`legacy:${userId}`, dataInput ?? {})

    return {
      userId,
      data: remote.data ?? {},
      updatedAt: remote.updatedAt ?? null,
    }
  }

  await ensureLegacyUsersCloudDir()

  const payload = {
    userId,
    data: dataInput ?? {},
    updatedAt: new Date().toISOString(),
  }

  await fs.writeFile(getLegacyUserCloudPath(userId), JSON.stringify(payload, null, 2), 'utf-8')
  return payload
}
