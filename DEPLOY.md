# Within App 배포 가이드

## 배포 옵션

### 옵션 1: Docker 배포 (추천)

1. Docker & Docker Compose 설치
2. 환경변수 설정:
   ```bash
   cp .env.example .env
   # .env 파일 수정
   ```
3. 배포:
   ```bash
   # Linux/Mac
   ./deploy.sh

   # Windows
   deploy.bat
   ```

### 옵션 2: Vercel 배포 (프론트엔드만)

1. Vercel CLI 설치:
   ```bash
   npm i -g vercel
   ```

2. 배포:
   ```bash
   vercel --prod
   ```

3. 환경변수 설정 (Vercel Dashboard):
   - `VITE_GOOGLE_MAPS_API_KEY`
   - `VITE_API_URL` (백엔드 URL)

**주의**: 백엔드는 별도 서버에 배포 필요

### 옵션 3: 수동 배포

#### 프론트엔드

```bash
npm install
npm run build
# dist/ 폴더를 웹서버에 배포
```

#### 백엔드

```bash
cd server
npm install
npm start
```

## 환경변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API 키 | O |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | O |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | O |
| `JWT_SECRET` | JWT 서명 키 (변경 필수) | O |
| `FRONTEND_URL` | 프론트엔드 URL | O |

## 포트

- Frontend: 80 (nginx) / 5173 (dev)
- Backend: 8000

## 헬스체크

```bash
curl http://localhost/api/health
```

## 로그 확인

```bash
# Docker
docker-compose logs -f

# 로컬
# 프론트엔드 콘솔 & 백엔드 터미널 확인
```
