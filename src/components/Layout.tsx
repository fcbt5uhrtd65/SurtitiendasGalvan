import { Outlet, useLocation } from 'react-router';
import Header from './Header';
import Footer from './Footer';

const noShell = ['/'];

export default function Layout() {
  const { pathname } = useLocation();
  const bare = noShell.includes(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      {!bare && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!bare && <Footer />}
    </div>
  );
}
