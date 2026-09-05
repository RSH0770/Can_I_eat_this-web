import { Outlet } from "react-router-dom";
import { BottomNav } from "../components/navBar/BottomNav.tsx";

export function MainLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
