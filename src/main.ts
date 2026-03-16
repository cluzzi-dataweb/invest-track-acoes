import { InvestmentApp } from './app/app.ts'

import './style.css'

const appRoot = document.querySelector<HTMLDivElement>('#app')

if (!appRoot) {
  throw new Error('Elemento principal #app nao encontrado.')
}

const app = new InvestmentApp(appRoot)
app.init().catch((error) => {
  appRoot.innerHTML = `<div class="fatal">Falha ao iniciar aplicacao: ${error instanceof Error ? error.message : 'erro desconhecido'}</div>`
})
