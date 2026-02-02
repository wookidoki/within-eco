/**
 * 랜덤 닉네임 생성기
 * 형용사 + 자연 관련 명사 조합
 */

const ADJECTIVES = [
  '푸른', '맑은', '싱그러운', '청량한', '산뜻한',
  '상쾌한', '건강한', '활기찬', '즐거운', '행복한',
  '용감한', '지혜로운', '빛나는', '따뜻한', '고요한',
  '평화로운', '자유로운', '신비로운', '귀여운', '멋진',
]

const NOUNS = [
  '숲지기', '산책자', '탐험가', '여행자', '수호자',
  '나무꾼', '바람이', '구름이', '햇살이', '별빛이',
  '호수지기', '들꽃이', '청솔모', '다람쥐', '참새',
  '나비', '반딧불이', '이슬이', '풀잎이', '단풍이',
]

/**
 * 랜덤 닉네임 생성
 * @returns {string} 형용사 + 명사 + 숫자 조합
 */
export const generateNickname = () => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const number = Math.floor(Math.random() * 100)

  return `${adjective}${noun}${number}`
}

/**
 * 닉네임 유효성 검사
 * @param {string} nickname
 * @returns {{valid: boolean, error?: string}}
 */
export const validateNickname = (nickname) => {
  if (!nickname || nickname.trim().length === 0) {
    return { valid: false, error: '닉네임을 입력해주세요' }
  }

  if (nickname.length < 2) {
    return { valid: false, error: '닉네임은 2자 이상이어야 합니다' }
  }

  if (nickname.length > 20) {
    return { valid: false, error: '닉네임은 20자 이하여야 합니다' }
  }

  // 특수문자 제한 (한글, 영문, 숫자만 허용)
  const validPattern = /^[가-힣a-zA-Z0-9]+$/
  if (!validPattern.test(nickname)) {
    return { valid: false, error: '한글, 영문, 숫자만 사용 가능합니다' }
  }

  return { valid: true }
}

export default {
  generateNickname,
  validateNickname,
}
