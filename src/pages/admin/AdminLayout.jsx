import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, BookOpen, Users, MessageSquare,
  Star, Megaphone, ChevronRight, LogOut, Code2,
  GraduationCap, Menu, X
} from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/courses', label: 'Courses & Content', icon: BookOpen },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  function isActive(item) {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 260 : 70, flexShrink: 0,
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease',
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, minHeight: 72, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: 'var(--purple)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Code2 size={18} color="white" strokeWidth={2.5} />
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap' }}>
                Stack<span style={{ color: 'var(--purple)' }}>Path</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--purple)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>ADMIN PANEL</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = isActive(item)
            return (
              <Link key={item.to} to={item.to} title={!sidebarOpen ? item.label : ''} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: sidebarOpen ? '10px 12px' : '10px',
                borderRadius: 8, marginBottom: 2,
                background: active ? 'rgba(163,113,247,0.1)' : 'transparent',
                borderLeft: `3px solid ${active ? 'var(--purple)' : 'transparent'}`,
                color: active ? 'var(--purple)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400, fontSize: '0.875rem',
                transition: 'all 0.15s', textDecoration: 'none',
                whiteSpace: 'nowrap', justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}>
                <item.icon size={17} style={{ flexShrink: 0 }} />
                {sidebarOpen && item.label}
              </Link>
            )
          })}
        </nav>

        {/* User + signout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--purple), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {profile?.full_name?.[0] || 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile?.full_name || 'Admin'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--purple)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>ADMIN</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Link to="/" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: sidebarOpen ? '8px 12px' : '8px',
              borderRadius: 6, color: 'var(--text-secondary)', fontSize: '0.825rem',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}>
              <GraduationCap size={15} style={{ flexShrink: 0 }} />
              {sidebarOpen && 'View Site'}
            </Link>
            <button onClick={handleSignOut} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: sidebarOpen ? '8px 12px' : '8px',
              borderRadius: 6, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.825rem', fontFamily: 'var(--font-body)',
              justifyContent: sidebarOpen ? 'flex-start' : 'center', width: '100%',
            }}>
              <LogOut size={15} style={{ flexShrink: 0 }} />
              {sidebarOpen && 'Sign Out'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  )
}
