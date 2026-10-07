import { Link, useLocation } from 'react-router-dom'
import { FiList, FiSettings } from 'react-icons/fi'
import Brand from '../ui/Brand.jsx'
import EstabTabs from './EstabTabs.jsx'
import ExportMenu from './ExportMenu.jsx'

const botao = 'inline-flex items-center gap-1.5 rounded-lg bg-white/12 px-3 py-[7px] text-sm font-semibold text-white'

export default function Header() {
  const { pathname } = useLocation()
  const mostrarEstabs = pathname !== '/ajustes'

  return (
    <header className="sticky top-0 z-10 bg-tinta px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-3 text-white">
      <div className="flex items-center justify-between">
        <h1 className="m-0 flex-none">
          <Link to="/" className="flex rounded-lg"><Brand className="block h-7 w-auto" /></Link>
        </h1>
        <div className="flex items-center gap-1">
          {pathname !== '/' && <Link to="/" className={botao}><FiList aria-hidden /> Lista</Link>}
          <ExportMenu />
          <Link to="/ajustes" aria-label="Ajustes" className="rounded-lg p-2 text-white"><FiSettings size={20} /></Link>
        </div>
      </div>
      {mostrarEstabs && <EstabTabs />}
    </header>
  )
}
