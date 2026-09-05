import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/home', label: '홈' },
  { to: '/map', label: '지도' },
  { to: '/me', label: '내 정보' },
];

export function BottomNav() {
  return (
    <nav style={{ display: 'flex' }}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          style={({ isActive }) => ({
            flex: 1,
            textAlign: 'center',
            padding: '12px 0',
            fontWeight: isActive ? 700 : 400,
          })}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}