import { Navigate, createHashRouter } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import ColetaLayout from '../components/layout/ColetaLayout.jsx'
import AjustesPage from '../pages/AjustesPage.jsx'
import ColetaPage from '../pages/ColetaPage.jsx'
import FimPage from '../pages/FimPage.jsx'
import ListaPage from '../pages/ListaPage.jsx'

// A tela inicial é a lista de produtos; a coleta (um produto por vez) abre em /coleta.
// HashRouter: funciona no GitHub Pages e offline, sem precisar de redirecionamento no servidor
export const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      {
        element: <ColetaLayout />,
        children: [
          { path: '/', element: <ListaPage /> },
          { path: '/coleta', element: <ColetaPage /> },
          { path: '/fim', element: <FimPage /> },
        ],
      },
      { path: '/lista', element: <Navigate to="/" replace /> },
      { path: '/ajustes', element: <AjustesPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
