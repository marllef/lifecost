import { useMemo } from 'react'
import { SECTIONS } from '../data/products.js'
import { useCatalogo } from '../stores/catalogo.js'
import { resolvido } from '../utils/calc.js'
import { useColetaStore } from '../stores/useColetaStore.js'

// Quantos produtos já foram resolvidos em cada estabelecimento e, no estabelecimento atual, em cada seção
export function useProgresso(estab) {
  const dados = useColetaStore((s) => s.dados)
  const { ordered } = useCatalogo()

  return useMemo(() => {
    const porEstab = dados.map((d) => ordered.filter((p) => resolvido(p, d[p.id])).length)
    const atual = dados[estab] || {}
    const porSecao = {}
    for (const s of SECTIONS) {
      const itens = ordered.filter((p) => p.secao === s.id)
      porSecao[s.id] = { total: itens.length, feitos: itens.filter((p) => resolvido(p, atual[p.id])).length }
    }
    return { total: ordered.length, porEstab, porSecao }
  }, [dados, estab, ordered])
}
