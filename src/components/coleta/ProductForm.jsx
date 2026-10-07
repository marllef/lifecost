import { useEffect, useMemo, useRef, useState } from 'react'
import { FiAlertTriangle, FiChevronLeft, FiChevronRight, FiMessageSquare, FiSlash, FiTrash2 } from 'react-icons/fi'
import { unidadePadrao, unidadesDe } from '../../data/products.js'
import { useColetaStore } from '../../stores/useColetaStore.js'
import { brl, compute, emptyEntry, qtdBase, qtdTexto } from '../../utils/calc.js'
import { exibirPreco, mascaraPreco, soNumero } from '../../utils/text.js'
import Button from '../ui/Button.jsx'
import Field, { inputClass } from '../ui/Field.jsx'
import CompareBox from './CompareBox.jsx'

// Um produto por vez: preço e quantidade primeiro; marca e observação são opcionais.
// A observação fica escondida até tocar em "Observação". Enter passa de um campo ao outro e, no último, ao próximo produto.
export default function ProductForm({ produto: p, estab, posicao, progresso, primeiro, onProximo, onVoltar }) {
  const entry = useColetaStore((s) => s.dados[estab][p.id])
  const dados = useColetaStore((s) => s.dados)
  const atualizar = useColetaStore((s) => s.atualizar)
  const limpar = useColetaStore((s) => s.limpar)

  const e = { ...emptyEntry(), ...entry }
  const r = compute(p, e)
  const onChange = (patch) => atualizar(estab, p.id, patch)
  const [obsAberta, setObsAberta] = useState(() => Boolean(e.obs?.trim()))

  const marcaRef = useRef(null)
  const obsRef = useRef(null)
  const focarObs = useRef(false)
  const qtdRef = useRef(null)
  const precoRef = useRef(null)
  const unidades = unidadesDe(p)
  const padrao = unidadePadrao(p)
  const unidadeId = e.unidade || padrao.id

  useEffect(() => { precoRef.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => { if (obsAberta && focarObs.current) obsRef.current?.focus() }, [obsAberta])

  // Abre o campo; com o campo aberto e vazio, esconde de novo; com texto, só leva o cursor até ele
  const alternarObs = () => {
    if (!obsAberta) { focarObs.current = true; setObsAberta(true) }
    else if (!e.obs.trim()) setObsAberta(false)
    else obsRef.current?.focus()
  }

  // Marcas já anotadas para este produto, para sugerir ao digitar
  const marcas = useMemo(() => {
    const set = new Set()
    dados.forEach((d) => { const m = d[p.id]?.marca?.trim(); if (m) set.add(m) })
    return [...set]
  }, [dados, p.id])

  // Quantidade muito diferente da tabela costuma ser unidade trocada (250 L em vez de 250 ml)
  const q = qtdBase(p, e)
  const suspeita = q != null && (q / p.qtd > 20 || q / p.qtd < 0.05)

  const enter = (prox) => (ev) => {
    if (ev.key !== 'Enter') return
    ev.preventDefault()
    prox()
  }

  return (
    <article className="flex flex-1 flex-col bg-white">
      <div role="progressbar" aria-label="Progresso da seção" aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={Math.round(progresso * 100)} className="h-1 bg-linha">
        <span className="block h-full bg-ok transition-[width] duration-300" style={{ width: `${progresso * 100}%` }} />
      </div>
      <div className="flex-1 px-4 pt-3.5 pb-4">
        <p className="m-0 text-[.82rem] font-semibold text-suave">{posicao}</p>
        <h2 className="mt-0.5 mb-0 text-[1.7rem] leading-[1.15] font-bold tracking-tight">{p.nome}</h2>
        <p className="mt-1 mb-0 text-[.92rem] text-suave">Embalagem da tabela: <strong className="text-tinta">{p.label}</strong></p>

        <CompareBox produto={p} estab={estab} />

        <div className="grid grid-cols-1 gap-3.5 pt-4">
          <Field label="Preço">
            <div className={`flex w-full min-w-0 items-center rounded-xl border-[1.5px] border-linha pl-3 focus-within:border-tinta ${
              e.naoEncontrado ? 'bg-fundo' : 'bg-white'}`}>
              <em className="flex-none font-semibold text-suave not-italic">R$</em>
              <input ref={precoRef} size={1} inputMode="numeric" placeholder="0,00" value={exibirPreco(e.preco)} disabled={e.naoEncontrado}
                enterKeyHint="next" onChange={(ev) => onChange({ preco: mascaraPreco(ev.target.value) })}
                onKeyDown={enter(() => qtdRef.current?.focus())}
                className="w-full min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-3 pl-2 text-[1.4rem] font-bold tabular-nums focus:outline-none disabled:text-[#A3AEB2]" />
            </div>
          </Field>

          <Field as="div" label="Quantidade da embalagem" dica={`Em branco = ${p.label}, igual à tabela.`}>
            <div className="flex gap-2">
              <input ref={qtdRef} inputMode="decimal" placeholder={String(padrao.valor).replace('.', ',')}
                aria-label="Quantidade da embalagem" value={e.qtd} disabled={e.naoEncontrado} enterKeyHint="next"
                className={`${inputClass} flex-1 font-semibold`}
                onChange={(ev) => onChange({ qtd: soNumero(ev.target.value) })}
                onKeyDown={enter(() => marcaRef.current?.focus())} />
              <div role="group" aria-label="Unidade" className="flex flex-none overflow-hidden rounded-xl border-[1.5px] border-linha">
                {unidades.map((u) => (
                  <button key={u.id} type="button" disabled={e.naoEncontrado} onClick={() => onChange({ unidade: u.id })}
                    className={`min-h-[46px] cursor-pointer border-0 px-4 text-[.95rem] disabled:opacity-50 not-first:border-l-[1.5px] not-first:border-linha ${
                      unidadeId === u.id ? 'bg-tinta text-white' : 'bg-white'}`}>
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          {r.foiConvertido && (
            <p className="m-0 rounded-xl bg-[#FEF1E2] px-3 py-2.5 text-[.9rem] leading-snug">
              R$ {brl(r.preco)} por {qtdTexto(p, e)} equivale a <strong>R$ {brl(r.convertido)}</strong> por {p.label}
            </p>
          )}
          {suspeita && (
            <p className="m-0 flex items-start gap-2 rounded-xl bg-[#FCE3CC] px-3 py-2.5 text-[.9rem] leading-snug font-semibold text-[#8A4A0C]">
              <FiAlertTriangle className="mt-0.5 flex-none" aria-hidden />
              Confira a unidade: {qtdTexto(p, e)} é muito diferente de {p.label}.
            </p>
          )}
          {r.pendente && (
            <p className="m-0 rounded-xl bg-[#FEF1E2] px-3 py-2.5 text-[.9rem]">Quantidade inválida. Corrija ou deixe em branco.</p>
          )}

          <Field label="Marca (opcional)">
            <input ref={marcaRef} list="marcas" placeholder="Ex.: Camil" value={e.marca} disabled={e.naoEncontrado}
              autoCapitalize="words" autoComplete="off" enterKeyHint="done" className={inputClass}
              onChange={(ev) => onChange({ marca: ev.target.value })}
              onKeyDown={enter(() => (obsAberta ? obsRef.current?.focus() : onProximo()))} />
            <datalist id="marcas">{marcas.map((m) => <option key={m} value={m} />)}</datalist>
          </Field>

          <div className="flex flex-wrap gap-2">
            <Button variant={e.naoEncontrado ? 'ativo' : 'secundario'} onClick={() => onChange({ naoEncontrado: !e.naoEncontrado })}>
              <FiSlash aria-hidden /> {e.naoEncontrado ? 'Desfazer não encontrado' : 'Não encontrado'}
            </Button>
            <Button variant={obsAberta ? 'ativo' : 'secundario'} aria-expanded={obsAberta} onClick={alternarObs}>
              <FiMessageSquare aria-hidden /> Observação
            </Button>
            <Button onClick={() => limpar(estab, p.id)}><FiTrash2 aria-hidden /> Limpar</Button>
          </div>

          {obsAberta && (
            <Field label="Observação (opcional)">
              <input ref={obsRef} placeholder="Ex.: promoção, embalagem danificada" value={e.obs} autoComplete="off"
                enterKeyHint="done" className={inputClass}
                onChange={(ev) => onChange({ obs: ev.target.value })}
                onKeyDown={enter(onProximo)} />
            </Field>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 grid grid-cols-[1fr_2fr] gap-2 border-t border-linha bg-white px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <Button className="py-[15px] text-[1.05rem] font-bold" onClick={onVoltar} disabled={primeiro}>
          <FiChevronLeft aria-hidden /> Voltar
        </Button>
        <Button variant="primario" className="py-[15px] text-[1.05rem] font-bold" onClick={onProximo}>
          Próximo <FiChevronRight aria-hidden />
        </Button>
      </div>
    </article>
  )
}
