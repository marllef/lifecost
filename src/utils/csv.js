import { PRODUCTS, SECTIONS } from '../data/products.js'
import { compute, qtdTexto, temQtd } from './calc.js'
import { baixar, carimbo } from './download.js'

const num = (n, d = 2) =>
  n == null ? '' : n.toLocaleString('pt-BR', { minimumFractionDigits: d === 2 ? 2 : 0, maximumFractionDigits: d, useGrouping: false })

const cell = (v) => {
  const s = String(v ?? '')
  return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

const nomeSecao = Object.fromEntries(SECTIONS.map((s) => [s.id, s.nome]))

// Linhas na ordem da lista original (alfabética), independente da ordem em que a coleta percorre as seções
// CSV no padrão brasileiro: separador ";" e vírgula decimal (abre direto no Excel e no Google Sheets em pt-BR)
export function buildCsv(state) {
  const head = ['#', 'Seção', 'Produto', 'Unidade (tabela)', 'Qtd padrão', 'Unid. base']
  state.estabs.forEach((nome) => {
    head.push(`${nome} - Marca`, `${nome} - Qtd encontrada`, `${nome} - Preço encontrado (R$)`, `${nome} - Preço convertido (R$)`, `${nome} - Situação`, `${nome} - Observação`)
  })
  head.push('Média (R$)', 'Menor (R$)', 'Maior (R$)', 'Nº de preços')

  const totals = state.estabs.map(() => 0)
  const rows = PRODUCTS.map((p) => {
    const row = [p.id, nomeSecao[p.secao], p.nome, p.label, p.qtd, p.base]
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
      if (r.convertido != null) { conv.push(r.convertido); totals[e] += r.convertido }
    })
    const media = conv.length ? conv.reduce((a, b) => a + b, 0) / conv.length : null
    row.push(num(media), num(conv.length ? Math.min(...conv) : null), num(conv.length ? Math.max(...conv) : null), conv.length)
    return row
  })

  const total = ['', '', 'TOTAL DA CESTA', '', '', '']
  totals.forEach((t) => total.push('', '', '', num(t), '', ''))
  total.push('', '', '', '')

  const lines = [head, ...rows, total].map((r) => r.map(cell).join(';'))
  return '﻿' + lines.join('\r\n')
}

export function downloadCsv(state) {
  baixar(new Blob([buildCsv(state)], { type: 'text/csv;charset=utf-8' }), `custo-de-vida-${carimbo()}.csv`)
}
