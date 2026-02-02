-- =============================================
-- Within (Re:Earth) Database Schema
-- Google OAuth + 게임 진행상황 저장
-- =============================================

-- Extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS 테이블 (Google OAuth 사용자)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    nickname VARCHAR(100),
    avatar_url TEXT,
    locale VARCHAR(10) DEFAULT 'ko',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- 2. USER_PROGRESS 테이블 (게임 진행상황)
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 100,
    total_stamps INTEGER DEFAULT 0,
    has_completed_onboarding BOOLEAN DEFAULT false,
    active_category VARCHAR(50) DEFAULT 'ALL',
    active_region VARCHAR(50) DEFAULT 'ALL',
    unlocked_spots JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_progress UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- =============================================
-- 3. VISIT_HISTORY 테이블 (방문 기록)
-- =============================================
CREATE TABLE IF NOT EXISTS visit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spot_id VARCHAR(100) NOT NULL,
    spot_name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    region VARCHAR(50),
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

CREATE INDEX IF NOT EXISTS idx_visit_history_user_id ON visit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_history_spot_id ON visit_history(spot_id);
CREATE INDEX IF NOT EXISTS idx_visit_history_visited_at ON visit_history(visited_at DESC);

-- =============================================
-- 4. SESSIONS 테이블 (인증 세션)
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_access_token ON sessions(access_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- =============================================
-- 5. SPOTS 테이블 (스팟 데이터 캐시)
-- =============================================
CREATE TABLE IF NOT EXISTS spots (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    region VARCHAR(50),
    district VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    image_url TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spots_category ON spots(category);
CREATE INDEX IF NOT EXISTS idx_spots_region ON spots(region);
CREATE INDEX IF NOT EXISTS idx_spots_priority ON spots(priority DESC);

-- =============================================
-- 6. COMMENTS 테이블 (댓글)
-- =============================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spot_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_comments_spot_id ON comments(spot_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- =============================================
-- 7. PHOTOS 테이블 (사진)
-- =============================================
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spot_id VARCHAR(100) NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    mime_type VARCHAR(50),
    file_size INTEGER,
    caption TEXT,
    s3_key TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_photos_spot_id ON photos(spot_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);

-- =============================================
-- 8. LIKES 테이블 (좋아요)
-- =============================================
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- =============================================
-- 9. ADMINS 테이블 (관리자)
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- =============================================
-- 10. ADMIN_SESSIONS 테이블 (관리자 세션)
-- =============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

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

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_progress_updated_at') THEN
        CREATE TRIGGER update_user_progress_updated_at
            BEFORE UPDATE ON user_progress
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_spots_updated_at') THEN
        CREATE TRIGGER update_spots_updated_at
            BEFORE UPDATE ON spots
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================
-- 초기 데이터
-- =============================================
-- 기본 관리자 계정 (비밀번호: admin123 - SHA256 해시)
-- 실제 운영시 비밀번호 변경 필수!
INSERT INTO admins (username, password_hash, email, name, role)
VALUES ('admin', '240be518fabd2724ddb6f04eeb9d5b60fa5b7b96e5decfd4ae7d3e4b93e8b6b6', 'admin@within.local', '관리자', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'Within Database initialized successfully!';
END $$;
