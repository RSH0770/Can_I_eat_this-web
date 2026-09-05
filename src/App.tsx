import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PhoneFrame } from './layouts/PhoneFrame.tsx';
import { MainLayout } from './layouts/MainLayout.tsx';
import { Splash } from './features/auth/Splash.tsx';
import { Login } from './features/auth/Login.tsx';
import { FindAccount } from './features/auth/FindAccount.tsx';
import { Signup } from './features/auth/Signup.tsx';
import { Home } from './features/home/Home.tsx';
import { FoodList } from './features/home/FoodList.tsx';
import { FoodRestaurants } from './features/home/FoodRestaurants.tsx';
import { RestaurantDetail } from './features/restaurant/RestaurantDetail.tsx';
import { MapPage } from './features/map/MapPage.tsx';
import { Me } from './features/profile/Me.tsx';
import { NotFound } from './features/notFound/NotFound.tsx';

export default function App() {
  return (
    <PhoneFrame>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/find-account" element={<FindAccount />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/home/foods" element={<FoodList />} />
            <Route path="/home/foods/:foodId" element={<FoodRestaurants />} />
            <Route path="/restaurants/:restaurantId" element={<RestaurantDetail />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/me" element={<Me />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </PhoneFrame>
  );
}