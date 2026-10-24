import { Route, Routes } from 'react-router'
import { AppLayout } from './layout/AppLayout'
import { CatalogPage } from './pages/CatalogPage'
import { ClaimsPage } from './pages/ClaimsPage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { ItemFormPage } from './pages/ItemFormPage'
import { LostReportFormPage } from './pages/LostReportFormPage'
import { LostReportsPage } from './pages/LostReportsPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CatalogPage />} />
        <Route path="items/new" element={<ItemFormPage />} />
        <Route path="items/:id" element={<ItemDetailPage />} />
        <Route path="items/:id/edit" element={<ItemFormPage />} />
        <Route path="lost-reports" element={<LostReportsPage />} />
        <Route path="lost-reports/new" element={<LostReportFormPage />} />
        <Route path="claims" element={<ClaimsPage />} />
      </Route>
    </Routes>
  )
}

export default App
