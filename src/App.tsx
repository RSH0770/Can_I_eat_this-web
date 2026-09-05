import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PhoneFrame } from './layouts/PhoneFrame.tsx';
import { Home } from './features/home/Home.tsx';
import { NotFound } from './features/notFound/NotFound.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <PhoneFrame>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  )
}