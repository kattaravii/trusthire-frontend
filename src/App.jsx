import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentPortal from './pages/StudentPortal';
import CompanyPortal from './pages/CompanyPortal';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student" element={<StudentPortal />} />
      <Route path="/company" element={<CompanyPortal />} />
      <Route path="/company-dashboard" element={<CompanyPortal />} />
    </Routes>
  );
}