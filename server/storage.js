import { promises as fs } from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data')
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json')

const EMPTY_PORTFOLIO = { holdings: [] }

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
