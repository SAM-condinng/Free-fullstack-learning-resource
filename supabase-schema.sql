-- ============================================================
-- StackPath E-Learning Platform – Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'learner' CHECK (role IN ('learner', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL CHECK (category IN ('frontend', 'backend', 'fullstack', 'devops', 'databases')),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  estimated_hours INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LESSONS
-- ============================================================
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  youtube_url TEXT,
  youtube_embed_id TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXTERNAL RESOURCES (free platform links per lesson)
-- ============================================================
CREATE TABLE lesson_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT,
  resource_type TEXT DEFAULT 'article' CHECK (resource_type IN ('article', 'video', 'documentation', 'course', 'tool')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
CREATE TABLE enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
CREATE TABLE lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  watch_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_location TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
  is_approved BOOLEAN DEFAULT false,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
CREATE TABLE contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'learners', 'admin')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ============================================================
-- ACHIEVEMENTS / BADGES
-- ============================================================
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria_type TEXT CHECK (criteria_type IN ('courses_completed', 'lessons_completed', 'streak_days')),
  criteria_value INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Profiles: users read own, admins read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);

-- Courses: published courses readable by all, admins manage
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage courses" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lessons: same as courses
CREATE POLICY "Anyone can view published lessons" ON lessons FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage lessons" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Resources: public read
CREATE POLICY "Anyone can view resources" ON lesson_resources FOR SELECT USING (true);
CREATE POLICY "Admins manage resources" ON lesson_resources FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Enrollments: users manage own
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all enrollments" ON enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Progress: users manage own
CREATE POLICY "Users manage own progress" ON lesson_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all progress" ON lesson_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Testimonials: approved ones public
CREATE POLICY "Anyone can view approved testimonials" ON testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can submit testimonials" ON testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage testimonials" ON testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Contact messages: insert only for public, admins read all
CREATE POLICY "Anyone can send contact message" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read contact messages" ON contact_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins update contact messages" ON contact_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Announcements: all can read active
CREATE POLICY "Anyone can view active announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage announcements" ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- TRIGGERS: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED DATA – Courses & Lessons
-- ============================================================

-- Insert courses
INSERT INTO courses (title, slug, description, long_description, category, difficulty, is_published, estimated_hours) VALUES
(
  'Frontend Development Fundamentals',
  'frontend-fundamentals',
  'Master HTML, CSS, and JavaScript — the three pillars of web development.',
  'This comprehensive course takes you from zero to building fully interactive web pages. You will learn semantic HTML structure, modern CSS including Flexbox and Grid, and JavaScript fundamentals including DOM manipulation and events.',
  'frontend', 'beginner', true, 20
),
(
  'Backend Development with Node.js',
  'backend-nodejs',
  'Build powerful server-side applications with Node.js, Express, and PostgreSQL.',
  'Dive deep into backend development. Learn Node.js runtime, Express.js framework, RESTful API design, PostgreSQL databases, JWT authentication, and Nginx server configuration. By the end you will be building production-ready APIs.',
  'backend', 'intermediate', true, 30
),
(
  'React.js – Modern Frontend',
  'react-modern-frontend',
  'Build dynamic, component-based UIs with React including hooks and state management.',
  'Learn React from the ground up. Covers components, JSX, hooks (useState, useEffect, useContext), React Router, and connecting to APIs. Build real projects that demonstrate your skills.',
  'frontend', 'intermediate', true, 25
),
(
  'Database Design & SQL',
  'database-design-sql',
  'Master relational database design, SQL queries, and database optimization.',
  'Understand how to design efficient databases, write complex SQL queries, and optimize performance. Covers normalization, indexing, joins, transactions, and working with PostgreSQL.',
  'databases', 'beginner', true, 15
),
(
  'Full Stack Capstone Project',
  'fullstack-capstone',
  'Apply everything you have learned to build a complete full stack web application.',
  'Combine your frontend and backend skills to build a production-ready full stack application. Includes project planning, architecture decisions, deployment, and best practices.',
  'fullstack', 'advanced', true, 40
);

-- Insert Front End lessons
WITH fe_course AS (SELECT id FROM courses WHERE slug = 'frontend-fundamentals')
INSERT INTO lessons (course_id, title, description, youtube_embed_id, order_index, duration_minutes, is_published) VALUES
((SELECT id FROM fe_course), 'Introduction to HTML', 'Learn the structure of the web with HTML markup language.', 'kUMe1FH4CHE', 1, 60, true),
((SELECT id FROM fe_course), 'HTML Forms & Tables', 'Master forms, inputs, and organizing data with tables.', 'fNcJuPIZ2BE', 2, 45, true),
((SELECT id FROM fe_course), 'CSS Basics & Selectors', 'Style your pages with CSS — colors, fonts, and the box model.', 'wRNinF7YQqQ', 3, 60, true),
((SELECT id FROM fe_course), 'CSS Flexbox & Grid', 'Modern layout techniques every developer must know.', 'JJSoEo8JSnc', 4, 75, true),
((SELECT id FROM fe_course), 'JavaScript Fundamentals', 'Variables, functions, loops, and control flow in JavaScript.', 'hdI2bqOjy3c', 5, 90, true),
((SELECT id FROM fe_course), 'JavaScript DOM Manipulation', 'Make your pages interactive by manipulating the DOM.', 'y17RuWkWdn8', 6, 60, true);

-- Insert Backend lessons
WITH be_course AS (SELECT id FROM courses WHERE slug = 'backend-nodejs')
INSERT INTO lessons (course_id, title, description, youtube_embed_id, order_index, duration_minutes, is_published) VALUES
((SELECT id FROM be_course), 'Introduction to Node.js', 'Server-side JavaScript with Node.js runtime.', '32M1al-Y6Ag', 1, 60, true),
((SELECT id FROM be_course), 'Express.js Framework', 'Build web servers and APIs with Express.', 'CnH3kAXSrmU', 2, 75, true),
((SELECT id FROM be_course), 'RESTful API Design', 'Design clean, professional REST APIs.', 'c708Nf0cHrs', 3, 60, true),
((SELECT id FROM be_course), 'PostgreSQL Database', 'Store and query data with PostgreSQL.', 'SpfIwlAYaKk', 4, 90, true),
((SELECT id FROM be_course), 'JWT Authentication', 'Secure your APIs with JSON Web Tokens.', 'x5gLL8-M9Fo', 5, 60, true),
((SELECT id FROM be_course), 'Nginx Server Setup', 'Configure Nginx as a reverse proxy and web server.', 'tMtFZdaaIhk', 6, 45, true);

-- Insert lesson resources for HTML lesson
WITH html_lesson AS (SELECT l.id FROM lessons l JOIN courses c ON l.course_id = c.id WHERE c.slug = 'frontend-fundamentals' AND l.order_index = 1)
INSERT INTO lesson_resources (lesson_id, title, url, platform, resource_type) VALUES
((SELECT id FROM html_lesson), 'W3Schools HTML Tutorial', 'https://www.w3schools.com/html/', 'W3Schools', 'documentation'),
((SELECT id FROM html_lesson), 'MDN HTML Reference', 'https://developer.mozilla.org/en-US/docs/Web/HTML', 'MDN Web Docs', 'documentation'),
((SELECT id FROM html_lesson), 'freeCodeCamp Responsive Web Design', 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', 'freeCodeCamp', 'course'),
((SELECT id FROM html_lesson), 'The Odin Project HTML Basics', 'https://www.theodinproject.com/paths/foundations/courses/foundations', 'The Odin Project', 'course');

-- Insert testimonials (pre-approved)
INSERT INTO testimonials (author_name, author_location, content, rating, is_approved) VALUES
('David R.', 'San Francisco, CA', 'I was stuck in a marketing job and wanted a change. The comprehensive curriculum on StackPath made transitioning to a full-stack developer possible. I am now working at a tech startup doing what I love!', 5, true),
('Sarah J.', 'New York, NY', 'As someone with no prior coding experience, I was hesitant. StackPath provided a structured learning path that made complex topics easy to grasp. The hands-on approach landed me my first developer job!', 5, true),
('Mike T.', 'Chicago, IL', 'After completing the full-stack course I started freelancing and it has been a game-changer. The project-based learning helped me build a diverse portfolio very quickly.', 5, true),
('Lisa K.', 'Austin, TX', 'I already had front-end experience but wanted to level up. The back-end courses taught me critical technologies and best practices. I now feel confident taking on full-stack projects.', 5, true);

-- Insert achievements
INSERT INTO achievements (title, description, icon, criteria_type, criteria_value) VALUES
('First Step', 'Complete your first lesson', '🎯', 'lessons_completed', 1),
('On a Roll', 'Complete 5 lessons', '🔥', 'lessons_completed', 5),
('Course Finisher', 'Complete your first course', '🎓', 'courses_completed', 1),
('Knowledge Seeker', 'Complete 3 courses', '📚', 'courses_completed', 3),
('Full Stacker', 'Complete all 5 courses', '⚡', 'courses_completed', 5),
('Dedicated Learner', 'Complete 25 lessons', '💎', 'lessons_completed', 25);

-- Insert a sample announcement
INSERT INTO announcements (title, content, is_active, target_audience) VALUES
('Welcome to StackPath!', 'We are excited to launch our new learning platform. All courses are free and self-paced. Start your full-stack journey today!', true, 'all');
