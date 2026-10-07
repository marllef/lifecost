import { Outlet } from 'react-router-dom'
import SectionChips from '../coleta/SectionChips.jsx'

// Moldura das telas de coleta (/ e /fim): seletor de seção em cima, a tela da rota embaixo
export default function ColetaLayout() {
  return (
    <>
      <SectionChips />
      <Outlet />
    </>
  )
}
