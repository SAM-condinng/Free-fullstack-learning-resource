import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  BookOpen, CheckCircle, Trophy, TrendingUp, Play, Clock,
  Target, Zap, Star, ArrowRight, Award
} from 'lucide-react'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [lessonCounts, setLessonCounts] = useState({})
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => { if (user) fetchAll() }, [user])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchEnrollments(), fetchAchievements(), fetchAnnouncements()])
    setLoading(false)
  }

  async function fetchEnrollments() {
    const { data: enrs } = await supabase
      .from('enrollments')
      .select('course_id, enrolled_at, courses(*)')
      .eq('user_id', user.id)
    if (!enrs) return
    setEnrolledCourses(enrs)

    const courseIds = enrs.map(e => e.course_id)
    if (!courseIds.length) return

    // Get lesson counts
    const { data: lessons } = await supabase
      .from('lessons')
      .select('course_id')
      .in('course_id', courseIds)
      .eq('is_published', true)
    const counts = {}
    ;(lessons || []).forEach(l => { counts[l.course_id] = (counts[l.course_id] || 0) + 1 })
    setLessonCounts(counts)

    // Get progress
    const { data: prog } = await supabase
      .from('lesson_progress')
      .select('course_id, lesson_id, completed')
      .eq('user_id', user.id)
      .in('course_id', courseIds)
    const map = {}
    ;(prog || []).forEach(p => {
      if (!map[p.course_id]) map[p.course_id] = { total: 0, completed: 0 }
      map[p.course_id].total++
      if (p.completed) map[p.course_id].completed++
    })
    setProgressMap(map)
  }

  async function fetchAchievements() {
    const { data } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user.id)
    setAchievements(data || [])
  }

  async function fetchAnnouncements() {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3)
    setAnnouncements(data || [])
  }

  // Stats
  const totalCompleted = enrolledCourses.filter(e => {
    const p = progressMap[e.course_id]
    const total = lessonCounts[e.course_id] || 0
    return p && total > 0 && p.completed >= total
  }).length

  const totalLessonsCompleted = Object.values(progressMap).reduce((sum, p) => sum + p.completed, 0)
  const totalLessonsAll = Object.values(lessonCounts).reduce((sum, c) => sum + c, 0)
  const overallPct = totalLessonsAll > 0 ? Math.round((totalLessonsCompleted / totalLessonsAll) * 100) : 0

  const catColors = {
    frontend: 'var(--accent)', backend: 'var(--green)',
    fullstack: 'var(--purple)', databases: 'var(--yellow)', devops: 'var(--orange)'
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="loading-container" style={{ flex: 1, marginTop: 'var(--nav-height)' }}>
        <div className="spinner" /><span style={{ color: 'var(--text-secondary)' }}>Loading your dashboard…</span>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, paddingTop: 'var(--nav-height)' }}>
        {/* Header */}
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '36px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {(profile?.full_name || user?.email)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem' }}>
                    {profile?.full_name ? `Hey, ${profile.full_name.split(' ')[0]}! 👋` : 'My Dashboard'}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {overallPct > 0
                      ? `You're ${overallPct}% through your enrolled courses — keep going!`
                      : 'Ready to start learning? Enroll in a course below.'}
                  </p>
                </div>
              </div>
              <Link to="/courses" className="btn btn-primary">
                <BookOpen size={16} />Browse Courses
              </Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 24px' }}>
          {/* Announcements */}
          {announcements.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              {announcements.map(a => (
                <div key={a.id} className="alert alert-info" style={{ marginBottom: 8 }}>
                  <strong>{a.title}</strong> — {a.content}
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: 40 }}>
            {[
              { icon: BookOpen, label: 'Enrolled', value: enrolledCourses.length, color: 'var(--accent)' },
              { icon: CheckCircle, label: 'Completed', value: totalCompleted, color: 'var(--green)' },
              { icon: Zap, label: 'Lessons Done', value: totalLessonsCompleted, color: 'var(--yellow)' },
              { icon: Trophy, label: 'Achievements', value: achievements.length, color: 'var(--purple)' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <div className="stat-value" style={{ color }}>{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall progress */}
          {enrolledCourses.length > 0 && (
            <div className="card" style={{ padding: '24px', marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={16} color="var(--accent)" />
                  <span style={{ fontWeight: 600 }}>Overall Learning Progress</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>{overallPct}%</span>
              </div>
              <div className="progress-bar-track" style={{ height: 10 }}>
                <div className="progress-bar-fill" style={{ width: `${overallPct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>{totalLessonsCompleted} lessons completed</span>
                <span>{totalLessonsAll} total lessons</span>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
            {/* Enrolled Courses */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 20 }}>
                My Courses
              </h2>

              {enrolledCourses.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                  <BookOpen size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>You haven't enrolled in any courses yet.</p>
                  <Link to="/courses" className="btn btn-primary">Browse Courses <ArrowRight size={16} /></Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {enrolledCourses.map(e => {
                    const course = e.courses
                    if (!course) return null
                    const prog = progressMap[course.id] || { completed: 0, total: 0 }
                    const total = lessonCounts[course.id] || 0
                    const pct = total > 0 ? Math.round((prog.completed / total) * 100) : 0
                    const color = catColors[course.category] || 'var(--accent)'
                    const isFinished = pct === 100

                    return (
                      <div key={course.id} className="card" style={{ padding: '22px', display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: 12,
                          background: `${color}18`, border: `1px solid ${color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          {isFinished ? <CheckCircle size={22} color={color} /> : <Play size={22} color={color} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{course.title}</span>
                            {isFinished && <span style={{ padding: '1px 8px', background: 'rgba(63,185,80,0.12)', color: 'var(--green)', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>✓ DONE</span>}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
                            <span>{prog.completed}/{total} lessons</span>
                            <span style={{ color, fontWeight: 700 }}>{pct}%</span>
                          </div>
                          <div className="progress-bar-track" style={{ height: 5 }}>
                            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                        <Link to={`/courses/${course.slug}`}
                          className="btn btn-sm"
                          style={{
                            flexShrink: 0,
                            background: isFinished ? 'rgba(63,185,80,0.1)' : `${color}18`,
                            color: isFinished ? 'var(--green)' : color,
                            border: `1px solid ${isFinished ? 'rgba(63,185,80,0.3)' : `${color}30`}`,
                          }}>
                          {isFinished ? 'Review' : 'Continue'}
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Sidebar: Achievements */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 20 }}>
                Achievements
              </h2>
              <div className="card" style={{ padding: '20px' }}>
                {achievements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Trophy size={32} style={{ margin: '0 auto 10px', opacity: 0.2 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Complete lessons to earn badges!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {achievements.map(ua => (
                      <div key={ua.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                        <span style={{ fontSize: '1.4rem' }}>{ua.achievements?.icon || '🏆'}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ua.achievements?.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ua.achievements?.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Complete courses and lessons to unlock more achievements!
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 12 }}>QUICK LINKS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { href: 'https://roadmap.sh', label: 'Developer Roadmaps', emoji: '🗺️' },
                    { href: 'https://www.freecodecamp.org', label: 'freeCodeCamp', emoji: '🔥' },
                    { href: 'https://www.theodinproject.com', label: 'The Odin Project', emoji: '⚔️' },
                    { href: 'https://developer.mozilla.org', label: 'MDN Web Docs', emoji: '📘' },
                  ].map(link => (
                    <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: 'var(--bg-card)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      textDecoration: 'none', color: 'var(--text-secondary)',
                      fontSize: '0.85rem', transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                      <span>{link.emoji}</span>{link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
