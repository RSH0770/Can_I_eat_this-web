import { Outlet } from "react-router-dom";
import { BottomNav } from "../components/navBar/BottomNav.tsx";
import { LocationProvider } from "../context/LocationProvider";
import { RegionPicker } from "../features/location/RegionPicker";

export function MainLayout() {
  return (
    <LocationProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <RegionPicker />
    </LocationProvider>
  );
}
