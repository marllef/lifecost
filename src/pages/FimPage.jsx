import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowRight, FiFileText, FiGrid, FiRotateCcw } from 'react-icons/fi'
import { SECTIONS } from '../data/products.js'
import { useColetaNav } from '../hooks/useColetaNav.js'
import { useExportar } from '../hooks/useExportar.js'
import { useColetaStore } from '../stores/useColetaStore.js'
import Button from '../components/ui/Button.jsx'
import { resolvido } from '../utils/calc.js'
import { TODOS } from '../utils/escopo.js'

// Tela mostrada ao passar do último produto da seção (ou de todos)
export default function FimPage() {
  const navigate = useNavigate()
  const { estab, secao, escopo, trocarSecao, revisarPendentes } = useColetaNav()
  const dados = useColetaStore((s) => s.dados[estab])
  const { csv, xlsx, exportando, erro } = useExportar()

  useEffect(() => { window.scrollTo({ top: 0 }) }, [])

  const pendentes = escopo.filter((p) => !resolvido(p, dados[p.id])).length
  const i = SECTIONS.findIndex((s) => s.id === secao)
  const proxima = i >= 0 ? SECTIONS[i + 1] : null
  const titulo = secao === TODOS ? 'Todos os produtos' : SECTIONS[i].nome

  return (
    <article className="flex-1 bg-white px-4 pt-5 pb-[calc(18px+env(safe-area-inset-bottom))]">
      <h2 className="m-0 text-[1.7rem] leading-[1.15] font-bold tracking-tight">
        {pendentes === 0 ? `${titulo}: concluído` : `${titulo}: chegou ao fim`}
      </h2>
      <p className="mt-1 mb-0 text-[.92rem] text-suave">
        {pendentes === 0 ? 'Todos os produtos foram preenchidos neste estabelecimento.'
          : `${pendentes} ${pendentes === 1 ? 'produto ficou' : 'produtos ficaram'} sem preço.`}
      </p>
      <div className="mt-[18px] grid gap-2">
        {pendentes > 0 && <Button className="py-3.5 text-base font-bold" onClick={revisarPendentes}>Revisar pendentes</Button>}
        {proxima && (
          <Button variant="primario" className="py-3.5 text-base font-bold" onClick={() => trocarSecao(proxima.id)}>
            Ir para {proxima.nome} <FiArrowRight aria-hidden />
          </Button>
        )}
        <Button variant={proxima ? 'secundario' : 'ok'} className="py-3.5 text-base font-bold" disabled={exportando} onClick={xlsx}>
          <FiGrid aria-hidden /> {exportando ? 'Gerando planilha…' : 'Exportar Excel (.xlsx)'}
        </Button>
        <Button className="py-3.5 text-base font-bold" onClick={csv}>
          <FiFileText aria-hidden /> Exportar CSV
        </Button>
        {erro && <p role="alert" className="m-0 text-sm text-perigo">{erro}</p>}
        <Button className="py-3.5 text-base font-bold" onClick={() => navigate('/coleta')}>
          <FiRotateCcw aria-hidden /> Voltar ao último produto
        </Button>
      </div>
    </article>
  )
}
