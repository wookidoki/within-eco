# Within - 경기도 환경 탐험 플랫폼

경기도 지역의 환경 관련 명소를 탐험하고 스탬프를 수집하는 웹 애플리케이션

## 기술 스택

### Frontend
- React 18 + Vite
- Google Maps API
- Styled Components

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Google OAuth 2.0

### Infrastructure
- Docker / Docker Compose
- Nginx

## 주요 기능

- Google 소셜 로그인
- 경기도 환경 명소 지도
- 스탬프 수집 시스템
- 사용자 진행상황 저장
- 대기질/기후 정보 연동

## 실행 방법

### 사전 요구사항
- Docker Desktop
- Node.js 18+
- Google Cloud Console 설정 (OAuth)

### 개발 환경 실행

```bash
# 환경 변수 설정
cp .env.example .env
cp server/.env.example server/.env

# Docker 컨테이너 시작
docker compose up -d

# 백엔드 실행
cd server && npm install && npm run dev

# 프론트엔드 실행 (새 터미널)
npm install && npm run dev
```

### 접속
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## 문서

- [설정 가이드](SETUP.md)
- [배포 가이드](DEPLOY.md)
- [ERD](docs/ERD.md)

## Author

이성욱 (Lee Seongwook)
