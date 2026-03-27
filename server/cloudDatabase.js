const SUPABASE_URL = String(process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '')
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()
const SUPABASE_USERS_TABLE = String(process.env.SUPABASE_USERS_TABLE ?? 'invest_track_users').trim()
const SUPABASE_CLOUD_TABLE = String(process.env.SUPABASE_CLOUD_TABLE ?? 'invest_track_cloud_data').trim()

export function isCloudDatabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
}

function buildHeaders(preferRepresentation = false, preferMerge = false) {
  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }

  const preferences = []

  if (preferRepresentation) {
    preferences.push('return=representation')
  }

  if (preferMerge) {
    preferences.push('resolution=merge-duplicates')
  }

  if (preferences.length > 0) {
    headers.Prefer = preferences.join(',')
  }

  return headers
}

function getRestUrl(tableName, query = '') {
  return `${SUPABASE_URL}/rest/v1/${tableName}${query}`
}

async function requestSupabase(url, options) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Falha no Supabase: ${response.status} ${text}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export async function getCloudUserByEmail(email) {
  if (!isCloudDatabaseConfigured()) {
    return null
  }

  const query = `?email=eq.${encodeURIComponent(email)}&select=id,email,password_hash,password_salt,created_at&limit=1`
  const rows = await requestSupabase(getRestUrl(SUPABASE_USERS_TABLE, query), {
    method: 'GET',
    headers: buildHeaders(),
  })

  const user = Array.isArray(rows) ? rows[0] : null

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    passwordHash: user.password_hash,
    passwordSalt: user.password_salt,
    createdAt: user.created_at,
  }
}

export async function createCloudUser(user) {
  if (!isCloudDatabaseConfigured()) {
    throw new Error('Banco em nuvem nao configurado.')
  }

  const rows = await requestSupabase(getRestUrl(SUPABASE_USERS_TABLE), {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({
      id: user.id,
      email: user.email,
      password_hash: user.passwordHash,
      password_salt: user.passwordSalt,
      created_at: user.createdAt,
    }),
  })

  const created = Array.isArray(rows) ? rows[0] : rows

  return {
    id: created.id,
    email: created.email,
    passwordHash: created.password_hash,
    passwordSalt: created.password_salt,
    createdAt: created.created_at,
  }
}

export async function getCloudDataByUserId(userId) {
  if (!isCloudDatabaseConfigured()) {
    return null
  }

  const query = `?user_id=eq.${encodeURIComponent(userId)}&select=data,updated_at&limit=1`
  const rows = await requestSupabase(getRestUrl(SUPABASE_CLOUD_TABLE, query), {
    method: 'GET',
    headers: buildHeaders(),
  })

  const item = Array.isArray(rows) ? rows[0] : null

  if (!item) {
    return null
  }

  return {
    data: item.data,
    updatedAt: item.updated_at ?? null,
  }
}

export async function writeCloudDataByUserId(userId, data) {
  if (!isCloudDatabaseConfigured()) {
    throw new Error('Banco em nuvem nao configurado.')
  }

  const rows = await requestSupabase(getRestUrl(SUPABASE_CLOUD_TABLE, '?on_conflict=user_id'), {
    method: 'POST',
    headers: buildHeaders(true, true),
    body: JSON.stringify({
      user_id: userId,
      data,
      updated_at: new Date().toISOString(),
    }),
  })

  const item = Array.isArray(rows) ? rows[0] : rows

  return {
    data: item.data,
    updatedAt: item.updated_at ?? null,
  }
}
