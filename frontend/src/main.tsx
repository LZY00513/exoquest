import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 设置认证token（演示用）
if (!localStorage.getItem('auth_token')) {
  localStorage.setItem('auth_token', 'demo-token-' + Date.now());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
