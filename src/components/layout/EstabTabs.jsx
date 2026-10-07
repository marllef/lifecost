import { useEffect, useRef } from 'react'
import { useColetaStore } from '../../stores/useColetaStore.js'
import { useColetaNav } from '../../hooks/useColetaNav.js'
import { useProgresso } from '../../hooks/useProgresso.js'
import { nomeCurto } from '../../utils/text.js'

export default function EstabTabs() {
  const estabs = useColetaStore((s) => s.estabs)
  const { estab, trocarEstab } = useColetaNav()
  const { total, porEstab } = useProgresso(estab)
  const ativa = useRef(null)

  // Com mais de quatro, a aba escolhida precisa aparecer na rolagem
  useEffect(() => { ativa.current?.scrollIntoView({ inline: 'nearest', block: 'nearest' }) }, [estab])

  return (
    <nav aria-label="Estabelecimentos" className="mt-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
      {estabs.map((nome, i) => (
        <button key={i} ref={i === estab ? ativa : null} aria-pressed={i === estab} onClick={() => trocarEstab(i)}
          className={`flex w-[calc(25%-4.5px)] min-w-0 flex-none cursor-pointer flex-col gap-0.5 rounded-xl border px-1.5 py-2 text-left ${
            i === estab ? 'border-etiqueta bg-etiqueta text-tinta' : 'border-white/15 bg-white/8 text-white'}`}>
          <span className="truncate text-[.8rem] font-semibold">{nomeCurto(nome)}</span>
          <span className="text-[.72rem] tabular-nums opacity-75">{porEstab[i]}/{total}</span>
        </button>
      ))}
    </nav>
  )
}
