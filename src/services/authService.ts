export interface AuthUser {
  id: string
  email: string
}

interface AuthResponse {
  token: string
  user: AuthUser
  expiresAt: string
}

const TOKEN_STORAGE_KEY = 'invest-track.auth-token'

export class AuthService {
  private readonly apiBaseUrl: string

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '')
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  async register(email: string, password: string): Promise<AuthUser> {
    const payload = await this.requestAuth('/api/auth/register', email, password)
    this.storeToken(payload.token)
    return payload.user
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const payload = await this.requestAuth('/api/auth/login', email, password)
    this.storeToken(payload.token)
    return payload.user
  }

  async me(): Promise<AuthUser | null> {
    const token = this.getToken()

    if (!token) {
      return null
    }

    const response = await fetch(`${this.apiBaseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      this.clearToken()
      return null
    }

    if (!response.ok) {
      throw new Error('Nao foi possivel validar sessao.')
    }

    const payload = (await response.json()) as { user: AuthUser }
    return payload.user
  }

  private async requestAuth(path: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const payload = (await response.json()) as AuthResponse | { error?: string }

    if (!response.ok) {
      throw new Error((payload as { error?: string }).error ?? 'Falha de autenticacao.')
    }

    return payload as AuthResponse
  }

  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }
}
