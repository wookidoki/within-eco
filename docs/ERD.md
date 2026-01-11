# Re:Earth 데이터베이스 ERD

## 개요
경기도 생태탐험 게임화 서비스의 데이터베이스 설계

## ERD 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              auth.users                                      │
│                         (Supabase Auth 내장)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ id (UUID) PK                                                                 │
│ email                                                                        │
│ raw_user_meta_data (카카오 프로필 정보)                                      │
│ created_at                                                                   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   │ 1:1 (트리거로 자동 생성)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              public.users                                    │
│                           (공개 프로필 테이블)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ id (UUID) PK, FK → auth.users.id                                            │
│ email (TEXT)                                                                 │
│ name (TEXT) - 카카오 닉네임                                                  │
│ avatar_url (TEXT) - 카카오 프로필 사진                                       │
│ provider (TEXT) - 'kakao'                                                    │
│ created_at (TIMESTAMPTZ)                                                     │
│ last_login (TIMESTAMPTZ)                                                     │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
            │ 1:1                  │ 1:N                  │ 1:N
            ▼                      ▼                      ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│   user_progress       │ │   unlocked_spots      │ │   visit_history       │
│   (게임 진행상황)     │ │   (해금된 스팟)       │ │   (방문 기록)         │
├───────────────────────┤ ├───────────────────────┤ ├───────────────────────┤
│ id (UUID) PK          │ │ id (UUID) PK          │ │ id (UUID) PK          │
│ user_id (UUID) FK, UQ │ │ user_id (UUID) FK     │ │ user_id (UUID) FK     │
│ level (INT) = 1       │ │ spot_id (TEXT)        │ │ spot_id (TEXT)        │
│ xp (INT) = 0          │ │ unlocked_at           │ │ spot_name (TEXT)      │
│ xp_to_next_level      │ │                       │ │ category (TEXT)       │
│ total_stamps (INT)    │ │ UNIQUE(user_id,       │ │ visited_at            │
│ has_completed_        │ │        spot_id)       │ │ memo (TEXT)           │
│   onboarding          │ │                       │ │ photo_url (TEXT)      │
│ active_category       │ └───────────────────────┘ └───────────────────────┘
│ active_region         │
│ created_at            │         1:N
│ updated_at            │          │
└───────────────────────┘          ▼
                          ┌───────────────────────┐
                          │  user_achievements    │
                          │  (업적/뱃지)          │
                          ├───────────────────────┤
                          │ id (UUID) PK          │
                          │ user_id (UUID) FK     │
                          │ achievement_id (TEXT) │
                          │ achieved_at           │
                          │                       │
                          │ UNIQUE(user_id,       │
                          │        achievement_id)│
                          └───────────────────────┘
```

## 테이블 상세

### 1. users (공개 프로필)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK, auth.users 참조 |
| email | TEXT | 이메일 |
| name | TEXT | 닉네임 (카카오) |
| avatar_url | TEXT | 프로필 사진 URL |
| provider | TEXT | 'kakao' |
| created_at | TIMESTAMPTZ | 가입일 |
| last_login | TIMESTAMPTZ | 최근 로그인 |

### 2. user_progress (게임 진행)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, UNIQUE |
| level | INT | 현재 레벨 (기본: 1) |
| xp | INT | 현재 경험치 |
| xp_to_next_level | INT | 다음 레벨까지 필요 XP |
| total_stamps | INT | 총 수집 스탬프 |
| has_completed_onboarding | BOOL | 온보딩 완료 여부 |
| active_category | TEXT | 현재 선택 카테고리 |
| active_region | TEXT | 현재 선택 지역 |
| created_at | TIMESTAMPTZ | 생성일 |
| updated_at | TIMESTAMPTZ | 수정일 (자동) |

### 3. unlocked_spots (해금 스팟)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| spot_id | TEXT | 스팟 ID (프론트 데이터) |
| unlocked_at | TIMESTAMPTZ | 해금 시간 |

### 4. visit_history (방문 기록)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| spot_id | TEXT | 스팟 ID |
| spot_name | TEXT | 스팟 이름 (기록용) |
| category | TEXT | 카테고리 |
| visited_at | TIMESTAMPTZ | 방문 시간 |
| memo | TEXT | 사용자 메모 (선택) |
| photo_url | TEXT | 사진 URL (선택) |

### 5. user_achievements (업적)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| achievement_id | TEXT | 업적 ID |
| achieved_at | TIMESTAMPTZ | 달성 시간 |

## RLS 정책

모든 테이블에 Row Level Security 적용:
- **SELECT**: 본인 데이터만 조회 가능
- **INSERT**: 본인 데이터만 추가 가능
- **UPDATE**: 본인 데이터만 수정 가능
- **Service Role**: 모든 데이터 관리 가능 (서버용)

## 트리거

1. **handle_new_user**: `auth.users`에 새 사용자 생성 시 → `users` + `user_progress` 자동 생성
2. **update_updated_at**: `user_progress` 수정 시 → `updated_at` 자동 갱신

## 데이터 흐름

```
카카오 로그인
     │
     ▼
auth.users (Supabase Auth)
     │
     │ 트리거 자동 실행
     ▼
public.users + user_progress 생성
     │
     │ 게임 플레이
     ▼
스팟 방문 → unlocked_spots + visit_history 저장
     │
     │ 업적 달성
     ▼
user_achievements 저장
```
