import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLogo from "../../assets/AppLogo.png";

const SPLASH_DURATION_MS = 3400;
const LEAVE_ANIMATION_MS = 320;

export function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setLeaving(true), SPLASH_DURATION_MS);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const leaveTimer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, LEAVE_ANIMATION_MS);
    return () => clearTimeout(leaveTimer);
  }, [leaving, navigate]);

  return (
    <div
      className={`grid h-full place-items-center ${leaving ? "animate-splash-out" : ""}`}
    >
      <img
        src={AppLogo}
        alt="먹어도 돼?"
        className="h-[168px] w-auto animate-mark-in"
      />
    </div>
  );
}
