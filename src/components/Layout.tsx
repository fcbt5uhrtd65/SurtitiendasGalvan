import { Outlet } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
