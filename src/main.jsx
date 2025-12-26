import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import './scss/index.scss'
import App from './App'

createRoot(document.getElementById('root')).render(
  <App />
)
