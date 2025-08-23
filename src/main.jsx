import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import MainApp from './MainApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)