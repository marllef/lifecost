import { useState } from 'react'
import { FiChevronDown, FiDownload, FiFileText, FiGrid } from 'react-icons/fi'
import { useExportar } from '../../hooks/useExportar.js'

const item = 'flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-3.5 py-3 text-left text-[.95rem] font-semibold text-tinta disabled:opacity-50'

// Botão "Exportar" do cabeçalho, com a escolha do formato
export default function ExportMenu() {
  const [aberto, setAberto] = useState(false)
  const { csv, xlsx, exportando, erro } = useExportar()

  const escolher = async (fn) => {
    await fn()
    setAberto(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setAberto((v) => !v)} aria-haspopup="menu" aria-expanded={aberto}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-white/12 px-3 py-[7px] text-sm font-semibold text-white">
        <FiDownload aria-hidden /> Exportar <FiChevronDown aria-hidden size={14} />
      </button>
      {aberto && (
        <>
          <button aria-label="Fechar menu" onClick={() => setAberto(false)} className="fixed inset-0 z-10 cursor-default border-0 bg-transparent" />
          <div role="menu" className="absolute top-full right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/10">
            <button role="menuitem" className={item} disabled={exportando} onClick={() => escolher(xlsx)}>
              <FiGrid aria-hidden className="text-ok" />
              <span>{exportando ? 'Gerando planilha…' : 'Excel (.xlsx)'}<small className="block text-xs font-normal text-suave">Modelo da UCE preenchido</small></span>
            </button>
            <button role="menuitem" className={`${item} border-t border-linha`} onClick={() => escolher(csv)}>
              <FiFileText aria-hidden className="text-suave" />
              <span>CSV<small className="block text-xs font-normal text-suave">Separado por ponto e vírgula</small></span>
            </button>
            {erro && <p role="alert" className="m-0 border-t border-linha px-3.5 py-2.5 text-xs text-perigo">{erro}</p>}
          </div>
        </>
      )}
    </div>
  )
}
