import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, BookOpen, TrendingUp, ChevronRight } from 'lucide-react'

const categoryColors = {
  frontend: { bg: 'rgba(0,217,255,0.08)', color: 'var(--accent)', label: 'Frontend' },
  backend: { bg: 'rgba(63,185,80,0.08)', color: 'var(--green)', label: 'Backend' },
  fullstack: { bg: 'rgba(163,113,247,0.08)', color: 'var(--purple)', label: 'Full Stack' },
  databases: { bg: 'rgba(227,179,65,0.08)', color: 'var(--yellow)', label: 'Databases' },
  devops: { bg: 'rgba(247,129,102,0.08)', color: 'var(--orange)', label: 'DevOps' },
}

const difficultyColors = {
  beginner: 'var(--green)',
  intermediate: 'var(--yellow)',
  advanced: 'var(--orange)',
}

export default function CourseCard({ course, progress = null }) {
  const cat = categoryColors[course.category] || categoryColors.fullstack
  const progressPct = progress ? Math.round((progress.completed / progress.total) * 100) : null

  return (
    <Link to={`/courses/${course.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ overflow: 'hidden', transition: 'all 0.25s ease', cursor: 'pointer' }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
          e.currentTarget.style.borderColor = 'var(--border-light)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        {/* Color accent top */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />

        <div style={{ padding: '20px 22px 22px' }}>
          {/* Tags row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{
              padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)', fontWeight: 700,
              background: cat.bg, color: cat.color,
            }}>
              {cat.label}
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)', fontWeight: 600,
              color: difficultyColors[course.difficulty],
              background: `${difficultyColors[course.difficulty]}18`,
            }}>
              {course.difficulty}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem',
            color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.3,
          }}>
            {course.title}
          </h3>

          {/* Description */}
          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.85rem',
            lineHeight: 1.6, marginBottom: 18,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {course.description}
          </p>

          {/* Progress bar (if enrolled) */}
          {progressPct !== null && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Progress</span>
                <span style={{ color: cat.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{progressPct}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}aa)` }} />
              </div>
            </div>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <Clock size={12} />
                <span>{course.estimated_hours}h</span>
              </div>
              {course.lesson_count !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  <BookOpen size={12} />
                  <span>{course.lesson_count} lessons</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: cat.color, fontSize: '0.8rem', fontWeight: 600 }}>
              {progressPct === 100 ? '✓ Complete' : progressPct !== null ? 'Continue' : 'Start'}
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
