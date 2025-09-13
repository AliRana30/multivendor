import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter} from 'react-router-dom'
import App from './App.jsx'
import {Provider} from 'react-redux'
import Store from '../redux/store.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Provider store={Store}>
    <Toaster/>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </Provider>
  </StrictMode>,
)
