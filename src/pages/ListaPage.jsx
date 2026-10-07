import { useState } from 'react'
import { FiPlay, FiSearch } from 'react-icons/fi'
import { ORDERED, SECTIONS } from '../data/products.js'
import { useColetaNav } from '../hooks/useColetaNav.js'
import { useColetaStore } from '../stores/useColetaStore.js'
import Button from '../components/ui/Button.jsx'
import PriceTag from '../components/ui/PriceTag.jsx'
import { compute } from '../utils/calc.js'
import { TODOS } from '../utils/escopo.js'
import { nomeCurto, norm } from '../utils/text.js'

// Tela inicial: produtos por seção, com o status de cada um no estabelecimento atual.
// "Iniciar" abre a coleta no primeiro produto pendente; tocar num produto abre a coleta nele.
export default function ListaPage() {
  const { estab, secao, abrirProduto, iniciar } = useColetaNav()
  const nome = useColetaStore((s) => s.estabs[estab])
  const dados = useColetaStore((s) => s.dados[estab])
  const [busca, setBusca] = useState('')
  const q = norm(busca.trim())
  const secoes = SECTIONS.filter((s) => secao === TODOS || s.id === secao)

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-3 rounded-2xl bg-white px-4 pt-4 pb-3">
        <h2 className="m-0 mb-3 text-lg font-bold">Produtos · {nomeCurto(nome)}</h2>
        <label className="relative block">
          <FiSearch aria-hidden className="absolute top-1/2 left-3 -translate-y-1/2 text-suave" />
          <input type="search" placeholder="Buscar produto" value={busca} onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl border-[1.5px] border-linha py-2.5 pr-3.5 pl-9 text-base focus:border-tinta focus:outline-none" />
        </label>

        {secoes.map((s) => {
          const itens = ORDERED.filter((p) => p.secao === s.id && (!q || norm(p.nome).includes(q)))
          if (!itens.length) return null
          return (
            <section key={s.id}>
              <h3 className="mt-[18px] mb-1 text-[.78rem] font-bold tracking-wide text-suave uppercase">{s.nome}</h3>
              <ul className="m-0 list-none p-0">
                {itens.map((p) => (
                  <li key={p.id} className="border-b border-linha last:border-b-0">
                    <button onClick={() => abrirProduto(p)}
                      className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-0.5 py-2.5 text-left">
                      <span className="flex min-w-0 flex-col">
                        <span className="font-semibold">{p.nome}</span>
                        <span className="truncate text-[.8rem] text-suave">
                          {p.label}
                          {dados[p.id]?.marca?.trim() && !dados[p.id].naoEncontrado && <> · <strong className="font-semibold text-tinta">{dados[p.id].marca.trim()}</strong></>}
                        </span>
                      </span>
                      <PriceTag r={compute(p, dados[p.id])} entry={dados[p.id]} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <div className="sticky bottom-0 mt-3 border-t border-linha bg-white px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <Button variant="primario" className="w-full py-[15px] text-[1.05rem] font-bold" onClick={iniciar}>
          <FiPlay aria-hidden /> Iniciar
        </Button>
      </div>
    </div>
  )
}
