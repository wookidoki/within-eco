# 카카오 OAuth 설정 가이드

## 1단계: 카카오 개발자 등록

1. [카카오 개발자 센터](https://developers.kakao.com) 접속
2. 로그인 후 "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 이름: `Re:Earth` (또는 원하는 이름)
4. 사업자명: 본인 이름 또는 팀명

## 2단계: 카카오 로그인 활성화

1. 생성된 앱 클릭 → "카카오 로그인" 메뉴
2. **활성화 설정**: ON
3. **Redirect URI 등록**:
   ```
   https://xqnocwrmyyddrvmkynkn.supabase.co/auth/v1/callback
   ```

## 3단계: 동의항목 설정

1. "카카오 로그인" → "동의항목"
2. 필수 동의:
   - 닉네임: 필수
   - 프로필 사진: 선택
   - 카카오계정(이메일): 필수 (비즈 앱 전환 필요할 수 있음)

## 4단계: 앱 키 확인

1. "앱 설정" → "앱 키"
2. **REST API 키** 복사

## 5단계: Supabase 설정

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → **Authentication** → **Providers**
3. **Kakao** 찾아서 활성화
4. 설정값 입력:
   - **Client ID**: 카카오 REST API 키
   - **Client Secret**: 카카오 "보안" 탭에서 Client Secret 생성 후 입력

## 5단계: 테스트

1. 개발 서버 실행: `npm run dev`
2. 카카오 로그인 버튼 클릭
3. 카카오 로그인 페이지로 리다이렉트 확인
4. 로그인 후 앱으로 돌아오는지 확인

## 문제 해결

### "앱이 비활성화 상태입니다"
- 카카오 개발자 센터에서 앱 활성화 필요
- 개인 개발자는 "팀 관리"에서 팀원 추가 필요할 수 있음

### Redirect URI 불일치
- 카카오 개발자 센터의 Redirect URI와 Supabase URL이 정확히 일치해야 함
- 끝에 슬래시(/) 유무 확인

### CORS 오류
- 카카오 개발자 센터 → "플랫폼" → "Web" 플랫폼 추가
- 사이트 도메인: `http://localhost:5173` 및 배포 도메인 추가
