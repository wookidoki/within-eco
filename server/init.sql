-- =============================================
-- Within (Re:Earth) Database Schema
-- Google OAuth + 게임 진행상황 저장
-- =============================================

-- Extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS 테이블 (Google OAuth 사용자)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE NOT NULL,          -- Google OAuth sub claim
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    locale VARCHAR(10) DEFAULT 'ko',

    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 상태
    is_active BOOLEAN DEFAULT true
);

-- 인덱스
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- 2. USER_PROGRESS 테이블 (게임 진행상황)
-- =============================================
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 레벨 시스템
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 100,
    total_stamps INTEGER DEFAULT 0,

    -- 게임 상태
    has_completed_onboarding BOOLEAN DEFAULT false,
    active_category VARCHAR(50) DEFAULT 'ALL',
    active_region VARCHAR(50) DEFAULT 'ALL',

    -- 해금된 스팟 (JSON 배열)
    unlocked_spots JSONB DEFAULT '[]'::jsonb,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_user_progress UNIQUE(user_id)
);

-- 인덱스
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);

-- =============================================
-- 3. VISIT_HISTORY 테이블 (방문 기록)
-- =============================================
CREATE TABLE visit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spot_id VARCHAR(100) NOT NULL,
    spot_name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    region VARCHAR(50),

    -- 방문 정보
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 위치 정보 (선택적)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- 인덱스
CREATE INDEX idx_visit_history_user_id ON visit_history(user_id);
CREATE INDEX idx_visit_history_spot_id ON visit_history(spot_id);
CREATE INDEX idx_visit_history_visited_at ON visit_history(visited_at DESC);

-- =============================================
-- 4. SESSIONS 테이블 (인증 세션)
-- =============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 토큰 정보
    access_token TEXT NOT NULL,
    refresh_token TEXT,

    -- 만료 시간
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 메타데이터
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 상태
    is_valid BOOLEAN DEFAULT true
);

-- 인덱스
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_access_token ON sessions(access_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- =============================================
-- 5. SPOTS 테이블 (선택적 - 스팟 데이터 캐시)
-- =============================================
CREATE TABLE spots (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    region VARCHAR(50),
    district VARCHAR(100),
    address TEXT,

    -- 위치
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- 추가 정보
    description TEXT,
    image_url TEXT,
    priority INTEGER DEFAULT 0,

    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_spots_category ON spots(category);
CREATE INDEX idx_spots_region ON spots(region);
CREATE INDEX idx_spots_priority ON spots(priority DESC);

-- =============================================
-- 트리거: updated_at 자동 갱신
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spots_updated_at
    BEFORE UPDATE ON spots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 뷰: 사용자 전체 정보
-- =============================================
CREATE VIEW user_full_info AS
SELECT
    u.id,
    u.google_id,
    u.email,
    u.name,
    u.avatar_url,
    u.created_at,
    u.last_login_at,
    p.level,
    p.xp,
    p.total_stamps,
    p.has_completed_onboarding,
    jsonb_array_length(COALESCE(p.unlocked_spots, '[]'::jsonb)) as unlocked_count
FROM users u
LEFT JOIN user_progress p ON u.id = p.user_id;

-- =============================================
-- 6. ADMINS 테이블 (관리자)
-- =============================================
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',  -- 'superadmin', 'admin', 'moderator'
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admins_username ON admins(username);

-- 관리자 세션 테이블
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT true
);

CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);

-- =============================================
-- 초기 데이터
-- =============================================
-- 기본 관리자 계정 (비밀번호: admin123 - SHA256 해시)
-- 실제 운영시 비밀번호 변경 필수!
INSERT INTO admins (username, password_hash, email, name, role)
VALUES ('admin', '240be518fabd2724ddb6f04eeb9d5b60fa5b7b96e5decfd4ae7d3e4b93e8b6b6', 'admin@within.local', '관리자', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- 권한 설정
-- =============================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO within_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO within_user;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'Within Database initialized successfully!';
END $$;
