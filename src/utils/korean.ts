// 디자인 원본의 jo()/hasFinal() — 받침 유무에 따라 조사(은/는, 이/가 등)를 맞게 골라 붙이는 헬퍼
// 식당 상세의 "새우는 빼 주세요" / "새우·오징어가 들어갑니다" 같은 자동 생성 문장에 사용됨
export function hasFinal(word: string): boolean {
  const ch = (word || "").trim().slice(-1);
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

// word 뒤에 받침 있으면 withFinal, 없으면 withoutFinal을 붙여 반환.
// 예: jo("새우", "은", "는") → "새우는" / jo("새우·오징어", "이", "가") → "새우·오징어가"
export function jo(
  word: string,
  withFinal: string,
  withoutFinal: string,
): string {
  return word + (hasFinal(word) ? withFinal : withoutFinal);
}
