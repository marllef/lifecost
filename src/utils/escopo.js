import { ORDERED } from '../data/products.js'
import { resolvido } from './calc.js'

export const TODOS = 'todos'

// Produtos que a coleta percorre: todos, ou só os de uma seção, sempre na ordem de coleta
export const escopoDe = (secao) => (secao === TODOS ? ORDERED : ORDERED.filter((p) => p.secao === secao))

// Primeiro produto ainda sem resposta no estabelecimento; se estiver tudo feito, o primeiro do escopo
export const primeiroPendente = (escopo, dadosDoEstab) =>
  (escopo.find((p) => !resolvido(p, dadosDoEstab[p.id])) || escopo[0]).id
