import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { AdminLayout } from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCalendar from '@/pages/admin/AdminCalendar';
import BookingManagementPage from '@/pages/admin/BookingManagementPage';
import LodgeManagementPage from '@/pages/admin/LodgeManagementPage';
import TourManagementPage from '@/pages/admin/TourManagementPage';
import CarManagementPage from '@/pages/admin/CarManagementPage';
import PricingRulesPage from '@/pages/admin/PricingRulesPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import ReportingPage from '@/pages/admin/ReportingPage';
import AuditLogPage from '@/pages/admin/AuditLogPage';
import CustomTripManagementPage from '@/pages/admin/CustomTripManagementPage';
import DestinationManagementPage from '@/pages/admin/DestinationManagementPage';
import HomePage from '@/pages/HomePage';
import ToursPage from '@/pages/ToursPage';
import TourDetailPage from '@/pages/TourDetailPage';
import LodgeDetailPage from '@/pages/LodgeDetailPage';
import BookingPage from '@/pages/BookingPage';
import BookingConfirmationPage from '@/pages/BookingConfirmationPage';
import PaymentRetryPage from '@/pages/PaymentRetryPage';
import ProfilePage from '@/features/dashboard/ProfilePage';
import BookingHistoryPage from '@/features/dashboard/BookingHistoryPage';
import CustomTripRequestDetailPage from '@/features/dashboard/CustomTripRequestDetailPage';
import StaffListPage from '@/features/admin/staff/StaffListPage';
import StaffFormPage from '@/features/admin/staff/StaffFormPage';
import StaffDetailsPage from '@/features/admin/staff/StaffDetailsPage';
import AboutPage from '@/pages/AboutPage';
import GalleryPage from '@/pages/GalleryPage';
import ContactPage from '@/pages/ContactPage';
import CarsPage from '@/pages/CarsPage';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'tours', element: <ToursPage /> },
            { path: 'tours/:id', element: <TourDetailPage /> },
            { path: 'lodges', element: <Navigate to="/lodges/66f580b0768351ca74219746" replace /> },
            { path: 'lodges/:id', element: <LodgeDetailPage /> },
            { path: 'about', element: <AboutPage /> },
            { path: 'gallery', element: <GalleryPage /> },
            { path: 'contact', element: <ContactPage /> },
            { path: 'cars', element: <CarsPage /> },
            {
                path: 'booking/:tourId',
                element: (
                    <ProtectedRoute>
                        <BookingPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'booking/:tourId/confirmation',
                element: (
                    <ProtectedRoute>
                        <BookingConfirmationPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'booking/:tourId/payment-retry',
                element: (
                    <ProtectedRoute>
                        <PaymentRetryPage />
                    </ProtectedRoute>
                )
            },
        ],
    },
    {
        path: '/auth',
        element: <AuthLayout />,
        children: [
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
        ],
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <ProfilePage /> },
            { path: 'bookings', element: <BookingHistoryPage /> },
            { path: 'requests/:bookingId', element: <CustomTripRequestDetailPage /> },
            { path: 'profile', element: <ProfilePage /> },
        ],
    },
    {
        path: '/admin',
        element: (
            <ProtectedRoute adminOnly>
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: 'calendar', element: <AdminCalendar /> },
            { path: 'bookings', element: <BookingManagementPage /> },
            { path: 'lodges', element: <LodgeManagementPage /> },
            { path: 'tours', element: <TourManagementPage /> },
            { path: 'destinations', element: <DestinationManagementPage /> },
            { path: 'custom-trips', element: <CustomTripManagementPage /> },
            { path: 'cars', element: <CarManagementPage /> },
            { path: 'inventory', element: <ReportingPage /> },
            { path: 'financials', element: <PricingRulesPage /> },
            { path: 'users', element: <UserManagementPage /> },
            { path: 'staff', element: <StaffListPage /> },
            { path: 'staff/new', element: <StaffFormPage /> },
            { path: 'staff/:id', element: <StaffDetailsPage /> },
            { path: 'staff/:id/edit', element: <StaffFormPage /> },
            { path: 'logs', element: <AuditLogPage /> },
        ],
    },
]);
