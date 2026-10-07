import { useState } from 'react'
import { useColetaStore } from '../stores/useColetaStore.js'
import { downloadCsv } from '../utils/csv.js'

// Exportação da coleta. O gerador de .xlsx só é carregado quando alguém pede, para não pesar na abertura do app.
export function useExportar() {
  const [exportando, setExportando] = useState(false)
  const [erro, setErro] = useState('')

  const csv = () => {
    setErro('')
    downloadCsv(useColetaStore.getState())
  }

  const xlsx = async () => {
    setExportando(true)
    setErro('')
    try {
      const { downloadXlsx } = await import('../utils/xlsx.js')
      await downloadXlsx(useColetaStore.getState())
    } catch {
      setErro('Não foi possível gerar o .xlsx. Use o CSV por enquanto.')
    } finally {
      setExportando(false)
    }
  }

  return { csv, xlsx, exportando, erro }
}
