import { useColetaStore } from '../../stores/useColetaStore.js'
import { brl, compute, qtdTexto } from '../../utils/calc.js'
import { nomeCurto } from '../../utils/text.js'

// Marca e preço do mesmo produto nos outros estabelecimentos, lado a lado, para comparar na hora de digitar
export default function CompareBox({ produto, estab }) {
  const estabs = useColetaStore((s) => s.estabs)
  const dados = useColetaStore((s) => s.dados)

  return (
    <section aria-label="Anotado nos outros estabelecimentos" className="mt-3.5">
      <h3 className="m-0 mb-1.5 text-[.7rem] font-bold tracking-wide text-suave uppercase">Nos outros estabelecimentos</h3>
      <ul className="m-0 flex list-none gap-2 overflow-x-auto p-0 [scrollbar-width:none]">
        {estabs.map((nome, i) => {
          if (i === estab) return null
          const en = dados[i][produto.id]
          const c = compute(produto, en)
          const marca = en?.marca?.trim()
          return (
            <li key={i} title={en && !en.naoEncontrado && c.preco != null ? qtdTexto(produto, en) : undefined}
              className="w-[calc((100%-1rem)/3)] min-w-0 flex-none rounded-xl bg-fundo px-2.5 py-2">
              <span className="block truncate text-[.7rem] font-bold text-suave">{nomeCurto(nome)}</span>
              <span className="mt-0.5 block truncate text-[.82rem]">
                {en?.naoEncontrado ? 'Não encontrado' : marca || (c.preco != null ? 'sem marca' : '—')}
              </span>
              <span className={`block truncate text-base font-bold tabular-nums ${c.foiConvertido ? 'text-[#B36A12]' : ''}`}>
                {c.convertido != null ? `R$ ${brl(c.convertido)}` : c.pendente ? 'falta qtd' : '—'}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
