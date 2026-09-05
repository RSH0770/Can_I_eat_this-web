import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/navBar/BottomNav.tsx';

export function MainLayout() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}