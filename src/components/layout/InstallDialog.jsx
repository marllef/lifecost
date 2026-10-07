import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { FiDownload, FiPlusSquare, FiShare } from 'react-icons/fi'
import { useInstall } from '../../contexts/InstallContext.jsx'
import Button from '../ui/Button.jsx'
import Brand from '../ui/Brand.jsx'

// Pergunta se a pessoa quer instalar o app. Só puxa a conversa na lista (nunca no meio de uma coleta)
// e só uma vez: depois de fechar, a instalação fica disponível em Ajustes.
export default function InstallDialog() {
  const { podeInstalar, ios, aberto, dispensado, abrir, fechar, instalar } = useInstall()
  const { pathname } = useLocation()
  const ref = useRef(null)

  useEffect(() => {
    if (podeInstalar && !dispensado && !aberto && pathname === '/') abrir()
  }, [podeInstalar, dispensado, aberto, pathname, abrir])

  useEffect(() => {
    if (aberto) ref.current?.showModal()
  }, [aberto])

  if (!aberto) return null

  return (
    <dialog ref={ref} onCancel={fechar}
      className="m-auto w-[min(92vw,420px)] rounded-2xl border-0 p-5 backdrop:bg-tinta/55">
      <div className="flex items-center gap-3">
        <span className="flex flex-none rounded-xl bg-tinta px-3 py-2.5"><Brand className="block h-6 w-auto" /></span>
        <h2 className="m-0 text-lg font-bold">Instalar o app?</h2>
      </div>
      <p className="mt-3 mb-0 text-sm leading-relaxed text-suave">
        Abre direto da tela inicial, em tela cheia, e continua funcionando sem internet.
      </p>

      {ios ? (
        <>
          <ol className="mt-3 mb-0 grid gap-2 pl-5 text-sm leading-relaxed">
            <li>Toque em <FiShare className="inline align-text-bottom" aria-label="Compartilhar" /> <strong>Compartilhar</strong>, na barra do Safari.</li>
            <li>Escolha <FiPlusSquare className="inline align-text-bottom" aria-hidden /> <strong>Adicionar à Tela de Início</strong>.</li>
          </ol>
          <div className="mt-4 flex">
            <Button variant="primario" className="flex-1" onClick={fechar}>Entendi</Button>
          </div>
        </>
      ) : (
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={fechar}>Agora não</Button>
          <Button variant="primario" className="flex-1" onClick={instalar}><FiDownload aria-hidden /> Instalar</Button>
        </div>
      )}
    </dialog>
  )
}
