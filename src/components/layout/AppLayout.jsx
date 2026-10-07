import { Outlet } from 'react-router-dom'
import { FiWifiOff } from 'react-icons/fi'
import { useConnectivity } from '../../contexts/ConnectivityContext.jsx'
import Header from './Header.jsx'
import UpdateBanner from './UpdateBanner.jsx'

export default function AppLayout() {
  const { offline } = useConnectivity()

  return (
    <div className="mx-auto flex min-h-dvh max-w-[640px] flex-col">
      <Header />
      <UpdateBanner />
      {offline && (
        <p className="m-0 flex items-center gap-2 bg-tinta px-4 pb-3 text-sm text-etiqueta">
          <FiWifiOff aria-hidden /> Sem internet. Tudo continua salvo neste aparelho.
        </p>
      )}
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
