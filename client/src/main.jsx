import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Bootstrap CSS loads FIRST so our custom design system (index.css) can
// override it in the cascade instead of silently losing to it.
// Note: we don't import the Bootstrap JS bundle globally — the only
// Bootstrap JS component this app uses (Carousel) is imported directly
// in src/components/BsCarousel.jsx to avoid running two separate
// Bootstrap module instances that would both try to handle the same
// carousel button clicks.
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
