import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManagers from './pages/admin/AdminManagers';
import AdminPromoters from './pages/admin/AdminPromoters';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerPromoters from './pages/manager/ManagerPromoters';
import ManagerBatches from './pages/manager/ManagerBatches';
import ManagerClients from './pages/manager/ManagerClients';
import ManagerMapView from './pages/manager/ManagerMapView';
import ManagerAnalytics from './pages/manager/ManagerAnalytics';
import ManagerChat from './pages/manager/ManagerChat';
import PromoterDashboard from './pages/promoter/PromoterDashboard';
import PromoterBatch from './pages/promoter/PromoterBatch';
import PromoterChat from './pages/promoter/PromoterChat';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Help from './pages/Help';
import About from './pages/About';
import Terms from './pages/Terms';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#ffffff',
                            color: '#0f172a',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px',
                            fontSize: '0.95rem',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <Routes>
                    {/* Public Landing Page */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/terms" element={<Terms />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute roles={['admin']}>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="managers" element={<AdminManagers />} />
                        <Route path="promoters" element={<AdminPromoters />} />
                    </Route>

                    {/* Manager Routes */}
                    <Route path="/manager" element={
                        <ProtectedRoute roles={['manager']}>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<ManagerDashboard />} />
                        <Route path="clients" element={<ManagerClients />} />
                        <Route path="promoters" element={<ManagerPromoters />} />
                        <Route path="batches" element={<ManagerBatches />} />
                        <Route path="batches/:id" element={<ManagerBatches />} />
                        <Route path="map" element={<ManagerMapView />} />
                        <Route path="analytics" element={<ManagerAnalytics />} />
                        <Route path="chat" element={<ManagerChat />} />
                    </Route>

                    {/* Promoter Routes */}
                    <Route path="/promoter" element={
                        <ProtectedRoute roles={['promoter']}>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<PromoterDashboard />} />
                        <Route path="batch/:id" element={<PromoterBatch />} />
                        <Route path="chat" element={<PromoterChat />} />
                    </Route>

                    {/* Public Pages (no login required) */}
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/help" element={<Help />} />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
