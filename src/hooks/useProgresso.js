import { useMemo } from 'react'
import { ORDERED, SECTIONS } from '../data/products.js'
import { resolvido } from '../utils/calc.js'
import { useColetaStore } from '../stores/useColetaStore.js'

// Quantos produtos já foram resolvidos em cada estabelecimento e, no estabelecimento atual, em cada seção
export function useProgresso(estab) {
  const dados = useColetaStore((s) => s.dados)

  return useMemo(() => {
    const porEstab = dados.map((d) => ORDERED.filter((p) => resolvido(p, d[p.id])).length)
    const atual = dados[estab] || {}
    const porSecao = {}
    for (const s of SECTIONS) {
      const itens = ORDERED.filter((p) => p.secao === s.id)
      porSecao[s.id] = { total: itens.length, feitos: itens.filter((p) => resolvido(p, atual[p.id])).length }
    }
    return { total: ORDERED.length, porEstab, porSecao }
  }, [dados, estab])
}
