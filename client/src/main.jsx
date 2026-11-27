import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const savedTheme = localStorage.getItem('theme')
document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark'
document.documentElement.style.colorScheme = savedTheme === 'light' ? 'light' : 'dark'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)