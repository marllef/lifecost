import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiEdit2, FiLock, FiPlus, FiTrash2 } from 'react-icons/fi'
import Button from '../components/ui/Button.jsx'
import Field, { inputClass } from '../components/ui/Field.jsx'
import { PRODUCTS, SECTIONS, unidadePadrao } from '../data/products.js'
import { useConfirm } from '../contexts/ConfirmContext.jsx'
import { useCatalogo } from '../stores/catalogo.js'
import { useColetaStore } from '../stores/useColetaStore.js'
import { UNIDADES_FORM, definirProduto } from '../utils/catalogo.js'

const NOVO = 'novo'
const FORM_VAZIO = { nome: '', secao: SECTIONS[0].id, valor: '1', unidade: 'unid' }
const nomeSecao = Object.fromEntries(SECTIONS.map((s) => [s.id, s.nome]))

const formDe = (p) => {
  const { id, valor } = unidadePadrao(p)
  return { nome: p.nome, secao: p.secao, valor: String(valor).replace('.', ','), unidade: id }
}

// Produtos que a pessoa acrescenta à coleta. Os da tabela UCE são fixos: aparecem só para consulta.
export default function ProdutosPage() {
  const confirm = useConfirm()
  const { produtos, adicionais, byId } = useCatalogo()
  const dados = useColetaStore((s) => s.dados)
  const adicionarProduto = useColetaStore((s) => s.adicionarProduto)
  const editarProduto = useColetaStore((s) => s.editarProduto)
  const removerProduto = useColetaStore((s) => s.removerProduto)

  const [editando, setEditando] = useState(null) // null = form fechado, NOVO ou o id do produto
  const [form, setForm] = useState(FORM_VAZIO)
  const [erro, setErro] = useState('')

  const temPrecos = (id) => dados.some((d) => d[id])
  const campo = (nome) => (ev) => setForm((f) => ({ ...f, [nome]: ev.target.value }))
  const abrir = (alvo, inicial) => { setEditando(alvo); setForm(inicial); setErro('') }
  const fechar = () => { setEditando(null); setErro('') }

  const salvar = async (ev) => {
    ev.preventDefault()
    const { produto, erro: msg } = definirProduto(form, produtos, editando === NOVO ? null : editando)
    if (msg) { setErro(msg); return }
    if (editando === NOVO) {
      adicionarProduto(produto)
    } else {
      // Trocar g/ml/unid deixa as quantidades já anotadas sem sentido, então os preços do produto são apagados
      const trocouBase = byId.get(editando).base !== produto.base
      const apagar = trocouBase && temPrecos(editando)
      if (apagar) {
        const ok = await confirm({
          titulo: 'Trocar o tipo de unidade?',
          mensagem: `Os preços já anotados para ${byId.get(editando).nome} serão apagados deste aparelho, porque g, ml e unidades não se convertem entre si.`,
          confirmar: 'Trocar e apagar',
        })
        if (!ok) return
      }
      editarProduto(editando, produto, apagar)
    }
    fechar()
  }

  const remover = async (p) => {
    const ok = await confirm({
      titulo: 'Remover produto?',
      mensagem: temPrecos(p.id)
        ? `${p.nome} sai da lista e os preços anotados nele serão apagados deste aparelho. Exporte a planilha antes se quiser guardá-los.`
        : `${p.nome} sai da lista de coleta.`,
      confirmar: 'Remover',
    })
    if (!ok) return
    removerProduto(p.id)
    if (editando === p.id) fechar()
  }

  return (
    <div className="m-3 grid gap-3.5 rounded-2xl bg-white p-4">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-suave"><FiArrowLeft aria-hidden /> Voltar à lista</Link>
      <h2 className="m-0 text-lg font-bold">Produtos adicionais</h2>
      <p className="m-0 text-sm leading-relaxed text-suave">
        Acrescente produtos que não estão na tabela da UCE. Eles entram na coleta e na planilha, mas ficam fora do total da cesta.
      </p>

      {editando == null && (
        <Button variant="primario" className="py-3" onClick={() => abrir(NOVO, FORM_VAZIO)}><FiPlus aria-hidden /> Adicionar produto</Button>
      )}

      {editando != null && (
        <form onSubmit={salvar} noValidate className="grid gap-3.5 rounded-xl border-[1.5px] border-linha p-3.5">
          <h3 className="m-0 text-base font-bold">{editando === NOVO ? 'Novo produto' : 'Editar produto'}</h3>
          <Field label="Nome">
            <input value={form.nome} onChange={campo('nome')} maxLength={60} autoComplete="off" autoCapitalize="sentences"
              placeholder="Ex.: Queijo coalho" className={inputClass} autoFocus />
          </Field>
          <Field label="Seção">
            <select value={form.secao} onChange={campo('secao')} className={inputClass}>
              {SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </Field>
          <Field as="div" label="Embalagem de referência"
            dica={editando === NOVO ? 'Os preços coletados são convertidos para esta embalagem.' : 'Os preços já anotados são recalculados para a nova embalagem.'}>
            <div className="flex gap-2">
              <input value={form.valor} onChange={(ev) => setForm((f) => ({ ...f, valor: ev.target.value.replace(/[^\d.,]/g, '') }))}
                inputMode="decimal" aria-label="Quantidade da embalagem" className={`${inputClass} flex-1 font-semibold`} />
              <select value={form.unidade} onChange={campo('unidade')} aria-label="Unidade da embalagem"
                className="min-h-[46px] flex-none rounded-xl border-[1.5px] border-linha bg-white px-3 text-lg focus:border-tinta focus:outline-none">
                {UNIDADES_FORM.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
          </Field>
          {erro && <p role="alert" className="m-0 text-sm font-semibold text-perigo">{erro}</p>}
          <div className="flex gap-2">
            <Button className="flex-1 py-3" onClick={fechar}>Cancelar</Button>
            <Button type="submit" variant="primario" className="flex-1 py-3">Salvar</Button>
          </div>
        </form>
      )}

      {adicionais.length === 0 ? (
        <p className="m-0 text-sm text-suave">Nenhum produto adicional ainda.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {adicionais.map((p) => (
            <li key={p.id} className="flex items-center gap-2 border-b border-linha py-2.5 last:border-b-0">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{p.nome}</span>
                <span className="truncate text-[.8rem] text-suave">{nomeSecao[p.secao]} · {p.label}</span>
              </span>
              <button type="button" onClick={() => abrir(p.id, formDe(p))} aria-label={`Editar ${p.nome}`}
                className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-linha bg-white text-tinta">
                <FiEdit2 aria-hidden />
              </button>
              <button type="button" onClick={() => remover(p)} aria-label={`Remover ${p.nome}`}
                className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-xl border-[1.5px] border-perigo/30 bg-white text-perigo">
                <FiTrash2 aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <details className="rounded-xl bg-fundo px-3.5 py-3">
        <summary className="cursor-pointer text-sm font-semibold">Produtos da tabela UCE ({PRODUCTS.length})</summary>
        <p className="mt-2 mb-0 flex items-center gap-1.5 text-[.8rem] text-suave"><FiLock aria-hidden /> Fixos: não podem ser editados nem removidos.</p>
        <ul className="m-0 mt-2 list-none p-0">
          {PRODUCTS.map((p) => (
            <li key={p.id} className="flex justify-between gap-3 border-b border-linha py-1.5 text-sm last:border-b-0">
              <span className="min-w-0 truncate">{p.nome}</span>
              <span className="flex-none text-suave">{p.label}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
