// ProtectedRoute.tsx
// 로그인 안 된 상태로 탭바 화면(홈/지도/식당 상세/주문 카드 등)에 못 들어가게 막는 라우트 가드
// 토큰이 없으면 /login으로 보낸다 — replace를 써서, 로그인 화면에서 브라우저 뒤로가기를 눌러도 보호된 화면으로 다시 못 돌아가게 함
// App.tsx에서 기존 화면들을 감싸는 상위 <Route>로 얹으면 됨
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
