/**
 * @file main.jsx
 * @description Entry point for the EduSphere LMS Frontend React Application.
 * @author Nameet Mandwal (https://github.com/ThenamXe0n)
 * @copyright Copyright (c) 2026 Nameet Mandwal. All rights reserved.
 * @license Proprietary / All Rights Reserved
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
