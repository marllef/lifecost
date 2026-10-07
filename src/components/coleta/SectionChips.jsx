import { FiCheck } from 'react-icons/fi'
import { SECTIONS } from '../../data/products.js'
import { useColetaNav } from '../../hooks/useColetaNav.js'
import { useProgresso } from '../../hooks/useProgresso.js'
import { TODOS } from '../../utils/escopo.js'

function Chip({ ativo, completa, onClick, children, contagem }) {
  return (
    <button onClick={onClick} aria-pressed={ativo}
      className={`flex flex-none cursor-pointer items-center gap-1 rounded-full border-[1.5px] px-3 py-[7px] text-sm font-semibold whitespace-nowrap ${
        ativo ? 'border-tinta bg-tinta text-white'
          : completa ? 'border-ok bg-white text-ok' : 'border-linha bg-white text-tinta'}`}>
      {completa && !ativo && <FiCheck aria-hidden />}
      {children}
      <small className="text-[.75em] tabular-nums opacity-70">{contagem}</small>
    </button>
  )
}

export default function SectionChips() {
  const { estab, secao, trocarSecao } = useColetaNav()
  const { total, porEstab, porSecao } = useProgresso(estab)

  return (
    <div role="group" aria-label="Seção" className="flex gap-1.5 overflow-x-auto px-3 py-2.5 [scrollbar-width:none]">
      <Chip ativo={secao === TODOS} onClick={() => trocarSecao(TODOS)} contagem={`${porEstab[estab]}/${total}`}>Todas</Chip>
      {SECTIONS.map((s) => {
        const c = porSecao[s.id]
        return (
          <Chip key={s.id} ativo={secao === s.id} completa={c.feitos === c.total}
            onClick={() => trocarSecao(s.id)} contagem={`${c.feitos}/${c.total}`}>
            {s.nome}
          </Chip>
        )
      })}
    </div>
  )
}
