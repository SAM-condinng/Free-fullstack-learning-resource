import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  Users, BookOpen, MessageSquare, Star,
  TrendingUp, CheckCircle, Eye, ArrowRight,
  GraduationCap, Activity, Clock
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0, messages: 0, testimonials: 0, lessons: 0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [recentMessages, setRecentMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [usersR, coursesR, enrollsR, messagesR, testimonialsR, lessonsR, recentUsersR, recentMsgR] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('lessons').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id, full_name, username, role, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('contact_messages').select('id, sender_name, subject, created_at, is_read').order('created_at', { ascending: false }).limit(5),
    ])
    setStats({
      users: usersR.count || 0,
      courses: coursesR.count || 0,
      enrollments: enrollsR.count || 0,
      messages: messagesR.count || 0,
      testimonials: testimonialsR.count || 0,
      lessons: lessonsR.count || 0,
    })
    setRecentUsers(recentUsersR.data || [])
    setRecentMessages(recentMsgR.data || [])
    setLoading(false)
  }

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'var(--accent)', to: '/admin/users' },
    { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'var(--purple)', to: '/admin/courses' },
    { label: 'Total Lessons', value: stats.lessons, icon: GraduationCap, color: 'var(--green)', to: '/admin/courses' },
    { label: 'Enrollments', value: stats.enrollments, icon: TrendingUp, color: 'var(--yellow)', to: '/admin/users' },
    { label: 'Unread Messages', value: stats.messages, icon: MessageSquare, color: 'var(--orange)', to: '/admin/messages', alert: stats.messages > 0 },
    { label: 'Pending Reviews', value: stats.testimonials, icon: Star, color: 'var(--yellow)', to: '/admin/testimonials', alert: stats.testimonials > 0 },
  ]

  if (loading) return <div className="loading-container"><div className="spinner" /></div>

  return (
    <div style={{ padding: '36px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Overview of your StackPath e-learning platform
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid-3" style={{ marginBottom: 40 }}>
        {statCards.map(s => (
          <Link key={s.label} to={s.to} style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{
              display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.2s',
              border: s.alert ? `1px solid ${s.color}44` : '1px solid var(--border)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = s.color }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = s.alert ? `${s.color}44` : 'var(--border)' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={22} color={s.color} />
              </div>
              <div>
                <div className="stat-value" style={{ fontSize: '1.8rem', color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
              {s.alert && (
                <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: s.color, animation: 'pulse-glow 2s infinite' }} />
              )}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Recent Users */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Recent Users</h3>
            <Link to="/admin/users" style={{ color: 'var(--accent)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {(u.full_name || u.username || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{u.full_name || u.username || 'Unknown'}</div>
                        {u.username && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>@{u.username}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                      background: u.role === 'admin' ? 'rgba(163,113,247,0.12)' : 'rgba(0,217,255,0.08)',
                      color: u.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Messages */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Recent Messages</h3>
            <Link to="/admin/messages" style={{ color: 'var(--accent)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentMessages.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No messages yet</td></tr>
              ) : recentMessages.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{m.sender_name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.subject || 'No subject'}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                      background: m.is_read ? 'rgba(63,185,80,0.08)' : 'rgba(247,129,102,0.1)',
                      color: m.is_read ? 'var(--green)' : 'var(--orange)',
                    }}>
                      {m.is_read ? 'READ' : 'NEW'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { to: '/admin/courses', label: 'Add New Course', icon: BookOpen, color: 'var(--accent)' },
            { to: '/admin/announcements', label: 'Post Announcement', icon: MessageSquare, color: 'var(--purple)' },
            { to: '/admin/testimonials', label: 'Review Testimonials', icon: Star, color: 'var(--yellow)' },
            { to: '/admin/messages', label: 'Check Messages', icon: MessageSquare, color: 'var(--orange)' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="btn btn-ghost" style={{ gap: 8 }}>
              <a.icon size={15} color={a.color} />{a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
