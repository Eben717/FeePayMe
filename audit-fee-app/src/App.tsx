
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuditFeeProvider } from './context/AuditFeeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <BrowserRouter>
            <AuditFeeProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuditFeeProvider>
        </BrowserRouter>
    );
}

export default App;
