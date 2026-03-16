import type { AppData } from '../types.ts'

const STORAGE_KEY = 'invest-control.v1'

const defaultData: AppData = {
  favorites: [],
  trades: [],
  buyIntents: [],
  buyAlerts: [],
  sellAlerts: [],
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return { ...defaultData }
    }

    const parsed = JSON.parse(raw) as Partial<AppData>

    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      trades: Array.isArray(parsed.trades) ? parsed.trades : [],
      buyIntents: Array.isArray(parsed.buyIntents) ? parsed.buyIntents : [],
      buyAlerts: Array.isArray(parsed.buyAlerts) ? parsed.buyAlerts : [],
      sellAlerts: Array.isArray(parsed.sellAlerts) ? parsed.sellAlerts : [],
    }
  } catch {
    return { ...defaultData }
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
