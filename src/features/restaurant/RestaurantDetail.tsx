import { useParams } from 'react-router-dom';

export function RestaurantDetail() {
  const { restaurantId } = useParams();
  return <div>식당 상세: {restaurantId}</div>;
}