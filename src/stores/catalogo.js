import { catalogoDe } from '../utils/catalogo.js'
import { useColetaStore } from './useColetaStore.js'

// Catálogo atual (produtos da tabela + cadastrados), para quem está fora do React
export const getCatalogo = () => catalogoDe(useColetaStore.getState().custom)

export const useCatalogo = () => catalogoDe(useColetaStore((s) => s.custom))
