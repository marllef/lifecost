import { FiRefreshCw } from 'react-icons/fi'
import { useUpdate } from '../../contexts/UpdateContext.jsx'

// Aparece quando há uma versão nova do app esperando. Os preços já estão salvos, então atualizar não perde nada.
export default function UpdateBanner() {
  const { disponivel, atualizar } = useUpdate()
  if (!disponivel) return null

  return (
    <div role="status" className="flex items-center justify-between gap-3 bg-etiqueta px-4 py-2.5 text-sm font-semibold text-tinta">
      <span>Nova versão disponível.</span>
      <button onClick={atualizar}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-tinta px-3 py-1.5 text-sm font-semibold text-white">
        <FiRefreshCw aria-hidden /> Atualizar
      </button>
    </div>
  )
}
