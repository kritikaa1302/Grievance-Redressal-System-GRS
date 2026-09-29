import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';

const PageLoader = ({ label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }} />
        <span>{label}</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));

// Student Pages
const StudentLogin = lazy(() => import('./pages/student/Login'));
const StudentRegister = lazy(() => import('./pages/student/Register'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const RaiseComplaint = lazy(() => import('./pages/student/RaiseComplaint'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageEntities = lazy(() => import('./pages/admin/ManageEntities'));

// Staff Pages
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, role, loading } = useAuth();
    
    if (loading) {
        return <PageLoader label="Loading system..." />;
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRole && role !== allowedRole) {
        // Redirect to appropriate dashboard based on actual role
        const homeByRole = { admin: '/admin/dashboard', staff: '/staff/dashboard', student: '/student/dashboard' };
        return <Navigate to={homeByRole[role] || '/'} replace />;
    }
    
    return children;
};

// Global Layout to include Navbar
const MainLayout = ({ children }) => (
    <>
        <Navbar />
        {children}
    </>
);

const AppRoutes = () => {
    return (
        <Router>
            <Suspense fallback={<PageLoader label="Loading interface..." />}>
                <Routes>
                    <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                    
                    {/* Auth Routes */}
                    <Route path="/login" element={<MainLayout><StudentLogin /></MainLayout>} />
                    <Route path="/register" element={<MainLayout><StudentRegister /></MainLayout>} />
                    <Route path="/admin/login" element={<MainLayout><AdminLogin /></MainLayout>} />

                    {/* Student Protected Routes */}
                    <Route path="/student/dashboard" element={
                        <ProtectedRoute allowedRole="student">
                            <MainLayout><StudentDashboard /></MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/student/raise-complaint" element={
                        <ProtectedRoute allowedRole="student">
                            <MainLayout><RaiseComplaint /></MainLayout>
                        </ProtectedRoute>
                    } />

                    {/* Admin Protected Routes */}
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRole="admin">
                            <MainLayout><AdminDashboard /></MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/manage-entities" element={
                        <ProtectedRoute allowedRole="admin">
                            <MainLayout><ManageEntities /></MainLayout>
                        </ProtectedRoute>
                    } />

                    {/* Staff Protected Routes */}
                    <Route path="/staff/dashboard" element={
                        <ProtectedRoute allowedRole="staff">
                            <MainLayout><StaffDashboard /></MainLayout>
                        </ProtectedRoute>
                    } />
                    
                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </Router>
    );
};

const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;