import { UNITS, unidadePadrao } from '../data/products.js'

// Aceita "6,50", "6.50", "1.234,56"
export function parseNum(s) {
  if (s == null) return null
  let t = String(s).trim()
  if (!t) return null
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  const n = Number(t)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function emptyEntry() {
  return { marca: '', obs: '', preco: '', qtd: '', unidade: null, naoEncontrado: false }
}

// Quantidade em branco significa que a embalagem é a padrão da tabela
export const temQtd = (entry) => String(entry?.qtd ?? '').trim() !== ''

function unidadeEscolhida(product, entry) {
  const id = entry?.unidade || unidadePadrao(product).id
  return UNITS[product.base].find((x) => x.id === id) || UNITS[product.base][0]
}

// Quantidade encontrada convertida para a unidade base do produto (g, ml ou unid)
export function qtdBase(product, entry) {
  if (!temQtd(entry)) return null
  const q = parseNum(entry.qtd)
  return q ? q * unidadeEscolhida(product, entry).f : null
}

// Texto da embalagem encontrada ("500 g"), ou a embalagem da tabela quando a quantidade ficou em branco
export function qtdTexto(product, entry) {
  if (!temQtd(entry)) return product.label
  return `${String(entry.qtd).trim()} ${unidadeEscolhida(product, entry).label}`
}

// Regra de 3: preço convertido = preço encontrado × qtd padrão ÷ qtd encontrada
export function compute(product, entry) {
  if (!entry || entry.naoEncontrado) return { preco: null, convertido: null, foiConvertido: false, pendente: false }
  const preco = parseNum(entry.preco)
  if (!preco) return { preco: null, convertido: null, foiConvertido: false, pendente: false }
  if (!temQtd(entry)) return { preco, convertido: preco, foiConvertido: false, pendente: false }
  const q = qtdBase(product, entry)
  if (!q) return { preco, convertido: null, foiConvertido: false, pendente: true }
  return { preco, convertido: (preco * product.qtd) / q, foiConvertido: q !== product.qtd, pendente: false }
}

export function status(product, entry) {
  if (entry?.naoEncontrado) return 'ausente'
  const r = compute(product, entry)
  if (r.pendente) return 'incompleto'
  if (r.convertido != null) return 'ok'
  return 'vazio'
}

export const brl = (n) =>
  n == null ? '' : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Produto resolvido = tem preço válido ou foi marcado como "não encontrado"
export const resolvido = (product, entry) => {
  const st = status(product, entry)
  return st === 'ok' || st === 'ausente'
}
