import { parseNum } from './calc.js'

export const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export const nomeCurto = (n) => n.replace(/^Estabelecimento\s+/i, '')
export const soNumero = (v) => v.replace(/[^\d.,]/g, '')

// Máscara financeira: só dígitos, que entram pelos centavos e empurram para a esquerda (5 → 0,05 → 0,51 → 5,12 → 51,23...)
export function mascaraPreco(raw) {
  const digitos = String(raw ?? '').replace(/\D/g, '').replace(/^0+/, '').slice(0, 9)
  if (!digitos) return ''
  const centavos = digitos.padStart(3, '0')
  const reais = centavos.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${reais},${centavos.slice(-2)}`
}

// Preços salvos antes da máscara ("6.5", "2") são reexibidos já com duas casas decimais
export function exibirPreco(salvo) {
  const s = String(salvo ?? '').trim()
  if (!s || /,\d{2}$/.test(s)) return s
  const n = parseNum(s)
  return n == null ? '' : mascaraPreco(String(Math.round(n * 100)))
}
