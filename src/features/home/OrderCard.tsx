import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SectionHeader } from "../../components/SectionHeader";
import { SCREEN_ENTER } from "../../constants/animation";
import { MOCK_ALLERGIES, MOCK_DISEASES } from "../../constants/mockUserProfile";
import { DEFAULT_REQUESTS } from "../../constants/requestOptions";
import AppLogo from "../../assets/AppLogo.png";

const CARD_FONT = '"BookkMyungjo", serif';

type SaveState = "idle" | "saving" | "fail" | "done" | "image";
type OrderCardNavState = { cardMenu?: string; requests?: string[] };

export function OrderCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as OrderCardNavState | null) ?? null;
  // 식당 상세에서 넘어올 때만 채워짐 — 홈에서 바로 열면 둘 다 빈 값.
  const cardMenu: string = navState?.cardMenu ?? "";

  const [requests, setRequests] = useState<string[]>(navState?.requests ?? []);
  const [newRequest, setNewRequest] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const saveTimerRef = useRef<number | undefined>(undefined);
  const savedImgElRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = AppLogo;
    logoImgRef.current = img;
    return () => window.clearTimeout(saveTimerRef.current);
  }, []);

  useEffect(() => {
    if (savedImgElRef.current && savedImage) {
      savedImgElRef.current.src = savedImage;
    }
  }, [savedImage]);

  const hasAllergy = MOCK_ALLERGIES.length > 0;
  const allergyText = hasAllergy
    ? `${MOCK_ALLERGIES.join(" · ")} 알레르기가 있습니다`
    : "";
  const diseaseText = MOCK_DISEASES.length
    ? MOCK_DISEASES.join(" · ")
    : "질환 없음";
  const hasCardMenu = !!cardMenu;
  const noRequests = requests.length === 0;

  // REQUESTS(기본 목록) + 사용자가 직접 적어 넣어서 기본 목록에는 없는 값들
  const requestOpts = DEFAULT_REQUESTS.concat(
    requests.filter((r) => !DEFAULT_REQUESTS.includes(r)),
  ).map((r) => ({
    label: r,
    on: requests.includes(r),
  }));

  function toggleRequest(label: string) {
    setRequests((prev) =>
      prev.includes(label)
        ? prev.filter((r) => r !== label)
        : prev.concat([label]),
    );
  }

  function handleAddRequest() {
    const v = newRequest.trim();
    if (!v) return;
    setRequests((prev) => (prev.includes(v) ? prev : prev.concat([v])));
    setNewRequest("");
  }

  // drawCard() — 카드 내용을 캔버스에 그려 PNG data URL로 반환
  function drawCard(): string | null {
    const W = 380;
    const S = 3;
    const PAD = 20;
    const font = (weight: number, px: number) =>
      `${weight} ${px}px ${CARD_FONT}`;

    const measure = document.createElement("canvas").getContext("2d");
    if (!measure) return null;
    const wrap = (text: string, fontSpec: string, maxW: number) => {
      measure.font = fontSpec;
      const out: string[] = [];
      let line = "";
      text.split(" ").forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (measure.measureText(test).width > maxW && line) {
          out.push(line);
          line = word;
        } else {
          line = test;
        }
      });
      if (line) out.push(line);
      return out;
    };

    const inner = W - PAD * 2;
    const banner = allergyText ? wrap(allergyText, font(700, 24), inner) : [];
    const meta = wrap(diseaseText, font(400, 13), inner);
    const menu = cardMenu ? wrap(cardMenu, font(700, 15), inner) : [];
    const reqs = requests.length ? requests : ["특별한 요청은 없습니다"];
    const reqLines = reqs.map((r) => wrap(r, font(400, 18), inner - 22));
    const foot = [
      "이 손님은 위 재료를 피해야 합니다.",
      "확인이 어려우면 알려 주세요.",
    ];

    const bannerH = banner.length ? 18 + 16 + 8 + banner.length * 33 + 18 : 0;
    let h = bannerH + PAD + meta.length * 19 + menu.length * 22 + 20 + 30 + 14;
    reqLines.forEach((ls) => {
      h += ls.length * 27 + 12;
    });
    h += 16 + Math.max(foot.length * 18, 42) + PAD;

    const cv = document.createElement("canvas");
    cv.width = W * S;
    cv.height = Math.round(h) * S;
    const c = cv.getContext("2d");
    if (!c) return null;
    c.scale(S, S);
    c.textBaseline = "top";

    c.fillStyle = "#f1efea";
    c.fillRect(0, 0, W, h);
    c.strokeStyle = "#1a1815";
    c.lineWidth = 2;
    c.strokeRect(1, 1, W - 2, h - 2);

    let y = 0;
    if (bannerH) {
      c.fillStyle = "#1a1815";
      c.fillRect(2, 2, W - 4, bannerH);
      c.fillStyle = "rgba(241,239,234,.8)";
      c.font = font(400, 12);
      c.fillText("알레르기 — 꼭 확인해 주세요", PAD, 18);
      c.fillStyle = "#f1efea";
      c.font = font(700, 24);
      let by = 18 + 16 + 8;
      banner.forEach((l) => {
        c.fillText(l, PAD, by);
        by += 33;
      });
      y = bannerH;
    }

    y += PAD;
    c.fillStyle = "rgba(26,24,21,.8)";
    c.font = font(400, 13);
    meta.forEach((l) => {
      c.fillText(l, PAD, y);
      y += 19;
    });
    if (menu.length) {
      c.fillStyle = "#1a1815";
      c.font = font(700, 15);
      menu.forEach((l) => {
        c.fillText(l, PAD, y + 4);
        y += 22;
      });
    }
    y += 20;

    c.fillStyle = "#1a1815";
    c.font = font(700, 21);
    c.fillText("이렇게 부탁드립니다", PAD, y);
    const tw = c.measureText("이렇게 부탁드립니다").width;
    c.fillRect(PAD + tw + 10, y + 13, W - PAD * 2 - tw - 10, 2);
    y += 30 + 14;

    reqLines.forEach((ls) => {
      c.fillStyle = "#a6301f";
      c.font = font(700, 13);
      c.fillText("一", PAD, y + 6);
      c.fillStyle = "#1a1815";
      c.font = font(400, 18);
      ls.forEach((l, i) => c.fillText(l, PAD + 22, y + i * 27));
      y += ls.length * 27 + 12;
    });

    y += 16;
    c.fillStyle = "rgba(26,24,21,.2)";
    c.fillRect(PAD, y - 8, inner, 1);
    const logo = logoImgRef.current;
    const ok = !!(logo && logo.complete && logo.naturalWidth);
    const lw = ok
      ? Math.round((38 * logo!.naturalWidth) / logo!.naturalHeight)
      : 0;
    if (ok) c.drawImage(logo!, PAD, y, lw, 38);
    c.fillStyle = "rgba(26,24,21,.8)";
    c.font = font(400, 12);
    const fx = ok ? PAD + lw + 10 : PAD;
    foot.forEach((l) => {
      c.fillText(l, fx, y + 4);
      y += 18;
    });

    return cv.toDataURL("image/png");
  }

  function handleSaveImage() {
    setSaveState("saving");
    let url: string | null = null;
    try {
      url = drawCard();
    } catch {
      // drawCard 실패 시 url은 초기값 null로 그대로 유지됨
    }
    if (!url) {
      setSaveState("fail");
      return;
    }
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = "주문요청카드.png";
      a.click();
    } catch {
      // 다운로드 트리거가 막혀도(브라우저 정책 등) 아래 <img>로는 여전히 보여줄 수 있으니 무시
    }
    setSavedImage(url);
    setSaveState("done");
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => setSaveState("image"), 2200);
  }

  const hasSavedImage =
    !!savedImage && (saveState === "image" || saveState === "done");
  const saveLabel =
    saveState === "saving"
      ? "이미지 만드는 중…"
      : saveState === "done"
        ? "이미지로 저장했습니다"
        : saveState === "fail"
          ? "저장에 실패했습니다 · 다시 시도"
          : "이미지로 저장";

  return (
    <div
      className={`${SCREEN_ENTER} flex h-full flex-col px-[22px] pb-[26px] pt-[58px] text-ink`}
    >
      {/* 상단바 */}
      <div className="mb-[16px] flex flex-none items-center gap-[10px]">
        <div className="flex-1 text-[1.125rem] font-bold">주문 요청 카드</div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="border-0 bg-transparent p-0 text-[0.9375rem] text-ink"
        >
          닫기
        </button>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {/* 카드 박스 */}
        <div
          className="border-2 border-ink"
          style={{
            backgroundColor: "#f1efea",
            backgroundImage:
              "repeating-linear-gradient(92deg, rgba(96,100,96,.055) 0 1px, transparent 1px 5px), repeating-linear-gradient(2deg, rgba(96,100,96,.035) 0 1px, transparent 1px 9px)",
            fontFamily: CARD_FONT,
          }}
        >
          {hasAllergy && (
            <div className="bg-ink px-[18px] py-[16px] text-[#f1efea]">
              <div className="text-xs tracking-[.12em] text-[#f1efea]/80">
                알레르기 — 꼭 확인해 주세요
              </div>
              <div className="mt-[8px] text-[1.5rem] font-bold leading-[1.35]">
                {allergyText}
              </div>
            </div>
          )}

          <div className="p-[18px]">
            <div className="text-xs">{diseaseText}</div>
            {hasCardMenu && (
              <div className="mt-[6px] text-[0.84375rem] font-bold">
                {cardMenu}
              </div>
            )}

            <div className="mb-[14px] mt-[16px] flex items-center gap-[10px]">
              <div className="text-[1.3125rem] font-bold">
                이렇게 부탁드립니다
              </div>
              <div className="h-[2px] flex-1 bg-ink" />
            </div>

            {noRequests ? (
              <p className="m-0 text-[0.84375rem]">
                고른 요청이 없습니다. 아래에서 필요한 것을 고르세요.
              </p>
            ) : (
              <div className="flex flex-col gap-[12px]">
                {requests.map((r) => (
                  <div key={r} className="flex items-baseline gap-[12px]">
                    <span className="flex-none text-[0.8125rem] font-bold text-[#a6301f]">
                      一
                    </span>
                    <span className="text-[1.125rem] leading-[1.55]">{r}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-[20px] flex items-center gap-[10px] border-t border-ink/20 pt-[14px]">
              <img src={AppLogo} alt="" className="h-[38px] w-auto flex-none" />
              <div className="text-xs leading-[1.6]">
                이 손님은 위 재료를 피해야 합니다.
                <br />
                확인이 어려우면 알려 주세요.
              </div>
            </div>
          </div>
        </div>

        <SectionHeader title="저장해 두기" />
        <button
          type="button"
          onClick={handleSaveImage}
          className="w-full border-[1.5px] border-ink bg-transparent p-[12px] text-[0.96875rem] font-bold text-ink"
        >
          {saveLabel}
        </button>
        {hasSavedImage && (
          <div className="mt-[14px] border border-ink/20 p-[12px]">
            <div className="mb-[8px] text-xs text-ink/80">
              길게 눌러 사진첩에 저장할 수도 있습니다.
            </div>
            <img
              ref={savedImgElRef}
              alt="주문 요청 카드 이미지"
              className="block h-auto w-full"
            />
          </div>
        )}

        <SectionHeader title="요청 고르기" />
        <div className="flex flex-col">
          {requestOpts.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => toggleRequest(o.label)}
              className="flex w-full items-center gap-[12px] border-0 bg-transparent px-[2px] py-[11px] text-left text-ink"
            >
              <span
                className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[2px] border-[1.5px] text-[0.75rem] ${
                  o.on
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/30 bg-transparent text-transparent"
                }`}
              >
                ✓
              </span>
              <span className="text-[0.96875rem]">{o.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-[14px] flex items-center gap-[8px] border-b-2 border-ink pb-[6px]">
          <input
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (isComposing || e.nativeEvent.isComposing) return;
              e.preventDefault();
              handleAddRequest();
            }}
            placeholder="직접 적어 넣기"
            className="min-w-0 flex-1 border-0 bg-transparent py-[4px] text-[0.96875rem] text-ink placeholder:text-ink/40"
          />
          <button
            type="button"
            onClick={handleAddRequest}
            disabled={!newRequest.trim()}
            className={`flex-none rounded-[3px] border-0 px-[13px] py-[7px] text-[0.875rem] font-bold ${
              newRequest.trim()
                ? "cursor-pointer bg-ink text-[#f1efea]"
                : "cursor-not-allowed bg-ink/[0.18] text-ink/45"
            }`}
          >
            담기
          </button>
        </div>
        <p className="mb-0 mt-[8px] text-xs leading-[1.6] text-ink/80">
          적어 넣은 요청도 위 목록에 함께 담깁니다.
        </p>
        <div className="h-[10px]" />
      </div>
    </div>
  );
}
