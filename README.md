# 먹어도 돼? (Can I Eat This)

만성질환자를 위한 여행지 지역음식 주문 조율 서비스

## 소개

당뇨·고혈압 등 만성질환이 있는 여행자는 낯선 지역에서 "이 음식을 먹어도 될지", "주문할 때 뭘 빼달라고 해야 할지" 판단하기 어렵고, 식당에 요청하는 것 자체를 부담스러워합니다.

**먹어도 돼?**는 사용자의 질환·주의성분·알레르기 정보를 바탕으로 지역음식점을 추천하고, 식당 직원에게 그대로 보여줄 수 있는 **주문 요청 카드**를 만들어주는 서비스입니다. 방문 후 남기는 제보가 다음 사용자를 위한 정보로 다시 쌓이는 것이 핵심입니다.

## 기술 스택

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v7

## 폴더 구조
```bash
  src/
    features/ # 화면 단위 기능 (예: home/Home.tsx, auth/Login.tsx)
    components/ # 여러 feature가 공유하는 UI 컴포넌트
    context/ # React Context 기반 전역 상태
    layouts/ # 라우트 가드 등 레이아웃 컴포넌트
    types/ # 여러 기능에서 공유하는 타입 정의 (*.types.ts)
```

## 개발 시작하기

```bash
npm install
npm run dev
```

## 브랜치 전략

Git-flow 기반으로 운영합니다.

- `main` — 배포 가능한 안정 버전만 유지
- `develop` — 실제 작업은 모두 이 브랜치에서 진행

모든 작업은 `develop`에서 진행한 뒤, 안정적인 단위가 완성될 때마다 PR을 통해 `main`으로 병합합니다.

## 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다.

| 타입 | 용도 |
|---|---|
| `chore` | 설정, 도구, 빌드 관련 (기능 변화 없음) |
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변화 없는 코드 개선 |

예: `chore: React Router 설치 및 라우팅 구조 설정`, `feat: 로그인 화면 구현`

## 코드 컨벤션

- `App.tsx`는 `export default function App() {...}`, 그 외 모든 컴포넌트 파일은 `export function 컴포넌트명() {...}` (named export)
- 파일명은 컴포넌트명과 동일하게 PascalCase로 작성 (예: `Login.tsx`, `SplashScreen.tsx`)