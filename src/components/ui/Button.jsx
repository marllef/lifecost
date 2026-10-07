const VARIANTES = {
  primario: 'bg-tinta text-white border-tinta',
  secundario: 'bg-white border-linha text-tinta',
  ativo: 'bg-white border-tinta text-tinta',
  perigo: 'bg-white border-perigo/30 text-perigo',
  ok: 'bg-ok text-white border-ok',
}

export default function Button({ variant = 'secundario', className = '', type = 'button', ...props }) {
  return (
    <button type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] px-3.5 py-2.5 text-sm font-semibold disabled:cursor-default disabled:opacity-45 ${VARIANTES[variant]} ${className}`}
      {...props} />
  )
}
