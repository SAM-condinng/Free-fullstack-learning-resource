import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CourseCard from '../components/CourseCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Filter } from 'lucide-react'

const CATEGORIES = [
  { value: '', label: 'All Courses' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'databases', label: 'Databases' },
  { value: 'devops', label: 'DevOps' },
]

const DIFFICULTIES = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function Courses() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('cat') || '')
  const [difficulty, setDifficulty] = useState('')

  useEffect(() => { fetchCourses() }, [category, difficulty])
  useEffect(() => { if (user) fetchUserData() }, [user])

  async function fetchCourses() {
    setLoading(true)
    let q = supabase.from('courses').select(`*, lessons(count)`).eq('is_published', true)
    if (category) q = q.eq('category', category)
    if (difficulty) q = q.eq('difficulty', difficulty)
    q = q.order('created_at', { ascending: true })
    const { data } = await q
    if (data) {
      const mapped = data.map(c => ({ ...c, lesson_count: c.lessons?.[0]?.count || 0 }))
      setCourses(mapped)
    }
    setLoading(false)
  }

  async function fetchUserData() {
    const { data: enrs } = await supabase.from('enrollments').select('course_id').eq('user_id', user.id)
    if (enrs) setEnrollments(enrs.map(e => e.course_id))

    const { data: prog } = await supabase.from('lesson_progress').select('course_id, completed').eq('user_id', user.id)
    if (prog) {
      const map = {}
      prog.forEach(p => {
        if (!map[p.course_id]) map[p.course_id] = { completed: 0, total: 0 }
        map[p.course_id].total++
        if (p.completed) map[p.course_id].completed++
      })
      setProgressMap(map)
    }
  }

  const filtered = courses.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
  )

  function setFilter(key, val) {
    if (key === 'category') { setCategory(val); setSearchParams(val ? { cat: val } : {}) }
    if (key === 'difficulty') setDifficulty(val)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, paddingTop: 'var(--nav-height)' }}>
        {/* Header */}
        <div style={{
          background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
          padding: '48px 0 36px',
        }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', marginBottom: 8 }}>
              All Courses
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
              Free, self-paced full-stack development courses with YouTube videos and curated resources
            </p>

            {/* Search + Filters */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 380 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" placeholder="Search courses…" style={{ paddingLeft: 40 }}
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => setFilter('category', c.value)}
                    className="btn btn-sm"
                    style={{
                      background: category === c.value ? 'var(--accent)' : 'var(--bg-card)',
                      color: category === c.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      border: `1px solid ${category === c.value ? 'var(--accent)' : 'var(--border)'}`,
                      fontWeight: category === c.value ? 700 : 500,
                    }}>
                    {c.label}
                  </button>
                ))}
              </div>

              <select className="form-input" style={{ width: 'auto', minWidth: 140 }}
                value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="container" style={{ padding: '48px 24px' }}>
          {loading ? (
            <div className="loading-container"><div className="spinner" /><span>Loading courses…</span></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              <Filter size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>No courses match your filters.</p>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24, fontFamily: 'var(--font-mono)' }}>
                {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid-3">
                {filtered.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={enrollments.includes(course.id) ? progressMap[course.id] : null}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
