import { PRODUCTS, SECTIONS } from '../data/products.js'
import { catalogoDe } from './catalogo.js'
import { compute, qtdTexto, temQtd } from './calc.js'
import { baixar, carimbo } from './download.js'

const num = (n, d = 2) =>
  n == null ? '' : n.toLocaleString('pt-BR', { minimumFractionDigits: d === 2 ? 2 : 0, maximumFractionDigits: d, useGrouping: false })

const cell = (v) => {
  const s = String(v ?? '')
  return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

const nomeSecao = Object.fromEntries(SECTIONS.map((s) => [s.id, s.nome]))

// Linhas na ordem da lista original (alfabética), independente da ordem em que a coleta percorre as seções.
// Os produtos adicionais vêm depois do total: a cesta da UCE é só a lista original, e eles não entram na soma.
// CSV no padrão brasileiro: separador ";" e vírgula decimal (abre direto no Excel e no Google Sheets em pt-BR)
export function buildCsv(state) {
  const head = ['#', 'Seção', 'Produto', 'Unidade (tabela)', 'Qtd padrão', 'Unid. base']
  state.estabs.forEach((nome) => {
    head.push(`${nome} - Marca`, `${nome} - Qtd encontrada`, `${nome} - Preço encontrado (R$)`, `${nome} - Preço convertido (R$)`, `${nome} - Situação`, `${nome} - Observação`)
  })
  head.push('Média (R$)', 'Menor (R$)', 'Maior (R$)', 'Nº de preços')

  const totals = state.estabs.map(() => 0)
  // Monta a linha do produto; `somar` diz se os convertidos entram no total da cesta
  const linha = (p, numero, somar) => {
    const secao = p.adicional ? `${nomeSecao[p.secao]} (adicional)` : nomeSecao[p.secao]
    const row = [numero, secao, p.nome, p.label, p.qtd, p.base]
    const conv = []
    state.estabs.forEach((_, e) => {
      const entry = state.dados[e]?.[p.id]
      const r = compute(p, entry)
      let obs = ''
      if (entry?.naoEncontrado) obs = 'Não encontrado'
      else if (r.pendente) obs = 'Falta quantidade'
      else if (r.foiConvertido) obs = 'Convertido'
      const qtd = r.preco != null || temQtd(entry) ? qtdTexto(p, entry) : ''
      row.push(entry?.marca?.trim() ?? '', qtd, num(r.preco), num(r.convertido), obs, entry?.obs?.trim() ?? '')
      if (r.convertido != null) { conv.push(r.convertido); if (somar) totals[e] += r.convertido }
    })
    const media = conv.length ? conv.reduce((a, b) => a + b, 0) / conv.length : null
    row.push(num(media), num(conv.length ? Math.min(...conv) : null), num(conv.length ? Math.max(...conv) : null), conv.length)
    return row
  }

  const rows = PRODUCTS.map((p, i) => linha(p, i + 1, true))
  const adicionais = catalogoDe(state.custom).adicionais.map((p, i) => linha(p, PRODUCTS.length + i + 1, false))

  const total = ['', '', 'TOTAL DA CESTA', '', '', '']
  totals.forEach((t) => total.push('', '', '', num(t), '', ''))
  total.push('', '', '', '')

  const lines = [head, ...rows, total, ...adicionais].map((r) => r.map(cell).join(';'))
  return '\ufeff' + lines.join('\r\n')
}

export function downloadCsv(state) {
  baixar(new Blob([buildCsv(state)], { type: 'text/csv;charset=utf-8' }), `custo-de-vida-${carimbo()}.csv`)
}
