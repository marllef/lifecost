import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import modeloUrl from '../../docs/UCE_Custo_de_Vida.xlsx?url'
import { PRODUCTS, SECTIONS } from '../data/products.js'
import { catalogoDe } from './catalogo.js'
import { brl, compute, qtdBase, qtdTexto, temQtd } from './calc.js'
import { baixar, carimbo } from './download.js'

// Gera a planilha a partir de docs/UCE_Custo_de_Vida.xlsx. Estilos, fórmulas, formatação condicional, validações,
// painéis congelados e a aba Instruções são os do modelo. O modelo tem 4 estabelecimentos; a aba Coleta é
// remontada com um bloco de 3 colunas (preço encontrado, qtd encontrada, preço convertido) para cada um que existir,
// e as colunas de resumo vêm logo depois do último bloco. Os produtos adicionais (cadastrados no app) entram em linhas
// abaixo do total da cesta, com o mesmo formato, e não participam das somas.

const PRIMEIRA_LINHA = 6
const ULTIMA_LINHA = PRIMEIRA_LINHA + PRODUCTS.length - 1
const LINHA_TOTAL = ULTIMA_LINHA + 1
const COLUNAS_FIXAS = 5 // A–E: #, produto, unidade, qtd padrão, unid. base
const ABA_EXTRA = 'Marcas e observações'

// Estilos do modelo (índices em xl/styles.xml)
const ESTILO = { titulo: 3, estab: 4, sub: 5, preco: 8, qtd: 9, conv: 10, resumo: 11, contagem: 12, totalVazio: 14, total: 15, tabela: 6, texto: 7 }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const numero = (n) => String(Number(n.toFixed(10)))
const nomeSecao = Object.fromEntries(SECTIONS.map((s) => [s.id, s.nome]))

// 1 → A, 26 → Z, 27 → AA...
function letra(n) {
  let s = ''
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

const inline = (ref, estilo, texto) =>
  `<c r="${ref}" s="${estilo}" t="inlineStr"><is><t xml:space="preserve">${esc(texto)}</t></is></c>`
const vazia = (ref, estilo) => `<c r="${ref}" s="${estilo}"/>`
const comNumero = (ref, estilo, v) => `<c r="${ref}" s="${estilo}"><v>${numero(v)}</v></c>`
// Fórmula com o valor já calculado, para quem abre sem recalcular. Sem valor, o resultado é o texto vazio.
const formula = (ref, estilo, f, v) => v == null
  ? `<c r="${ref}" s="${estilo}" t="str"><f>${esc(f)}</f><v></v></c>`
  : `<c r="${ref}" s="${estilo}"><f>${esc(f)}</f><v>${numero(v)}</v></c>`

// Colunas de cada estabelecimento e do resumo, a partir de quantos existem
function layout(n) {
  const blocos = Array.from({ length: n }, (_, e) => {
    const base = COLUNAS_FIXAS + 1 + 3 * e
    return { preco: letra(base), qtd: letra(base + 1), conv: letra(base + 2) }
  })
  const r = COLUNAS_FIXAS + 1 + 3 * n
  return { blocos, resumo: [letra(r), letra(r + 1), letra(r + 2), letra(r + 3)], ultima: letra(r + 3) }
}

// Linha do modelo: tag de abertura e as células de A a E, que não mudam
function linhaDoModelo(xml, n) {
  const m = new RegExp(`<row r="${n}"[^>]*>([\\s\\S]*?)</row>`).exec(xml)
  if (!m) throw new Error(`O modelo não tem a linha ${n} na aba Coleta.`)
  const abertura = /<row [^>]*>/.exec(m[0])[0]
  const celulas = m[1].match(/<c r="[A-Z]+\d+"[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g) || []
  return { abertura, fixas: celulas.slice(0, COLUNAS_FIXAS).join(''), completa: m[0] }
}

function montarColeta(xml, state) {
  if (!xml.includes(`SUM(H${PRIMEIRA_LINHA}:H${ULTIMA_LINHA})`))
    throw new Error('O modelo mudou: a aba Coleta não tem mais 62 produtos nas linhas 6 a 67.')

  const n = state.estabs.length
  const { blocos, resumo, ultima } = layout(n)
  const [cMedia, cMenor, cMaior, cQtd] = resumo
  const linhas = [linhaDoModelo(xml, 1).completa, linhaDoModelo(xml, 2).completa]

  // Cabeçalho (linhas 4 e 5)
  const l4 = linhaDoModelo(xml, 4), l5 = linhaDoModelo(xml, 5)
  let c4 = l4.fixas, c5 = l5.fixas
  blocos.forEach((b, e) => {
    c4 += inline(`${b.preco}4`, ESTILO.estab, state.estabs[e]) + vazia(`${b.qtd}4`, ESTILO.estab) + vazia(`${b.conv}4`, ESTILO.estab)
    c5 += inline(`${b.preco}5`, ESTILO.sub, 'Preço encontrado (R$)') + inline(`${b.qtd}5`, ESTILO.sub, 'Qtd encontrada')
      + inline(`${b.conv}5`, ESTILO.sub, 'Preço convertido (R$)')
  })
  c4 += inline(`${cMedia}4`, ESTILO.titulo, 'Resumo (preços convertidos)') + [cMenor, cMaior, cQtd].map((c) => vazia(`${c}4`, ESTILO.titulo)).join('')
  c5 += [['Média', cMedia], ['Menor', cMenor], ['Maior', cMaior], ['Nº de preços', cQtd]].map(([t, c]) => inline(`${c}5`, ESTILO.sub, t)).join('')
  linhas.push(`${l4.abertura}${c4}</row>`, `${l5.abertura}${c5}</row>`)

  // Colunas de um produto na linha r: um bloco por estabelecimento e o resumo.
  // `somar` diz se os valores entram no total da cesta (só os produtos da tabela).
  const totais = blocos.map(() => 0)
  const soma = { media: 0, menor: 0, maior: 0 }
  const celulasProduto = (p, r, somar) => {
    let cels = ''
    const convertidos = []
    blocos.forEach((b, e) => {
      const entry = state.dados[e]?.[p.id]
      const calc = compute(p, entry)
      // Sem preço, "não encontrado" ou quantidade inválida: fica em branco (ver aba de observações)
      const ok = calc.convertido != null
      cels += ok ? comNumero(`${b.preco}${r}`, ESTILO.preco, calc.preco) : vazia(`${b.preco}${r}`, ESTILO.preco)
      cels += ok && temQtd(entry) ? comNumero(`${b.qtd}${r}`, ESTILO.qtd, qtdBase(p, entry)) : vazia(`${b.qtd}${r}`, ESTILO.qtd)
      cels += formula(`${b.conv}${r}`, ESTILO.conv,
        `IF(${b.preco}${r}="","",${b.preco}${r}*$D${r}/IF(${b.qtd}${r}="",$D${r},${b.qtd}${r}))`, ok ? calc.convertido : null)
      if (ok) { convertidos.push(calc.convertido); if (somar) totais[e] += calc.convertido }
    })
    const lista = blocos.map((b) => `${b.conv}${r}`).join(',')
    const media = convertidos.length ? convertidos.reduce((a, b) => a + b, 0) / convertidos.length : null
    const menor = convertidos.length ? Math.min(...convertidos) : null
    const maior = convertidos.length ? Math.max(...convertidos) : null
    if (somar && media != null) { soma.media += media; soma.menor += menor; soma.maior += maior }
    const vazioSe = (fn) => `IF(COUNT(${lista})=0,"",${fn}(${lista}))`
    return cels
      + formula(`${cMedia}${r}`, ESTILO.resumo, vazioSe('AVERAGE'), media)
      + formula(`${cMenor}${r}`, ESTILO.resumo, vazioSe('MIN'), menor)
      + formula(`${cMaior}${r}`, ESTILO.resumo, vazioSe('MAX'), maior)
      + formula(`${cQtd}${r}`, ESTILO.contagem, `COUNT(${lista})`, convertidos.length)
  }

  // Produtos da tabela
  PRODUCTS.forEach((p, i) => {
    const r = PRIMEIRA_LINHA + i
    const modelo = linhaDoModelo(xml, r)
    linhas.push(`${modelo.abertura}${modelo.fixas}${celulasProduto(p, r, true)}</row>`)
  })

  // Total da cesta
  const tot = linhaDoModelo(xml, LINHA_TOTAL)
  const soma_ = (c, v) => formula(`${c}${LINHA_TOTAL}`, ESTILO.total, `SUM(${c}${PRIMEIRA_LINHA}:${c}${ULTIMA_LINHA})`, v)
  let ct = tot.fixas
  blocos.forEach((b, e) => {
    ct += vazia(`${b.preco}${LINHA_TOTAL}`, ESTILO.totalVazio) + vazia(`${b.qtd}${LINHA_TOTAL}`, ESTILO.totalVazio) + soma_(b.conv, totais[e])
  })
  ct += soma_(cMedia, soma.media) + soma_(cMenor, soma.menor) + soma_(cMaior, soma.maior) + vazia(`${cQtd}${LINHA_TOTAL}`, ESTILO.totalVazio)
  linhas.push(`${tot.abertura}${ct}</row>`)

  // Produtos adicionais: um título e as linhas, abaixo do total
  const adicionais = catalogoDe(state.custom).adicionais
  const LINHA_TITULO_EXTRA = LINHA_TOTAL + 1
  const PRIMEIRA_EXTRA = LINHA_TITULO_EXTRA + 1
  const ULTIMA_EXTRA = LINHA_TITULO_EXTRA + adicionais.length
  if (adicionais.length) {
    linhas.push(`<row r="${LINHA_TITULO_EXTRA}">${inline(`A${LINHA_TITULO_EXTRA}`, ESTILO.sub, 'Produtos adicionais (não entram no total da cesta)')}`
      + ['B', 'C', 'D', 'E'].map((c) => vazia(`${c}${LINHA_TITULO_EXTRA}`, ESTILO.sub)).join('') + '</row>')
    adicionais.forEach((p, i) => {
      const r = PRIMEIRA_EXTRA + i
      const fixas = comNumero(`A${r}`, ESTILO.tabela, PRODUCTS.length + i + 1) + inline(`B${r}`, ESTILO.texto, p.nome)
        + inline(`C${r}`, ESTILO.tabela, p.label) + comNumero(`D${r}`, ESTILO.tabela, p.qtd) + inline(`E${r}`, ESTILO.tabela, p.base)
      linhas.push(`<row r="${r}">${fixas}${celulasProduto(p, r, false)}</row>`)
    })
  }
  const ultimaLinha = adicionais.length ? ULTIMA_EXTRA : LINHA_TOTAL
  // Intervalos dos produtos (os da tabela e, se houver, os adicionais), sem o total no meio
  const intervalo = (de, ate) => {
    const faixa = (l1, l2) => `${de}${l1}:${ate}${l2}`
    return adicionais.length ? `${faixa(PRIMEIRA_LINHA, ULTIMA_LINHA)} ${faixa(PRIMEIRA_EXTRA, ULTIMA_EXTRA)}` : faixa(PRIMEIRA_LINHA, ULTIMA_LINHA)
  }

  // Mesclagens, formatação condicional (laranja quando a embalagem difere da tabela) e validação numérica
  const mesclas = ['A', 'B', 'C', 'D', 'E'].map((c) => `<mergeCell ref="${c}4:${c}5"/>`)
    .concat(blocos.map((b) => `<mergeCell ref="${b.preco}4:${b.conv}4"/>`), `<mergeCell ref="${cMedia}4:${cQtd}4"/>`, `<mergeCell ref="A${LINHA_TOTAL}:E${LINHA_TOTAL}"/>`, ...(adicionais.length ? [`<mergeCell ref="A${LINHA_TITULO_EXTRA}:E${LINHA_TITULO_EXTRA}"/>`] : []))
  const condicionais = blocos.map((b, e) =>
    `<conditionalFormatting sqref="${intervalo(b.conv, b.conv)}"><cfRule type="expression" priority="${e + 2}" aboveAverage="0" equalAverage="0" bottom="0" percent="0" rank="0" text="" dxfId="0"><formula>AND($${b.preco}${PRIMEIRA_LINHA}&lt;&gt;&quot;&quot;,${b.qtd}${PRIMEIRA_LINHA}&lt;&gt;&quot;&quot;,${b.qtd}${PRIMEIRA_LINHA}&lt;&gt;$D${PRIMEIRA_LINHA})</formula></cfRule></conditionalFormatting>`).join('')
  const intervalos = blocos.map((b) => intervalo(b.preco, b.qtd)).join(' ')
  const validacao = `<dataValidations count="1"><dataValidation allowBlank="false" error="Digite um número maior que zero." errorStyle="stop" errorTitle="Valor inválido" operator="greaterThan" showDropDown="false" showErrorMessage="true" showInputMessage="false" sqref="${intervalos}" type="decimal"><formula1>0</formula1><formula2>0</formula2></dataValidation></dataValidations>`

  const larguras = [5, 26, 13, 10, 8]
  const cols = larguras.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="true" style="0"/>`).join('')
    + `<col min="${COLUNAS_FIXAS + 1}" max="${COLUNAS_FIXAS + 3 * n + 4}" width="12.5" customWidth="true" style="0"/>`

  return xml
    .replace(/<dimension[^>]*\/>/, `<dimension ref="A1:${ultima}${ultimaLinha}"/>`)
    .replace(/<cols>[\s\S]*?<\/cols>/, `<cols>${cols}</cols>`)
    .replace(/<sheetData>[\s\S]*?<\/sheetData>/, `<sheetData>${linhas.join('')}</sheetData>`)
    .replace(/<mergeCells[\s\S]*?<\/mergeCells>/, `<mergeCells count="${mesclas.length}">${mesclas.join('')}</mergeCells>`)
    .replace(/(?:<conditionalFormatting[\s\S]*?<\/conditionalFormatting>)+/, condicionais)
    .replace(/<dataValidations[\s\S]*?<\/dataValidations>/, validacao)
}

// Aba extra: o modelo não tem onde guardar marca, observação, "não encontrado" e quantidade inválida
function abaExtra(state) {
  const { produtos } = catalogoDe(state.custom)
  const linhaXml = (n, celulas, extra = '') =>
    `<row r="${n}"${extra}>${celulas.map(([estilo, texto], i) =>
      (texto === '' || texto == null ? vazia(`${letra(i + 1)}${n}`, estilo) : inline(`${letra(i + 1)}${n}`, estilo, texto))).join('')}</row>`

  const cab = [[ESTILO.titulo, '#'], [ESTILO.titulo, 'Produto'], [ESTILO.titulo, 'Seção']]
  state.estabs.forEach((nome) => cab.push([ESTILO.titulo, `${nome} - Marca`], [ESTILO.titulo, `${nome} - Embalagem encontrada`], [ESTILO.titulo, `${nome} - Situação`], [ESTILO.titulo, `${nome} - Observação`]))
  const linhas = [linhaXml(1, cab, ' ht="45" customHeight="1"')]

  produtos.forEach((p, i) => {
    const cels = [[ESTILO.tabela, String(i + 1)], [ESTILO.texto, p.nome], [ESTILO.texto, p.adicional ? `${nomeSecao[p.secao]} (adicional)` : nomeSecao[p.secao]]]
    state.estabs.forEach((_, e) => {
      const entry = state.dados[e]?.[p.id]
      const r = compute(p, entry)
      let obs = ''
      if (entry?.naoEncontrado) obs = 'Não encontrado'
      else if (r.pendente) obs = `Quantidade inválida; preço informado: R$ ${brl(r.preco)}`
      else if (r.foiConvertido) obs = 'Preço convertido pela regra de 3'
      const temPreco = r.preco != null && !entry?.naoEncontrado
      cels.push([ESTILO.texto, entry?.naoEncontrado ? '' : entry?.marca?.trim() ?? ''],
        [ESTILO.texto, temPreco ? qtdTexto(p, entry) : ''], [ESTILO.texto, obs], [ESTILO.texto, entry?.obs?.trim() ?? ''])
    })
    linhas.push(linhaXml(i + 2, cels))
  })

  const larguras = [5, 26, 20, ...state.estabs.flatMap(() => [16, 20, 30, 34])]
  const cols = larguras.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${letra(larguras.length)}${produtos.length + 1}"/><sheetViews><sheetView workbookViewId="0"><pane xSplit="3" ySplit="1" topLeftCell="D2" activePane="bottomRight" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${linhas.join('')}</sheetData></worksheet>`
}

export async function buildXlsx(state) {
  const resposta = await fetch(modeloUrl)
  if (!resposta.ok) throw new Error('Não foi possível carregar o modelo da planilha.')
  const arquivos = unzipSync(new Uint8Array(await resposta.arrayBuffer()))
  const ler = (nome) => strFromU8(arquivos[nome])
  const gravar = (nome, conteudo) => { arquivos[nome] = strToU8(conteudo) }

  gravar('xl/worksheets/sheet1.xml', montarColeta(ler('xl/worksheets/sheet1.xml'), state))
  gravar('xl/worksheets/sheet3.xml', abaExtra(state))
  gravar('xl/workbook.xml', ler('xl/workbook.xml')
    .replace('</sheets>', `<sheet name="${ABA_EXTRA}" sheetId="3" state="visible" r:id="rId6"/></sheets>`)
    .replace('<calcPr ', '<calcPr fullCalcOnLoad="1" '))
  gravar('xl/_rels/workbook.xml.rels', ler('xl/_rels/workbook.xml.rels').replace('</Relationships>',
    '<Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/></Relationships>'))
  gravar('[Content_Types].xml', ler('[Content_Types].xml').replace('</Types>',
    '<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'))

  return new Blob([zipSync(arquivos, { level: 6 })],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export async function downloadXlsx(state) {
  baixar(await buildXlsx(state), `custo-de-vida-${carimbo()}.xlsx`)
}
