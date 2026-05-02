import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  CheckCircle, Circle, ChevronLeft, ChevronRight, ArrowLeft,
  ExternalLink, BookOpen, Play, List, X, Menu, Youtube, Globe
} from 'lucide-react'

const platformIcons = {
  'W3Schools': '🌐', 'MDN Web Docs': '📘', 'freeCodeCamp': '🔥',
  'The Odin Project': '⚔️', 'YouTube': '▶️', 'default': '🔗'
}

const resourceTypeColors = {
  documentation: 'var(--accent)', course: 'var(--purple)',
  article: 'var(--text-secondary)', video: 'var(--orange)', tool: 'var(--green)'
}

export default function LessonView() {
  const { courseSlug, lessonId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [lesson, setLesson] = useState(null)
  const [resources, setResources] = useState([])
  const [completed, setCompleted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [progress, setProgress] = useState({})
  const [marking, setMarking] = useState(false)

  useEffect(() => { fetchData() }, [courseSlug, lessonId])

  async function fetchData() {
    const { data: c } = await supabase.from('courses').select('*').eq('slug', courseSlug).single()
    if (!c) { navigate('/courses'); return }
    setCourse(c)
    const { data: ls } = await supabase.from('lessons').select('*').eq('course_id', c.id).eq('is_published', true).order('order_index')
    setLessons(ls || [])
    const curr = (ls || []).find(l => l.id === lessonId)
    if (!curr) { navigate(`/courses/${courseSlug}`); return }
    setLesson(curr)
    const { data: res } = await supabase.from('lesson_resources').select('*').eq('lesson_id', lessonId)
    setResources(res || [])
    if (user) {
      const { data: prog } = await supabase.from('lesson_progress').select('lesson_id, completed').eq('user_id', user.id).eq('course_id', c.id)
      if (prog) {
        const map = {}
        prog.forEach(p => { map[p.lesson_id] = p.completed })
        setProgress(map)
        setCompleted(map[lessonId] || false)
      }
    }
  }

  async function toggleComplete() {
    if (!user || marking) return
    setMarking(true)
    const newVal = !completed
    const { data: existing } = await supabase.from('lesson_progress').select('id').eq('user_id', user.id).eq('lesson_id', lessonId).single()
    if (existing) {
      await supabase.from('lesson_progress').update({ completed: newVal, completed_at: newVal ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('lesson_progress').insert({ user_id: user.id, lesson_id: lessonId, course_id: course.id, completed: newVal, completed_at: newVal ? new Date().toISOString() : null })
    }
    setCompleted(newVal)
    setProgress(p => ({ ...p, [lessonId]: newVal }))
    setMarking(false)
  }

  const currentIndex = lessons.findIndex(l => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
  const completedCount = Object.values(progress).filter(Boolean).length
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  const youtubeEmbedUrl = lesson?.youtube_embed_id
    ? `https://www.youtube.com/embed/${lesson.youtube_embed_id}?rel=0&modestbranding=1`
    : null

  if (!lesson || !course) return <div className="loading-container" style={{ minHeight: '100vh' }}><div className="spinner" /></div>

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 300 : 0, minWidth: sidebarOpen ? 300 : 0,
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'all 0.3s ease', flexShrink: 0,
      }}>
        {/* Sidebar header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <Link to={`/courses/${courseSlug}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 12, textDecoration: 'none' }}>
            <ArrowLeft size={13} />Back to course
          </Link>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3, marginBottom: 10, color: 'var(--text-primary)' }}>
            {course.title}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
            <span>{completedCount}/{lessons.length} complete</span>
            <span>{progressPct}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Lessons list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {lessons.map((l, i) => {
            const isActive = l.id === lessonId
            const isDone = progress[l.id]
            return (
              <Link key={l.id} to={`/learn/${courseSlug}/${l.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 20px',
                  background: isActive ? 'rgba(0,217,255,0.08)' : 'transparent',
                  borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ marginTop: 2, flexShrink: 0 }}>
                    {isDone
                      ? <CheckCircle size={15} color="var(--green)" />
                      : <Circle size={15} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                      Lesson {i + 1}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {l.title}
                    </div>
                    {l.duration_minutes > 0 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{l.duration_minutes}m</div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: 56, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 8px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <BookOpen size={15} />
            </button>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{lesson.title}</div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {prevLesson && (
              <Link to={`/learn/${courseSlug}/${prevLesson.id}`} className="btn btn-ghost btn-sm">
                <ChevronLeft size={14} />Prev
              </Link>
            )}
            <button onClick={toggleComplete} disabled={marking}
              className="btn btn-sm"
              style={{
                background: completed ? 'rgba(63,185,80,0.12)' : 'var(--bg-card)',
                color: completed ? 'var(--green)' : 'var(--text-secondary)',
                border: `1px solid ${completed ? 'rgba(63,185,80,0.3)' : 'var(--border)'}`,
                fontWeight: 600,
              }}>
              {completed ? <><CheckCircle size={14} />Completed</> : <><Circle size={14} />Mark Complete</>}
            </button>
            {nextLesson && (
              <Link to={`/learn/${courseSlug}/${nextLesson.id}`} className="btn btn-primary btn-sm">
                Next<ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          {/* YouTube Video */}
          {youtubeEmbedUrl && (
            <div style={{ marginBottom: 32 }}>
              <div style={{
                position: 'relative', paddingTop: '56.25%', borderRadius: 'var(--radius-lg)',
                overflow: 'hidden', background: '#000', border: '1px solid var(--border)',
              }}>
                <iframe
                  src={youtubeEmbedUrl}
                  title={lesson.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Lesson content */}
          {lesson.content && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 12 }}>{lesson.title}</h2>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}
                dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </div>
          )}

          {/* Free Resources */}
          {resources.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={18} color="var(--accent)" />
                Free Learning Resources
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {resources.map(r => (
                  <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'all 0.2s', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{platformIcons[r.platform] || platformIcons.default}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 3 }}>{r.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {r.platform && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.platform}</span>}
                          {r.resource_type && (
                            <span style={{ fontSize: '0.68rem', color: resourceTypeColors[r.resource_type] || 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {r.resource_type}
                            </span>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={13} color="var(--text-muted)" flexShrink={0} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Default resources if none in DB */}
          {resources.length === 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={18} color="var(--accent)" />
                Supplementary Free Resources
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {[
                  { title: 'W3Schools', url: 'https://www.w3schools.com', platform: 'W3Schools', type: 'documentation' },
                  { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', platform: 'MDN Web Docs', type: 'documentation' },
                  { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org', platform: 'freeCodeCamp', type: 'course' },
                  { title: 'The Odin Project', url: 'https://www.theodinproject.com', platform: 'The Odin Project', type: 'course' },
                ].map(r => (
                  <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{platformIcons[r.platform]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.type}</div>
                      </div>
                      <ExternalLink size={12} color="var(--text-muted)" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Navigation footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid var(--border)', marginTop: 16 }}>
            {prevLesson ? (
              <Link to={`/learn/${courseSlug}/${prevLesson.id}`} className="btn btn-ghost">
                <ChevronLeft size={16} />Previous: {prevLesson.title}
              </Link>
            ) : <div />}
            {nextLesson ? (
              <Link to={`/learn/${courseSlug}/${nextLesson.id}`} className="btn btn-primary">
                Next: {nextLesson.title}<ChevronRight size={16} />
              </Link>
            ) : (
              <Link to={`/courses/${courseSlug}`} className="btn btn-primary">
                <CheckCircle size={16} />Finish Course
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
