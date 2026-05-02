# StackPath – Full-Stack E-Learning Platform

> Rebuilt from your original Go-Pro-Design (GpD) project into a professional, full-stack application using React + Vite + Supabase.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase

1. Go to [https://app.supabase.com](https://app.supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and paste the entire contents of `supabase-schema.sql` and run it
4. Go to **Project Settings → API** and copy your:
   - Project URL
   - Anon/Public key

### 3. Create your .env file
```bash
cp .env.example .env
```
Then edit `.env` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Project Structure

```
src/
├── lib/
│   └── supabase.js          # Supabase client
├── contexts/
│   └── AuthContext.jsx      # Auth state (login, signup, signout)
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── CourseCard.jsx
├── pages/
│   ├── Home.jsx             # Landing page
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Courses.jsx          # Course listing with filters
│   ├── CourseDetail.jsx     # Course info + lesson list
│   ├── LessonView.jsx       # YouTube video + resources + progress
│   ├── Dashboard.jsx        # User progress dashboard
│   ├── Profile.jsx
│   ├── Community.jsx        # Testimonials + community links
│   ├── Contact.jsx
│   └── admin/
│       ├── AdminLayout.jsx      # Admin sidebar layout
│       ├── AdminDashboard.jsx   # Stats overview
│       ├── AdminCourses.jsx     # Create/edit/delete courses
│       ├── AdminLessons.jsx     # Manage lessons + YouTube + resources
│       ├── AdminUsers.jsx       # User management + role changes
│       ├── AdminMessages.jsx    # Contact form inbox
│       ├── AdminTestimonials.jsx# Approve/reject stories
│       └── AdminAnnouncements.jsx # Broadcast announcements
```

---

## 🔑 Making Yourself an Admin

After signing up:
1. Go to Supabase → **Table Editor → profiles**
2. Find your row and change `role` from `learner` to `admin`
3. Refresh your browser — you'll now see the Admin Panel link

---

## ✨ Features

### For Learners
- Browse all courses (filter by category, difficulty, search)
- Self-paced video lessons with embedded YouTube videos
- Free platform resources (W3Schools, MDN, freeCodeCamp, Odin Project, etc.)
- Progress tracking per lesson and course
- Dashboard with overall completion stats and achievements
- Community testimonials and developer community links
- Contact form

### For Admins
- Full CRUD for courses and lessons
- Manage YouTube video IDs per lesson
- Add free platform resource links per lesson
- User management + promote to admin
- Contact message inbox with email reply
- Approve/reject testimonials
- Create and broadcast announcements

---

## 🎯 Courses Included (from your original project)

| Course | Topics Covered |
|--------|---------------|
| Frontend Fundamentals | HTML, CSS, Flexbox/Grid, JavaScript DOM |
| Backend with Node.js | Node.js, Express, REST APIs, PostgreSQL, JWT, Nginx |
| React.js Modern Frontend | Components, Hooks, Router, API integration |
| Database Design & SQL | SQL, PostgreSQL, normalization, indexing |
| Full Stack Capstone | Project planning, architecture, deployment |

---

## 🔗 Free Platforms Linked

- W3Schools
- MDN Web Docs
- freeCodeCamp
- The Odin Project
- CS50 – Harvard
- Scrimba
- Roadmap.sh
- Khan Academy Computing

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Pure CSS with CSS variables |
| Icons | Lucide React |

---

## 📝 Adding New YouTube Videos

1. Log in as admin → Admin Panel → Courses
2. Click **Lessons** on any course
3. Add or edit a lesson
4. Paste the YouTube Video ID (the part after `?v=` in a YouTube URL)
   - Example: `https://www.youtube.com/watch?v=**kUMe1FH4CHE**`
   - Paste just: `kUMe1FH4CHE`

---

Built with ❤️ on top of the original Go-Pro-Design by Samuel M Gachuru
