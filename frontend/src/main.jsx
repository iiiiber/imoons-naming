import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/globals.css'

// 部署在子路径 /app/ 下：BrowserRouter 必须知道 basename，否则所有 <Route path="...">
// 都在域名根解析，跟 nginx 代理的 /app/* 路径错位，导致 navigate 跳到错误 URL
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={BASENAME}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
