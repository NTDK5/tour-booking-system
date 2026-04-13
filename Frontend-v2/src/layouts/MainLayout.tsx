import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { PageTransition } from '@/components/layout/PageTransition';

export function MainLayout() {
    return (
        <>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow pt-20">
                    <PageTransition>
                        <Outlet />
                    </PageTransition>
                </main>
                <Footer />
            </div>
        </>
    );
}
