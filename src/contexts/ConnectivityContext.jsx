import { createContext, useContext, useEffect, useState } from 'react'

const ConnectivityContext = createContext({ offline: false })

// Informa se o aparelho está sem internet. O app segue funcionando; é só um aviso.
export function ConnectivityProvider({ children }) {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    navigator.storage?.persist?.().catch(() => {})
    const on = () => setOffline(false), off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  return <ConnectivityContext.Provider value={{ offline }}>{children}</ConnectivityContext.Provider>
}

export const useConnectivity = () => useContext(ConnectivityContext)
