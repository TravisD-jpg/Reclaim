import { Route, Routes } from 'react-router'
import { AppLayout } from './layout/AppLayout'
import { CatalogPage } from './pages/CatalogPage'
import { ClaimsPage } from './pages/ClaimsPage'
import { LostReportsPage } from './pages/LostReportsPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CatalogPage />} />
        <Route path="lost-reports" element={<LostReportsPage />} />
        <Route path="claims" element={<ClaimsPage />} />
      </Route>
    </Routes>
  )
}

export default App
