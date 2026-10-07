import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { emptyEntry } from '../utils/calc.js'
import { FIXOS, nomePadrao } from '../utils/estabs.js'
import { migrarDados } from '../utils/migrate.js'

const KEY = 'uce-coleta-v1'
const NOMES = Array.from({ length: FIXOS }, (_, i) => nomePadrao(i))
const vazios = (n) => Array.from({ length: n }, () => ({}))

// Mantém o formato já gravado nos aparelhos ({ estabs, dados } direto na chave) e migra versões antigas
const storage = {
  getItem: (name) => {
    try {
      const s = JSON.parse(localStorage.getItem(name))
      if (s && Array.isArray(s.estabs) && Array.isArray(s.dados)) return { state: migrarDados(s), version: 0 }
    } catch { /* dados corrompidos ou indisponíveis */ }
    return null
  },
  setItem: (name, value) => {
    try { localStorage.setItem(name, JSON.stringify(value.state)) } catch { /* armazenamento cheio ou bloqueado */ }
  },
  removeItem: (name) => {
    try { localStorage.removeItem(name) } catch { /* ignorar */ }
  },
}

// Dados da coleta: nomes dos estabelecimentos e o que foi anotado em cada um, por id de produto
export const useColetaStore = create(
  persist(
    (set) => ({
      estabs: NOMES,
      dados: vazios(FIXOS),

      atualizar: (estab, pid, patch) =>
        set((s) => {
          const dados = s.dados.map((d) => ({ ...d }))
          dados[estab][pid] = { ...emptyEntry(), ...dados[estab][pid], ...patch }
          return { dados }
        }),

      limpar: (estab, pid) =>
        set((s) => {
          const dados = s.dados.map((d) => ({ ...d }))
          delete dados[estab][pid]
          return { dados }
        }),

      // lista = [{ nome, origem }]: origem é a posição atual do estabelecimento (null se for novo).
      // Os quatro primeiros são fixos; a partir do quinto dá para cadastrar e remover.
      aplicarEstabs: (lista) =>
        set((s) => ({
          estabs: lista.map((e, i) => e.nome.trim() || nomePadrao(i)),
          dados: lista.map((e) => (e.origem == null ? {} : s.dados[e.origem] || {})),
        })),

      apagarPrecos: () => set((s) => ({ dados: vazios(s.estabs.length) })),
    }),
    { name: KEY, storage, partialize: (s) => ({ estabs: s.estabs, dados: s.dados }) }
  )
)
