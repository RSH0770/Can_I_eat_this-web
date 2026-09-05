import { Link } from 'react-router-dom';

export function FoodList() {
  return (
    <div>
      <h1>지역음식 목록</h1>
      <Link to="/home/foods/food-1">순두부 식당 보기</Link>
    </div>
  );
}