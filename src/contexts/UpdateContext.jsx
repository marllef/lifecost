import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const UpdateContext = createContext({ disponivel: false, atualizar: () => {} })

// Registra o service worker (só no build de produção) e avisa quando há uma versão nova esperando.
// A versão nova só assume quando a pessoa pede, para não trocar os arquivos de baixo de uma coleta em andamento.
export function UpdateProvider({ children }) {
  const [espera, setEspera] = useState(null)
  const pediu = useRef(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return undefined

    let registro = null
    let ativo = true
    const aguardando = (worker) => { if (ativo && navigator.serviceWorker.controller) setEspera(worker) }

    const observar = (worker) =>
      worker.addEventListener('statechange', () => { if (worker.state === 'installed') aguardando(worker) })

    const registrar = async () => {
      try {
        registro = await navigator.serviceWorker.register('./sw.js')
        if (registro.waiting) aguardando(registro.waiting)
        registro.addEventListener('updatefound', () => registro.installing && observar(registro.installing))
      } catch { /* sem service worker o app continua funcionando online */ }
    }

    // Quem deixa o app aberto por horas (celular no bolso) também recebe as atualizações
    const verificar = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) registro?.update().catch(() => {})
    }
    // A troca de versão só recarrega a página se foi a pessoa que pediu (não na primeira instalação)
    const aoTrocar = () => { if (pediu.current) window.location.reload() }

    navigator.serviceWorker.addEventListener('controllerchange', aoTrocar)
    document.addEventListener('visibilitychange', verificar)
    if (document.readyState === 'complete') registrar()
    else window.addEventListener('load', registrar, { once: true })

    return () => {
      ativo = false
      navigator.serviceWorker.removeEventListener('controllerchange', aoTrocar)
      document.removeEventListener('visibilitychange', verificar)
      window.removeEventListener('load', registrar)
    }
  }, [])

  const atualizar = useCallback(() => {
    pediu.current = true
    espera?.postMessage({ type: 'SKIP_WAITING' })
  }, [espera])

  return <UpdateContext.Provider value={{ disponivel: Boolean(espera), atualizar }}>{children}</UpdateContext.Provider>
}

export const useUpdate = () => useContext(UpdateContext)
