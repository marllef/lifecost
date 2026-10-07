import { PRODUCTS, SECTIONS, UNITS } from '../data/products.js'
import { parseNum } from './calc.js'
import { norm } from './text.js'

let cache = { custom: null, catalogo: null }

// Produtos da tabela UCE (fixos) mais os cadastrados pela pessoa. `ordered` segue a ordem da coleta:
// seção por seção, com os da tabela antes dos adicionais dentro de cada uma.
export function catalogoDe(custom) {
  if (cache.catalogo && cache.custom === custom) return cache.catalogo
  const adicionais = (custom || []).map((p) => ({ ...p, adicional: true }))
  const produtos = [...PRODUCTS, ...adicionais]
  const catalogo = {
    produtos, adicionais,
    ordered: SECTIONS.flatMap((s) => produtos.filter((p) => p.secao === s.id)),
    byId: new Map(produtos.map((p) => [p.id, p])),
  }
  cache = { custom, catalogo }
  return catalogo
}

// Unidades que a pessoa escolhe ao definir a embalagem de referência do produto
export const UNIDADES_FORM = Object.entries(UNITS).flatMap(([base, lista]) => lista.map((u) => ({ ...u, base })))

const fmt = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

// Texto da embalagem como na tabela da UCE: 1 kg, 500 ml, 1 dúzia, 10 unid.
function rotulo(base, qtd, emDuzias) {
  if (emDuzias) { const d = qtd / 12; return `${fmt(d)} ${d === 1 ? 'dúzia' : 'dúzias'}` }
  if (base === 'unid') return qtd === 1 ? '1 unidade' : `${fmt(qtd)} unid.`
  if (qtd >= 1000) return `${fmt(qtd / 1000)} ${base === 'g' ? 'kg' : 'L'}`
  return `${fmt(qtd)} ${base}`
}

// Converte o formulário ({ nome, secao, valor, unidade }) em produto, ou devolve { erro }.
// `existentes` são todos os produtos atuais; `idAtual` é o produto em edição (pode manter o próprio nome).
export function definirProduto({ nome, secao, valor, unidade }, existentes, idAtual = null) {
  const limpo = nome.trim().replace(/\s+/g, ' ')
  if (!limpo) return { erro: 'Informe o nome do produto.' }
  if (existentes.some((p) => p.id !== idAtual && norm(p.nome) === norm(limpo))) return { erro: 'Já existe um produto com esse nome.' }
  if (!SECTIONS.some((s) => s.id === secao)) return { erro: 'Escolha uma seção.' }
  const n = parseNum(valor)
  if (!n) return { erro: 'Informe uma quantidade maior que zero.' }
  const u = UNIDADES_FORM.find((x) => x.id === unidade)
  if (!u) return { erro: 'Escolha a unidade da embalagem.' }
  const qtd = Math.round(n * u.f * 1000) / 1000
  return { produto: { nome: limpo, secao, base: u.base, qtd, label: rotulo(u.base, qtd, u.id === 'duzia') } }
}
