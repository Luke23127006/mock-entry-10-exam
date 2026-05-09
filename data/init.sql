-- 1. Bảng users (Custom Auth)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Bảng exams (Lưu đề thi)
CREATE TABLE exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content JSONB NOT NULL, -- Lưu toàn bộ cấu trúc câu hỏi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Bảng exam_attempts (Lưu bài làm & bản nháp)
CREATE TABLE exam_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    answers JSONB DEFAULT '{}'::jsonb,
    status TEXT CHECK (status IN ('draft', 'completed')) DEFAULT 'draft',
    score TEXT,
    feedback TEXT, -- Đánh giá của Gemini cho phần Writing
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Bật Row Level Security (RLS) để bảo mật cơ bản (Tùy chọn nhưng nên chạy)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Tạo Policy cho phép mọi thao tác (Vì đây là app nội bộ, auth tự làm nên mở full quyền để Next.js chọc thẳng vào không bị lỗi)
CREATE POLICY "Enable all actions for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all actions for exams" ON exams FOR ALL USING (true);
CREATE POLICY "Enable all actions for exam_attempts" ON exam_attempts FOR ALL USING (true);