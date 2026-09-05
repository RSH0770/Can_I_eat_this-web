import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div>
      <h1>홈</h1>
      <Link to="/home/foods">지역음식 목록 보기</Link>
    </div>
  );
}