# 카카오 OAuth 설정 가이드

## 개요
Re:Earth 앱에서 카카오 로그인을 사용하기 위한 설정 가이드입니다.

## 1. 카카오 개발자 설정

### 1.1 앱 등록
1. [카카오 개발자](https://developers.kakao.com/) 사이트 접속
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. 앱 이름: `Re:Earth` (또는 원하는 이름)
4. 사업자명: 개인/사업자명 입력

### 1.2 플랫폼 설정
1. 앱 선택 → **플랫폼** 메뉴
2. **Web 플랫폼 등록** 클릭
3. 사이트 도메인 추가:
   - 개발: `http://localhost:5173`
   - 프로덕션: `https://your-domain.com`

### 1.3 카카오 로그인 활성화
1. **카카오 로그인** 메뉴
2. **활성화 설정**: ON
3. **Redirect URI 등록**:
   ```
   https://xqnocwrmyyddrvmkynkn.supabase.co/auth/v1/callback
   ```
   (Supabase 프로젝트 URL + `/auth/v1/callback`)

### 1.4 동의항목 설정
1. **카카오 로그인** → **동의항목**
2. 필수 동의:
   - 닉네임: **필수 동의**
   - 프로필 사진: **선택 동의**
   - 카카오계정(이메일): **선택 동의** (이메일 제공 동의 필요)

### 1.5 앱 키 확인
1. **앱 키** 메뉴에서 확인:
   - **REST API 키**: Supabase에서 사용
   - **JavaScript 키**: 프론트엔드에서 사용 (선택)

---

## 2. Supabase 설정

### 2.1 카카오 Provider 활성화
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → **Authentication** → **Providers**
3. **Kakao** 찾아서 **Enable** 토글 ON

### 2.2 카카오 앱 정보 입력
- **Client ID**: 카카오 REST API 키
- **Client Secret**: 카카오 앱 설정 → 보안 → Client Secret 코드 발급

### 2.3 Redirect URL 확인
Supabase가 제공하는 Redirect URL 복사:
```
https://[PROJECT_REF].supabase.co/auth/v1/callback
```
이 URL을 카카오 개발자 사이트의 Redirect URI에 등록

---

## 3. 환경변수 설정

### 프론트엔드 (.env)
```env
VITE_SUPABASE_URL=https://xqnocwrmyyddrvmkynkn.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 서버 (server/.env)
```env
SUPABASE_URL=https://xqnocwrmyyddrvmkynkn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:5173
```

---

## 4. 데이터베이스 테이블 생성

Supabase SQL Editor에서 `docs/database-schema.sql` 실행:
1. **SQL Editor** 메뉴
2. **New Query**
3. `database-schema.sql` 내용 붙여넣기
4. **Run** 클릭

---

## 5. 테스트

### 5.1 로컬 테스트
```bash
# 프론트엔드
npm run dev

# 서버 (필요시)
cd server && node index.js
```

### 5.2 로그인 플로우 확인
1. http://localhost:5173 접속
2. 온보딩 완료
3. 카카오 로그인 버튼 클릭
4. 카카오 계정으로 로그인
5. 콜백 페이지에서 세션 처리 확인
6. 메인 페이지로 리다이렉트

---

## 트러블슈팅

### "Invalid redirect uri" 에러
- 카카오 개발자 사이트의 Redirect URI가 Supabase URL과 정확히 일치하는지 확인

### "인가코드가 유효하지 않습니다" 에러
- Supabase의 Client ID/Secret이 올바른지 확인
- 카카오 앱의 상태가 "활성화"인지 확인

### 프로필 정보가 안 나옴
- 카카오 동의항목에서 닉네임, 프로필 사진이 동의 항목으로 설정되어 있는지 확인
