import { RouterProvider } from 'react-router';
import { StoreProvider } from './context/StoreContext';
import { AdminProvider } from './context/AdminContext';
import { router } from './routes';

export default function App() {
  return (
    <AdminProvider>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </AdminProvider>
  );
}
