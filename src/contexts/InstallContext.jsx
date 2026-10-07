import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const CHAVE = 'uce-instalar-dispensado'

const InstallContext = createContext({
  podeInstalar: false, ios: false, aberto: false, dispensado: true,
  abrir: () => {}, fechar: () => {}, instalar: () => {}, pedirInstalacao: () => {},
})

const lerDispensado = () => { try { return localStorage.getItem(CHAVE) === '1' } catch { return false } }
const gravarDispensado = () => { try { localStorage.setItem(CHAVE, '1') } catch { /* armazenamento bloqueado */ } }

const jaInstalado = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true

// iPhone/iPad não têm o evento de instalação: lá a pessoa precisa usar o menu Compartilhar do Safari
const ehIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

// Guarda o evento beforeinstallprompt (Chrome/Edge/Android) para oferecer a instalação no momento certo.
// Depois de instalado, ou com o app já aberto como app, nada é oferecido.
export function InstallProvider({ children }) {
  const [evento, setEvento] = useState(null)
  const [instalado, setInstalado] = useState(jaInstalado)
  const [aberto, setAberto] = useState(false)
  const [dispensado, setDispensado] = useState(lerDispensado)
  const ios = ehIos()

  useEffect(() => {
    const aoOferecer = (ev) => { ev.preventDefault(); setEvento(ev) }
    const aoInstalar = () => { setInstalado(true); setEvento(null); setAberto(false) }
    window.addEventListener('beforeinstallprompt', aoOferecer)
    window.addEventListener('appinstalled', aoInstalar)
    return () => {
      window.removeEventListener('beforeinstallprompt', aoOferecer)
      window.removeEventListener('appinstalled', aoInstalar)
    }
  }, [])

  const abrir = useCallback(() => setAberto(true), [])

  // Fechar sem instalar lembra a escolha para não perguntar de novo; o botão em Ajustes continua disponível
  const fechar = useCallback(() => { gravarDispensado(); setDispensado(true); setAberto(false) }, [])

  const instalar = useCallback(async () => {
    if (!evento) return
    setAberto(false)
    setDispensado(true) // evita reabrir a pergunta enquanto o aviso do navegador está na tela
    evento.prompt()
    const { outcome } = await evento.userChoice
    setEvento(null)
    if (outcome === 'dismissed') gravarDispensado()
  }, [evento])

  const podeInstalar = !instalado && (Boolean(evento) || ios)
  const pedirInstalacao = useCallback(() => (ios && !evento ? setAberto(true) : instalar()), [ios, evento, instalar])

  return (
    <InstallContext.Provider value={{ podeInstalar, ios: ios && !evento, aberto, dispensado, abrir, fechar, instalar, pedirInstalacao }}>
      {children}
    </InstallContext.Provider>
  )
}

export const useInstall = () => useContext(InstallContext)
