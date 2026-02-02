-- =============================================
-- Re:Earth (Within) 데이터베이스 스키마
-- Supabase PostgreSQL
-- =============================================

-- =============================================
-- 1. USERS 테이블 (사용자 기본 정보)
-- =============================================
-- Supabase Auth의 auth.users와 연동되는 공개 프로필 테이블

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'kakao',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =============================================
-- 2. USER_PROGRESS 테이블 (게임 진행상황)
-- =============================================
-- 레벨, 경험치, 스탬프 수 등 게임 메타 데이터

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  total_stamps INTEGER DEFAULT 0,
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  active_category TEXT DEFAULT 'ALL',
  active_region TEXT DEFAULT 'ALL',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);

-- =============================================
-- 3. UNLOCKED_SPOTS 테이블 (해금된 스팟)
-- =============================================
-- 사용자가 방문/해금한 스팟 목록

CREATE TABLE IF NOT EXISTS public.unlocked_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  -- 복합 유니크 제약 (사용자당 스팟 1회만)
  UNIQUE(user_id, spot_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_unlocked_spots_user_id ON public.unlocked_spots(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_spots_spot_id ON public.unlocked_spots(spot_id);

-- =============================================
-- 4. VISIT_HISTORY 테이블 (방문 기록/탐험 일지)
-- =============================================
-- 방문 기록 (같은 스팟 여러 번 방문 가능)

CREATE TABLE IF NOT EXISTS public.visit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  spot_id TEXT NOT NULL,
  spot_name TEXT,
  category TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW(),

  -- 메모/사진 등 추가 가능
  memo TEXT,
  photo_url TEXT
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_visit_history_user_id ON public.visit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_history_visited_at ON public.visit_history(visited_at DESC);

-- =============================================
-- 5. USER_ACHIEVEMENTS 테이블 (업적/뱃지)
-- =============================================
-- 향후 확장용: 달성한 업적 기록

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- =============================================
-- RLS (Row Level Security) 정책
-- =============================================

-- users 테이블 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all users" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- user_progress 테이블 RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all progress" ON public.user_progress
  FOR ALL USING (auth.role() = 'service_role');

-- unlocked_spots 테이블 RLS
ALTER TABLE public.unlocked_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocked spots" ON public.unlocked_spots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocked spots" ON public.unlocked_spots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all unlocked spots" ON public.unlocked_spots
  FOR ALL USING (auth.role() = 'service_role');

-- visit_history 테이블 RLS
ALTER TABLE public.visit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own visit history" ON public.visit_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visit history" ON public.visit_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all visit history" ON public.visit_history
  FOR ALL USING (auth.role() = 'service_role');

-- user_achievements 테이블 RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all achievements" ON public.user_achievements
  FOR ALL USING (auth.role() = 'service_role');

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

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 트리거: 신규 사용자 생성 시 자동 초기화
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- users 테이블에 프로필 생성
  INSERT INTO public.users (id, email, name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'kakao')
  );

  -- user_progress 테이블에 초기 진행상황 생성
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- auth.users에 새 사용자 생성 시 트리거 실행
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
