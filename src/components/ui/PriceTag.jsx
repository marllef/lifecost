import { brl } from '../../utils/calc.js'

const BASE = 'relative flex-none text-right [clip-path:polygon(10px_0,100%_0,100%_100%,10px_100%,0_50%)]'

// Etiqueta de preço no estilo de gôndola; mostra o preço já convertido para a embalagem da tabela
export default function PriceTag({ r, entry }) {
  if (entry?.naoEncontrado)
    return <span className={`${BASE} min-w-[84px] bg-[#E7EBE9] py-[7px] pr-2.5 pl-[18px] text-[.78rem] font-semibold text-suave`}>Não encontrado</span>
  if (r.pendente)
    return <span className={`${BASE} min-w-[84px] bg-[#FCE3CC] py-[7px] pr-2.5 pl-[18px] text-[.78rem] font-semibold text-[#8A4A0C]`}>Falta qtd</span>
  if (r.convertido == null)
    return <span className={`${BASE} min-w-[84px] bg-[#EEF1EF] py-[5px] pr-2.5 pl-[18px] text-[1.05rem] text-[#A3AEB2]`}>—</span>
  return (
    <span className={`${BASE} min-w-[84px] ${r.foiConvertido ? 'bg-conv' : 'bg-etiqueta'} py-[5px] pr-2.5 pl-[18px] text-[1.05rem] font-extrabold tracking-tight tabular-nums text-tinta before:absolute before:top-1/2 before:left-[7px] before:-mt-[2.5px] before:size-[5px] before:rounded-full before:bg-white before:content-['']`}>
      <small className="mr-[3px] text-[.65em] font-bold">R$</small>{brl(r.convertido)}
    </span>
  )
}
