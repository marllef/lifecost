// Campo com rótulo e dica opcional. Quem usa passa o controle (input, grupo de botões...) como filho.
export default function Field({ label, dica, as: Tag = 'label', children }) {
  return (
    <Tag className="grid min-w-0 gap-1.5">
      <span className="text-sm text-suave">{label}</span>
      {children}
      {dica && <small className="text-xs text-suave">{dica}</small>}
    </Tag>
  )
}

export const inputClass =
  'w-full min-w-0 rounded-xl border-[1.5px] border-linha bg-white px-3 py-2.5 text-lg focus:border-tinta focus:outline-none disabled:bg-fundo disabled:text-[#A3AEB2]'
