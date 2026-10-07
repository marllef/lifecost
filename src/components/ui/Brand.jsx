// Marca do app: só a etiqueta amarela com "R$", desenhada em SVG (sem imagem). O furo e o texto usam a cor da tinta.
export default function Brand({ className = '' }) {
  return (
    <svg viewBox="120 176 272 160" role="img" aria-label="Custo de vida" className={className}>
      <path d="M120 176h196l76 80-76 80H120z" className="fill-etiqueta" />
      <circle cx="300" cy="256" r="16" className="fill-tinta" />
      <text x="150" y="276" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="64" className="fill-tinta">R$</text>
    </svg>
  )
}
