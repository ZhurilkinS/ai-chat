import { BrowserRouter, HashRouter, Route, Routes } from 'react-router'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const RouterComponent = import.meta.env.VITE_BASE_URL ? HashRouter : BrowserRouter

export function Router() {
  return (
    <RouterComponent>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </RouterComponent>
  )
}
