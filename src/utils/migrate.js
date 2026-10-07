import { BY_ID, ID_ADICIONAL, SECTIONS } from '../data/products.js'
import { FIXOS, nomePadrao } from './estabs.js'

const BASES = ['g', 'ml', 'unid']
const SECOES = new Set(SECTIONS.map((s) => s.id))

// Produtos cadastrados pela pessoa: descarta o que estiver incompleto ou fora do formato
function adicionaisValidos(lista) {
  if (!Array.isArray(lista)) return []
  const vistos = new Set()
  return lista
    .filter((p) => p && Number.isInteger(p.id) && p.id > ID_ADICIONAL && !vistos.has(p.id) && vistos.add(p.id)
      && typeof p.nome === 'string' && p.nome.trim() && typeof p.label === 'string'
      && BASES.includes(p.base) && Number.isFinite(p.qtd) && p.qtd > 0 && SECOES.has(p.secao))
    .map(({ id, nome, qtd, base, label, secao }) => ({ id, nome, qtd, base, label, secao }))
}

// Versão antiga guardava "diferente" + qtd. Agora quantidade preenchida já significa embalagem diferente,
// e a unidade em branco passou a valer a da tabela (kg, L...) em vez da unidade base (g, ml).
export function migrarDados(s) {
  const dados = s.dados.map((d) => {
    const out = {}
    for (const [pid, e] of Object.entries(d || {})) {
      if (!('diferente' in e)) { out[pid] = e; continue }
      const { diferente, ...resto } = e
      const base = BY_ID.get(Number(pid))?.base
      out[pid] = diferente
        ? { marca: '', ...resto, unidade: resto.unidade || base || null }
        : { marca: '', ...resto, qtd: '', unidade: null }
    }
    return out
  })
  // Garante A–D e uma lista de dados para cada estabelecimento, nem mais nem menos
  const total = Math.max(FIXOS, s.estabs.length)
  const estabs = Array.from({ length: total }, (_, i) => (String(s.estabs[i] ?? '').trim() || nomePadrao(i)))
  return { ...s, estabs, dados: estabs.map((_, i) => dados[i] || {}), custom: adicionaisValidos(s.custom) }
}
