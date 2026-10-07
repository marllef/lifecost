import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Button from '../components/ui/Button.jsx'

const ConfirmContext = createContext(() => Promise.resolve(false))

// confirm({ titulo, mensagem, confirmar }) abre um diálogo próprio e resolve true/false
export function ConfirmProvider({ children }) {
  const [pedido, setPedido] = useState(null)
  const ref = useRef(null)

  const confirm = useCallback(
    (opts) => new Promise((resolve) => setPedido({ ...opts, resolve })),
    []
  )

  useEffect(() => {
    if (pedido) ref.current?.showModal()
  }, [pedido])

  const fechar = (resposta) => {
    pedido?.resolve(resposta)
    ref.current?.close()
    setPedido(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pedido && (
        <dialog ref={ref} onCancel={() => fechar(false)}
          className="m-auto w-[min(92vw,420px)] rounded-2xl border-0 p-5 backdrop:bg-tinta/55">
          <h2 className="m-0 text-lg font-bold">{pedido.titulo}</h2>
          <p className="mt-2 text-sm leading-relaxed text-suave">{pedido.mensagem}</p>
          <div className="mt-4 flex gap-2">
            <Button variant="secundario" className="flex-1" onClick={() => fechar(false)}>Cancelar</Button>
            <Button variant="perigo" className="flex-1" onClick={() => fechar(true)}>{pedido.confirmar || 'Confirmar'}</Button>
          </div>
        </dialog>
      )}
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => useContext(ConfirmContext)
