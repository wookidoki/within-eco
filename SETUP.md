# Within 서비스 설정 가이드

## 아키텍처 변경 사항
- **기존**: Supabase (클라우드) + 카카오 OAuth
- **변경**: Docker PostgreSQL (자체 호스팅) + Google OAuth

---

## 1. 사전 요구사항

### Docker Desktop 설치
- Windows: https://docs.docker.com/desktop/install/windows-install/
- macOS: https://docs.docker.com/desktop/install/mac-install/

### Google Cloud Console 설정
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스** > **사용자 인증 정보** 이동
4. **사용자 인증 정보 만들기** > **OAuth 클라이언트 ID**
5. 애플리케이션 유형: **웹 애플리케이션**
6. 승인된 리디렉션 URI 추가:
   ```
   http://localhost:8000/api/auth/google/callback
   ```
7. 클라이언트 ID와 클라이언트 보안 비밀번호 복사

---

## 2. 환경 설정

### server/.env 수정
```env
# Google OAuth 설정
GOOGLE_CLIENT_ID=실제-클라이언트-ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=실제-클라이언트-시크릿
```

---

## 3. 서비스 실행

### Step 1: Docker 컨테이너 시작
```bash
# 프로젝트 루트에서
docker compose up -d
```

컨테이너 확인:
- **PostgreSQL**: localhost:5432
- **pgAdmin** (선택): localhost:5050 (admin@within.local / admin123)

### Step 2: 백엔드 서버 시작
```bash
cd server
npm install
npm run dev
```

서버 확인: http://localhost:8000/api/health

### Step 3: 프론트엔드 시작
```bash
# 프로젝트 루트에서
npm run dev
```

프론트엔드: http://localhost:5173

---

## 4. ERD (데이터베이스 구조)

```
┌─────────────────────────────────────────────────────────────────┐
│                         users                                    │
├─────────────────────────────────────────────────────────────────┤
│ id           │ UUID (PK)        │ 사용자 고유 ID                  │
│ google_id    │ VARCHAR(255)     │ Google OAuth sub               │
│ email        │ VARCHAR(255)     │ 이메일 (유니크)                  │
│ name         │ VARCHAR(255)     │ 표시 이름                       │
│ avatar_url   │ TEXT             │ 프로필 이미지 URL               │
│ created_at   │ TIMESTAMP        │ 가입일                          │
│ last_login_at│ TIMESTAMP        │ 마지막 로그인                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1:1
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      user_progress                               │
├─────────────────────────────────────────────────────────────────┤
│ id           │ UUID (PK)        │ 진행상황 ID                     │
│ user_id      │ UUID (FK)        │ 사용자 참조                     │
│ level        │ INTEGER          │ 현재 레벨                       │
│ xp           │ INTEGER          │ 경험치                          │
│ total_stamps │ INTEGER          │ 총 스탬프 수                    │
│ unlocked_spots│ JSONB           │ 해금된 스팟 ID 배열              │
│ updated_at   │ TIMESTAMP        │ 마지막 업데이트                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1:N
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      visit_history                               │
├─────────────────────────────────────────────────────────────────┤
│ id           │ UUID (PK)        │ 방문 기록 ID                    │
│ user_id      │ UUID (FK)        │ 사용자 참조                     │
│ spot_id      │ VARCHAR(100)     │ 스팟 ID                         │
│ spot_name    │ VARCHAR(255)     │ 스팟 이름                       │
│ category     │ VARCHAR(50)      │ 카테고리                        │
│ visited_at   │ TIMESTAMP        │ 방문 시간                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        sessions                                  │
├─────────────────────────────────────────────────────────────────┤
│ id           │ UUID (PK)        │ 세션 ID                         │
│ user_id      │ UUID (FK)        │ 사용자 참조                     │
│ access_token │ TEXT             │ JWT 토큰                        │
│ expires_at   │ TIMESTAMP        │ 만료 시간                       │
│ is_valid     │ BOOLEAN          │ 유효 여부                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/auth/google` | Google 로그인 URL 반환 |
| GET | `/api/auth/google/callback` | OAuth 콜백 (자동 리다이렉트) |
| GET | `/api/auth/user` | 현재 사용자 정보 |
| POST | `/api/auth/logout` | 로그아웃 |
| POST | `/api/auth/sync-progress` | 게임 진행상황 저장 |
| GET | `/api/auth/load-progress` | 게임 진행상황 로드 |

---

## 6. 문제 해결

### Docker 컨테이너가 시작되지 않는 경우
```bash
# 로그 확인
docker compose logs postgres

# 컨테이너 재시작
docker compose down
docker compose up -d
```

### PostgreSQL 연결 오류
```bash
# 컨테이너 상태 확인
docker ps

# 직접 연결 테스트
docker exec -it within-db psql -U within_user -d within_db
```

### Google OAuth 오류
1. 리디렉션 URI가 정확히 일치하는지 확인
2. 클라이언트 ID/Secret이 올바른지 확인
3. Google Cloud Console에서 OAuth 동의 화면이 설정되어 있는지 확인

---

## 7. 배포 시 고려사항

### 환경 변수 변경
```env
# 운영 환경
FRONTEND_URL=https://your-domain.com
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
JWT_SECRET=매우-긴-랜덤-문자열-반드시-변경
DB_PASSWORD=강력한-비밀번호-반드시-변경
```

### SSL/HTTPS 설정
- Google OAuth는 운영 환경에서 HTTPS가 필수
- Nginx 또는 Cloudflare 등으로 SSL 설정 필요
