import type { AppData } from '../types.ts'

export interface CloudProfileData {
  data: AppData
  updatedAt: string | null
}

export interface CloudSyncOptions {
  apiBaseUrl: string
}

export class CloudSyncService {
  private readonly apiBaseUrl: string

  constructor(options: CloudSyncOptions) {
    this.apiBaseUrl = options.apiBaseUrl.replace(/\/$/, '')
  }

  async load(token: string): Promise<CloudProfileData | null> {
    const response = await fetch(`${this.apiBaseUrl}/api/cloud/data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 404) {
      return null
    }

    if (response.status === 401) {
      throw new Error('Sessao expirada. Entre novamente para sincronizar.')
    }

    if (!response.ok) {
      throw new Error('Nao foi possivel carregar os dados da nuvem.')
    }

    const payload = (await response.json()) as CloudProfileData

    return {
      data: this.normalizeData(payload.data),
      updatedAt: payload.updatedAt ?? null,
    }
  }

  async save(token: string, data: AppData): Promise<CloudProfileData> {
    const response = await fetch(`${this.apiBaseUrl}/api/cloud/data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    })

    if (response.status === 401) {
      throw new Error('Sessao expirada. Entre novamente para sincronizar.')
    }

    if (!response.ok) {
      throw new Error('Nao foi possivel salvar os dados na nuvem.')
    }

    const payload = (await response.json()) as CloudProfileData

    return {
      data: this.normalizeData(payload.data),
      updatedAt: payload.updatedAt ?? null,
    }
  }

  private normalizeData(raw: Partial<AppData> | undefined): AppData {
    return {
      favorites: Array.isArray(raw?.favorites) ? raw.favorites : [],
      trades: Array.isArray(raw?.trades) ? raw.trades : [],
      buyIntents: Array.isArray(raw?.buyIntents) ? raw.buyIntents : [],
      buyAlerts: Array.isArray(raw?.buyAlerts) ? raw.buyAlerts : [],
      sellAlerts: Array.isArray(raw?.sellAlerts) ? raw.sellAlerts : [],
    }
  }
}
