import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import Button from '../components/ui/Button.jsx'
import Field, { inputClass } from '../components/ui/Field.jsx'
import { useConfirm } from '../contexts/ConfirmContext.jsx'
import { useColetaStore } from '../stores/useColetaStore.js'
import { useNavStore } from '../stores/useNavStore.js'
import { FIXOS, letraEstab, nomePadrao } from '../utils/estabs.js'

export default function AjustesPage() {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const estabs = useColetaStore((s) => s.estabs)
  const aplicarEstabs = useColetaStore((s) => s.aplicarEstabs)
  const apagarPrecos = useColetaStore((s) => s.apagarPrecos)

  // Rascunho editável: origem é a posição do estabelecimento hoje (null = recém-adicionado)
  const [lista, setLista] = useState(() => estabs.map((nome, origem) => ({ nome, origem })))

  const renomear = (i, nome) => setLista((l) => l.map((e, j) => (j === i ? { ...e, nome } : e)))
  const adicionar = () => setLista((l) => [...l, { nome: nomePadrao(l.length), origem: null }])
  const remover = (i) => setLista((l) => l.filter((_, j) => j !== i))

  const salvar = async () => {
    const dados = useColetaStore.getState().dados
    const removidos = estabs.map((_, i) => i).filter((i) => !lista.some((e) => e.origem === i))
    const comPrecos = removidos.filter((i) => Object.keys(dados[i] || {}).length > 0)
    if (comPrecos.length) {
      const nomes = comPrecos.map((i) => estabs[i]).join(', ')
      const ok = await confirm({
        titulo: 'Remover estabelecimento?',
        mensagem: `Os preços anotados em ${nomes} serão apagados deste aparelho. Exporte a planilha antes se quiser guardá-los.`,
        confirmar: 'Remover e salvar',
      })
      if (!ok) return
    }

    // O estabelecimento aberto pode mudar de posição (ou ter sido removido)
    const atual = useNavStore.getState().estab
    const novaPosicao = lista.findIndex((e) => e.origem === atual)
    aplicarEstabs(lista)
    useNavStore.getState().reposicionarEstab(Math.max(novaPosicao, 0))
    navigate('/')
  }

  const apagar = async () => {
    const ok = await confirm({
      titulo: 'Apagar todos os preços?',
      mensagem: `Os preços dos ${estabs.length} estabelecimentos serão apagados deste aparelho. Exporte a planilha antes se quiser guardar os dados.`,
      confirmar: 'Apagar tudo',
    })
    if (ok) { apagarPrecos(); navigate('/') }
  }

  return (
    <div className="m-3 grid gap-3.5 rounded-2xl bg-white p-4">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-suave"><FiArrowLeft aria-hidden /> Voltar à lista</Link>
      <h2 className="m-0 text-lg font-bold">Estabelecimentos</h2>

      {lista.map((e, i) => (
        <Field as="div" key={e.origem ?? `novo-${i}`} label={`Estabelecimento ${letraEstab(i)}${i < FIXOS ? '' : ' (adicional)'}`}>
          <div className="flex gap-2">
            <input value={e.nome} aria-label={`Nome do estabelecimento ${letraEstab(i)}`} className={inputClass} onChange={(ev) => renomear(i, ev.target.value)} />
            {i >= FIXOS && (
              <button type="button" onClick={() => remover(i)} aria-label={`Remover ${e.nome || letraEstab(i)}`}
                className="flex-none cursor-pointer rounded-xl border-[1.5px] border-perigo/30 bg-white px-3.5 text-perigo">
                <FiX aria-hidden />
              </button>
            )}
          </div>
        </Field>
      ))}

      <Button onClick={adicionar}><FiPlus aria-hidden /> Adicionar estabelecimento</Button>
      <Button variant="primario" className="py-3" onClick={salvar}>Salvar</Button>
      <Button variant="perigo" className="py-3" onClick={apagar}><FiTrash2 aria-hidden /> Apagar todos os preços</Button>
    </div>
  )
}
