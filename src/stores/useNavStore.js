import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { BY_ID, ORDERED, SECTIONS } from '../data/products.js'
import { TODOS, escopoDe, primeiroPendente } from '../utils/escopo.js'
import { useColetaStore } from './useColetaStore.js'

const dadosDe = (estab) => useColetaStore.getState().dados[estab] || {}

// Onde a pessoa parou: estabelecimento, seção e produto atuais
export const useNavStore = create(
  persist(
    (set) => ({
      estab: 0,
      secao: TODOS,
      pid: ORDERED[0].id,

      setPid: (pid) => set({ pid }),

      // Usado quando a lista de estabelecimentos muda e a posição do atual se desloca
      reposicionarEstab: (estab) => set({ estab }),

      trocarEstab: (estab) =>
        set((s) => ({ estab, pid: primeiroPendente(escopoDe(s.secao), dadosDe(estab)) })),

      trocarSecao: (secao) =>
        set((s) => ({ secao, pid: primeiroPendente(escopoDe(secao), dadosDe(s.estab)) })),

      revisarPendentes: () =>
        set((s) => ({ pid: primeiroPendente(escopoDe(s.secao), dadosDe(s.estab)) })),

      // Se o produto está em outra seção, passa a percorrer a seção dele
      abrirProduto: (produto) =>
        set((s) => ({
          pid: produto.id,
          secao: s.secao === TODOS || produto.secao === s.secao ? s.secao : produto.secao,
        })),
    }),
    {
      name: 'uce-coleta-nav',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ estab, secao, pid }) => ({ estab, secao, pid }),
      // Descarta valores salvos que não existem mais (seção removida, produto inválido...)
      merge: (salvo, atual) => {
        const u = salvo || {}
        const secaoOk = u.secao === TODOS || SECTIONS.some((s) => s.id === u.secao)
        return {
          ...atual,
          estab: Number.isInteger(u.estab) && u.estab >= 0 && u.estab < useColetaStore.getState().estabs.length ? u.estab : atual.estab,
          secao: secaoOk ? u.secao : atual.secao,
          pid: BY_ID.has(u.pid) ? u.pid : atual.pid,
        }
      },
    }
  )
)
