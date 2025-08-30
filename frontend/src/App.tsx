import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import MenuManagement from './pages/MenuManagement'
import OrderManagement from './pages/OrderManagement'
import RestaurantSetup from './pages/RestaurantSetup'
import './App.css'

function App() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<RestaurantSetup />} />
        
        {/* Protected routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" element={<OrderManagement />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
