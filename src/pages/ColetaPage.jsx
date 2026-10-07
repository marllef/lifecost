import ProductForm from '../components/coleta/ProductForm.jsx'
import { useColetaNav } from '../hooks/useColetaNav.js'
import { useColetaStore } from '../stores/useColetaStore.js'
import { resolvido } from '../utils/calc.js'

export default function ColetaPage() {
  const { estab, escopo, idx, produto, secaoAtual, primeiro, proximo, voltar } = useColetaNav()
  const dados = useColetaStore((s) => s.dados[estab])
  const feitos = escopo.filter((p) => resolvido(p, dados[p.id])).length

  return (
    <ProductForm key={`${produto.id}-${estab}`} produto={produto} estab={estab}
      posicao={`${secaoAtual.nome} · ${idx + 1} de ${escopo.length}`}
      progresso={feitos / escopo.length} primeiro={primeiro}
      onProximo={proximo} onVoltar={voltar} />
  )
}
