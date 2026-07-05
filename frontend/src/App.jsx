import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/dashboard/AdminLayout';
import OwnerLayout from './components/dashboard/OwnerLayout';

import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ListPropertyPage from './pages/ListPropertyPage';

import LoginPage from './pages/OwnerLoginPage';
import OwnerRegisterPage from './pages/OwnerRegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerListingsPage from './pages/owner/OwnerListingsPage';
import OwnerImagesPage from './pages/owner/OwnerImagesPage';
import OwnerEditListingPage from './pages/owner/OwnerEditListingPage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';
import OwnerProfilePage from './pages/owner/OwnerProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function DashboardFrame({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/properties" element={<PublicLayout><PropertiesPage /></PublicLayout>} />
          <Route path="/properties/:id" element={<PublicLayout><PropertyDetailPage /></PublicLayout>} />
          <Route path="/list-property" element={<PublicLayout><ListPropertyPage /></PublicLayout>} />

          {/* Auth */}
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/owner/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/owner/register" element={<PublicLayout><OwnerRegisterPage /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
          <Route path="/reset-password" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />

          {/* Owner dashboard */}
          <Route path="/owner" element={
            <DashboardFrame>
              <ProtectedRoute roles={['owner', 'admin']}>
                <OwnerLayout />
              </ProtectedRoute>
            </DashboardFrame>
          }>
            <Route index element={<OwnerDashboard />} />
            <Route path="listings" element={<OwnerListingsPage />} />
            <Route path="listings/:id/edit" element={<OwnerEditListingPage />} />
            <Route path="listings/:id/images" element={<OwnerImagesPage />} />
            <Route path="bookings" element={<OwnerBookingsPage />} />
            <Route path="profile" element={<OwnerProfilePage />} />
          </Route>

          {/* Admin panel */}
          <Route path="/admin" element={
            <DashboardFrame>
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            </DashboardFrame>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <PublicLayout>
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <p className="text-8xl font-black text-gray-100 mb-4">404</p>
                <h1 className="text-2xl font-bold text-ink mb-2">Страницата не постои</h1>
                <p className="text-gray-500 mb-6">Врската може да е погрешна.</p>
                <a href="/" className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold">← Почетна</a>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontSize: '14px', maxWidth: '360px', fontFamily: 'inherit' },
          success: { iconTheme: { primary: '#024fe0', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}
