import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Spinner } from './components/ui/spinner';

// Lazy-loaded routes for ultra-fast initial page load (<50ms)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const About = lazy(() => import('./pages/About'));
const Terms = lazy(() => import('./pages/Terms'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Help = lazy(() => import('./pages/Help'));
const Plans = lazy(() => import('./pages/Plans'));
const Blog = lazy(() => import('./pages/Blog'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminManagers = lazy(() => import('./pages/admin/AdminManagers'));
const AdminPromoters = lazy(() => import('./pages/admin/AdminPromoters'));
const AdminBatches = lazy(() => import('./pages/admin/AdminBatches'));
const AdminMap = lazy(() => import('./pages/admin/AdminMap'));
const AdminClients = lazy(() => import('./pages/admin/AdminClients'));
const AdminAuditSystem = lazy(() => import('./pages/admin/AdminAuditSystem'));

// Manager pages
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const ManagerPromoters = lazy(() => import('./pages/manager/ManagerPromoters'));
const ManagerBatches = lazy(() => import('./pages/manager/ManagerBatches'));
const ManagerClients = lazy(() => import('./pages/manager/ManagerClients'));
const ManagerMapView = lazy(() => import('./pages/manager/ManagerMapView'));
const ManagerAnalytics = lazy(() => import('./pages/manager/ManagerAnalytics'));
const ManagerChat = lazy(() => import('./pages/manager/ManagerChat'));

// Promoter pages
const PromoterDashboard = lazy(() => import('./pages/promoter/PromoterDashboard'));
const PromoterBatch = lazy(() => import('./pages/promoter/PromoterBatch'));
const PromoterChat = lazy(() => import('./pages/promoter/PromoterChat'));

// Client pages
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));

// Minimalist instant page loader for route transitions
const PageLoader = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
    }}>
        <Spinner size={36} color="#2563eb" />
    </div>
);

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3500,
                        style: {
                            background: '#ffffff',
                            color: '#0f172a',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '14px 18px',
                            fontSize: '0.92rem',
                            fontWeight: '500',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
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
                <Suspense fallback={<PageLoader />}>
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
                            <Route path="batches" element={<AdminBatches />} />
                            <Route path="map" element={<AdminMap />} />
                            <Route path="audit" element={<AdminAuditSystem />} />
                            <Route path="system" element={<AdminAuditSystem />} />
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

                        {/* Client Routes */}
                        <Route path="/client" element={
                            <ProtectedRoute roles={['client']}>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<ClientDashboard />} />
                            <Route path="batches/:id" element={<ManagerBatches />} />
                        </Route>

                        {/* Public Pages */}
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/plans" element={<Plans />} />
                        <Route path="/blog" element={<Blog />} />

                        {/* Catch-all redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
