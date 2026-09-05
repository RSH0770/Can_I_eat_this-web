import { useParams, Link } from 'react-router-dom';

export function FoodRestaurants() {
  const { foodId } = useParams();
  return (
    <div>
      <h1>{foodId} 식당 리스트</h1>
      <Link to="/restaurants/rest-1">식당 상세 보기</Link>
    </div>
  );
}