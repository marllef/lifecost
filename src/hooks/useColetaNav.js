import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SECTIONS } from '../data/products.js'
import { escopoDe } from '../utils/escopo.js'
import { useCatalogo } from '../stores/catalogo.js'
import { useColetaStore } from '../stores/useColetaStore.js'
import { useNavStore } from '../stores/useNavStore.js'

// Posição atual da coleta (estabelecimento, seção, produto) e os movimentos entre produtos
export function useColetaNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const total = useColetaStore((s) => s.estabs.length)
  const estab = Math.min(useNavStore((s) => s.estab), total - 1)
  const secao = useNavStore((s) => s.secao)
  const pid = useNavStore((s) => s.pid)
  const { setPid, trocarEstab, trocarSecao, revisarPendentes, abrirProduto } = useNavStore.getState()

  const { ordered } = useCatalogo()
  const escopo = useMemo(() => escopoDe(secao, ordered), [secao, ordered])
  const idx = Math.max(0, escopo.findIndex((p) => p.id === pid))
  const produto = escopo[idx]
  const secaoAtual = SECTIONS.find((s) => s.id === produto.secao)

  // Trocar de estabelecimento ou seção na lista só filtra a lista; no fim da seção, segue a coleta
  const mover = (fn) => (...args) => { fn(...args); if (pathname === '/fim') navigate('/coleta') }
  // Escolher um produto, iniciar ou revisar pendentes sempre entra no modo de coleta
  const entrar = (fn) => (...args) => { fn(...args); navigate('/coleta') }

  return {
    estab, secao, escopo, idx, produto, secaoAtual,
    primeiro: idx === 0,
    proximo: () => (idx < escopo.length - 1 ? setPid(escopo[idx + 1].id) : navigate('/fim')),
    voltar: () => (idx > 0 ? setPid(escopo[idx - 1].id) : undefined),
    trocarEstab: mover(trocarEstab),
    trocarSecao: mover(trocarSecao),
    iniciar: entrar(revisarPendentes),
    revisarPendentes: entrar(revisarPendentes),
    abrirProduto: entrar(abrirProduto),
  }
}
