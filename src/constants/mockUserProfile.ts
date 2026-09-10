// TODO: 로그인한 사용자의 실제 프로필(medicalProfileStore)로 교체
// — 아직 회원가입에서 모은 값을 저장하는 로직이 없어 화면들이 각자 하드코딩된 값을 쓰고 있었음.
// Home.tsx가 갖고 있던 ALLERGIES/REQUEST_COUNT를 여기로 옮기고, 지역 음식 목록/상세의 ✕(알레르기)·△(주의 성분)·○(그대로 주문) 판정에 필요한 주의 성분(MOCK_CARES)을 추가함
// 화면마다 따로 목값을 두면 예를 들어 홈에는 "새우 알레르기"라고 떠 있는데 지역 음식 상세에서는 알레르기 경고가 안 뜨는 식으로 어긋날 수 있어서, 한 군데로 모아 공유함
export const MOCK_ALLERGIES = ["새우", "고등어"];

// 당뇨 페르소나 가정 (질환↔주의성분 매핑 기준으로는 당류·정제 탄수화물)
export const MOCK_CARES = ["정제 탄수화물", "당류"];

// 주문 요청 카드(OrderCard)의 "질환" 표시줄(diseaseText)에 쓰임
// MOCK_CARES와 이름이 다른 별개 값이니 혼동 주의. 위 당뇨 페르소나 가정과 맞춰 "당뇨"로 둠
export const MOCK_DISEASES = ["당뇨"];

export const MOCK_REQUEST_COUNT = 2;
