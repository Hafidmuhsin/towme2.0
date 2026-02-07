import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import RegisterCustomer from '@/pages/RegisterCustomer';
import RegisterProvider from '@/pages/RegisterProvider';
import CustomerDashboard from '@/pages/CustomerDashboard';
import ProviderDashboard from '@/pages/ProviderDashboard';

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/register/customer" replace />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/register/provider" element={<RegisterProvider />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        </Routes>
      </Router>
      <ToastContainer theme="dark" />
    </>
  );
}
