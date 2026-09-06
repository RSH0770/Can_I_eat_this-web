import { NavLink } from "react-router-dom";
import { useFontScale } from "../../context/FontScaleContext";
import navHome from "../../assets/nav/home.png";
import navMap from "../../assets/nav/map.png";
import navProfile from "../../assets/nav/my.png";

type TabDef = {
  to: string;
  label: string;
  icon: string;
};

const TABS: TabDef[] = [
  { to: "/home", label: "홈", icon: navHome },
  { to: "/map", label: "지도", icon: navMap },
  { to: "/me", label: "내 정보", icon: navProfile },
];

export function BottomNav() {
  const { scale } = useFontScale();
  const hideIcons = scale >= 1.32; // 글자 크기가 1.32배 이상이면 아이콘 숨김

  return (
    <nav
      aria-label="하단 바"
      className="mx-[22px] mb-[10px] flex flex-none items-stretch border-t-2 border-ink"
    >
      {TABS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className="flex-1 no-underline"
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            minHeight: 48,
            padding: "8px 2px 0",
            marginTop: -2,
            background: "none",
            borderTop: isActive
              ? "3px solid var(--color-ink)"
              : "3px solid transparent",
          })}
        >
          {({ isActive }) => (
            <>
              {!hideIcons && (
                <img
                  src={icon}
                  alt=""
                  className="h-[28px] w-auto"
                  style={{ opacity: isActive ? 1 : 0.45 }}
                />
              )}
              <span
                className="text-ink"
                style={{
                  opacity: isActive ? 1 : 0.8,
                  fontWeight: isActive ? 700 : 400,
                  fontSize: isActive ? "1rem" : "0.84375rem",
                }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
