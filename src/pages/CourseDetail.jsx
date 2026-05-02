import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  Clock, BookOpen, Play, CheckCircle, Lock, ChevronRight,
  ExternalLink, Users, TrendingUp, ArrowLeft, Zap
} from 'lucide-react'

const catColors = {
  frontend: 'var(--accent)', backend: 'var(--green)',
  fullstack: 'var(--purple)', databases: 'var(--yellow)', devops: 'var(--orange)'
}

export default function CourseDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState({})
  const [enrolling, setEnrolling] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCourse() }, [slug])
  useEffect(() => { if (user && course) fetchUserProgress() }, [user, course])

  async function fetchCourse() {
    const { data: c } = await supabase.from('courses').select('*').eq('slug', slug).eq('is_published', true).single()
    if (!c) { navigate('/courses'); return }
    setCourse(c)
    const { data: l } = await supabase.from('lessons').select(`*, lesson_resources(*)`).eq('course_id', c.id).eq('is_published', true).order('order_index')
    setLessons(l || [])
    setLoading(false)
  }

  async function fetchUserProgress() {
    const { data: enr } = await supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', course.id).single()
    setEnrolled(!!enr)
    const { data: prog } = await supabase.from('lesson_progress').select('lesson_id, completed').eq('user_id', user.id).eq('course_id', course.id)
    if (prog) {
      const map = {}
      prog.forEach(p => { map[p.lesson_id] = p.completed })
      setProgress(map)
    }
  }

  async function handleEnroll() {
    if (!user) { navigate('/signup'); return }
    setEnrolling(true)
    await supabase.from('enrollments').insert({ user_id: user.id, course_id: course.id })
    setEnrolled(true)
    setEnrolling(false)
  }

  function getFirstLesson() {
    if (!lessons.length) return null
    // Find first incomplete lesson or first lesson
    const incomplete = lessons.find(l => !progress[l.id])
    return incomplete || lessons[0]
  }

  if (loading) return <div className="loading-container" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
  if (!course) return null

  const color = catColors[course.category] || 'var(--accent)'
  const completedCount = Object.values(progress).filter(Boolean).length
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0
  const firstLesson = getFirstLesson()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        paddingTop: 'var(--nav-height)',
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${color}10, transparent 70%)`,
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ padding: '48px 24px 40px' }}>
          <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
            <ArrowLeft size={14} />Back to courses
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, background: `${color}18`, color, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>
                  {course.category}
                </span>
                <span style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  {course.difficulty}
                </span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', lineHeight: 1.2, marginBottom: 16 }}>
                {course.title}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 600, marginBottom: 24 }}>
                {course.long_description || course.description}
              </p>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { icon: BookOpen, label: `${lessons.length} lessons` },
                  { icon: Clock, label: `${course.estimated_hours}h estimated` },
                  { icon: Zap, label: 'Free forever' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Icon size={14} color={color} />{label}
                  </div>
                ))}
              </div>
            </div>

            {/* Enroll card */}
            <div className="card" style={{ padding: 28, minWidth: 280 }}>
              {enrolled && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Your progress</span>
                    <span style={{ color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{progressPct}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${progressPct}%`, background: color }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    {completedCount}/{lessons.length} lessons completed
                  </div>
                </div>
              )}

              {enrolled ? (
                <Link to={firstLesson ? `/learn/${slug}/${firstLesson.id}` : '#'}
                  className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
                  <Play size={16} />
                  {completedCount === 0 ? 'Start Learning' : progressPct === 100 ? 'Review Course' : 'Continue Learning'}
                </Link>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling}
                  className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
                  {enrolling ? 'Enrolling…' : user ? 'Enroll Free' : 'Sign Up to Enroll'}
                </button>
              )}
              {!user && (
                <Link to="/login" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                  Already have an account? Log in
                </Link>
              )}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                100% free · No credit card · Self-paced
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <div className="container" style={{ padding: '48px 24px', flex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 8 }}>
          Course Content
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 28 }}>
          {lessons.length} lessons · {course.estimated_hours} hours total
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {lessons.map((lesson, i) => {
            const isCompleted = progress[lesson.id]
            const isAccessible = enrolled || i === 0
            return (
              <div key={lesson.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 22px',
                borderBottom: i < lessons.length - 1 ? '1px solid var(--border)' : 'none',
                background: isCompleted ? `${color}06` : 'transparent',
                transition: 'background 0.2s',
              }}>
                {/* Status icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: isCompleted ? `${color}20` : 'var(--bg-secondary)',
                  border: `2px solid ${isCompleted ? color : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isCompleted
                    ? <CheckCircle size={16} color={color} />
                    : isAccessible
                      ? <Play size={14} color="var(--text-muted)" />
                      : <Lock size={14} color="var(--text-muted)" />
                  }
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{lesson.title}</div>
                  {lesson.description && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{lesson.description}</div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {lesson.duration_minutes > 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      {lesson.duration_minutes}m
                    </span>
                  )}
                  {isAccessible ? (
                    <Link to={`/learn/${slug}/${lesson.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, color, fontSize: '0.8rem', fontWeight: 600 }}>
                      {isCompleted ? 'Review' : 'Start'} <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Enroll to access</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Footer />
    </div>
  )
}
