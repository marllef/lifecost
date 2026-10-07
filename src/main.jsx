import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfirmProvider } from './contexts/ConfirmContext.jsx'
import { ConnectivityProvider } from './contexts/ConnectivityContext.jsx'
import { InstallProvider } from './contexts/InstallContext.jsx'
import { UpdateProvider } from './contexts/UpdateContext.jsx'
import { router } from './routes/index.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConnectivityProvider>
      <UpdateProvider>
        <InstallProvider>
          <ConfirmProvider>
            <RouterProvider router={router} />
          </ConfirmProvider>
        </InstallProvider>
      </UpdateProvider>
    </ConnectivityProvider>
  </StrictMode>
)
