-- Re:Earth Supabase Database Schema
-- Supabase SQL Editor에서 실행

-- =============================================
-- 1. 사용자 테이블 (users)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'kakao',
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- 2. 게임 진행상황 테이블 (user_progress)
-- =============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  total_stamps INTEGER DEFAULT 0,
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  active_category TEXT DEFAULT 'ALL',
  active_region TEXT DEFAULT 'ALL',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 3. 해금된 스팟 테이블 (unlocked_spots)
-- =============================================
CREATE TABLE IF NOT EXISTS unlocked_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, spot_id)
);

ALTER TABLE unlocked_spots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own unlocked spots" ON unlocked_spots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own unlocked spots" ON unlocked_spots FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. 방문 기록 테이블 (visit_history)
-- =============================================
CREATE TABLE IF NOT EXISTS visit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL,
  spot_name TEXT,
  category TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visit_history_user ON visit_history(user_id);
CREATE INDEX idx_visit_history_spot ON visit_history(spot_id);

ALTER TABLE visit_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own visits" ON visit_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own visits" ON visit_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view visit counts" ON visit_history FOR SELECT USING (true);

-- =============================================
-- 5. 스팟 사진 테이블 (spot_photos)
-- =============================================
CREATE TABLE IF NOT EXISTS spot_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spot_photos_spot ON spot_photos(spot_id);
CREATE INDEX idx_spot_photos_user ON spot_photos(user_id);

ALTER TABLE spot_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view photos" ON spot_photos FOR SELECT USING (true);
CREATE POLICY "Users can insert their own photos" ON spot_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own photos" ON spot_photos FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 6. 스팟 댓글 테이블 (spot_comments)
-- =============================================
CREATE TABLE IF NOT EXISTS spot_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spot_comments_spot ON spot_comments(spot_id);
CREATE INDEX idx_spot_comments_user ON spot_comments(user_id);

ALTER TABLE spot_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON spot_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON spot_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON spot_comments FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 7. 좋아요 테이블 (likes)
-- =============================================
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- 'photo' or 'comment'
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX idx_likes_target ON likes(target_type, target_id);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 8. Storage Bucket 설정 (Supabase Dashboard에서 실행)
-- =============================================
-- 1. Storage > Create new bucket
-- 2. Bucket name: spot-photos
-- 3. Public bucket: ON
-- 4. File size limit: 5MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- =============================================
-- 9. 트리거: 좋아요 카운트 업데이트
-- =============================================
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'photo' THEN
      UPDATE spot_photos SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      UPDATE spot_comments SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'photo' THEN
      UPDATE spot_photos SET likes_count = likes_count - 1 WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'comment' THEN
      UPDATE spot_comments SET likes_count = likes_count - 1 WHERE id = OLD.target_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- =============================================
-- 10. 트리거: 사진 댓글 카운트 업데이트 (향후 확장용)
-- =============================================
-- 현재 댓글은 스팟에 직접 달리지만, 사진에 댓글 기능 추가 시 사용

-- =============================================
-- 완료!
-- =============================================
-- 위 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요.
