import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Code2, BookOpen, LayoutDashboard, User, LogOut,
  Menu, X, ShieldCheck, ChevronDown, Bell
} from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const navLinks = [
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/community', label: 'Community', icon: null },
    { to: '/contact', label: 'Contact', icon: null },
  ]

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 'var(--nav-height)',
      background: scrolled ? 'rgba(8, 12, 16, 0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Code2 size={20} color="var(--bg-primary)" strokeWidth={2.5} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em'
          }}>
            Stack<span style={{ color: 'var(--accent)' }}>Path</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', '@media(max-width:768px)': { display: 'none' } }}
          className="desktop-nav">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '8px 16px', borderRadius: 'var(--radius)',
              color: isActive(link.to) ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 500, fontSize: '0.9rem',
              background: isActive(link.to) ? 'rgba(0,217,255,0.08)' : 'transparent',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
              onMouseEnter={e => { if (!isActive(link.to)) e.target.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { if (!isActive(link.to)) e.target.style.color = 'var(--text-secondary)' }}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" style={{
              padding: '8px 16px', borderRadius: 'var(--radius)',
              color: isActive('/admin') ? 'var(--purple)' : 'var(--text-secondary)',
              fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6,
              background: isActive('/admin') ? 'rgba(163,113,247,0.08)' : 'transparent',
            }}>
              <ShieldCheck size={14} />Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <Link to="/dashboard" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 'var(--radius)',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500,
                transition: 'all 0.2s',
              }}>
                <LayoutDashboard size={15} />
                <span className="hide-mobile">Dashboard</span>
              </Link>

              {/* User menu */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 'var(--radius)',
                  background: userMenuOpen ? 'var(--bg-card)' : 'transparent',
                  border: '1px solid ' + (userMenuOpen ? 'var(--border)' : 'transparent'),
                  color: 'var(--text-primary)', transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: 'white',
                  }}>
                    {(profile?.full_name || user.email)?.[0]?.toUpperCase()}
                  </div>
                  <span className="hide-mobile" style={{ fontSize: '0.875rem' }}>
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text-secondary)', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: '110%', right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '8px',
                    minWidth: 200, boxShadow: 'var(--shadow)', zIndex: 100,
                  }}>
                    <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{profile?.full_name || 'Learner'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                    </div>
                    <Link to="/profile" style={menuItemStyle}>
                      <User size={14} />Profile Settings
                    </Link>
                    <Link to="/dashboard" style={menuItemStyle}>
                      <LayoutDashboard size={14} />My Dashboard
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" style={{ ...menuItemStyle, color: 'var(--purple)' }}>
                        <ShieldCheck size={14} />Admin Panel
                      </Link>
                    )}
                    <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                    <button onClick={handleSignOut} style={{ ...menuItemStyle, width: '100%', color: 'var(--orange)', border: 'none', background: 'transparent', textAlign: 'left' }}>
                      <LogOut size={14} />Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{
            display: 'none', padding: 8, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
          }}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{ padding: '10px 12px', borderRadius: 'var(--radius)', color: isActive(link.to) ? 'var(--accent)' : 'var(--text-primary)', fontWeight: 500 }}>
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link to="/dashboard" style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>Dashboard</Link>
              <Link to="/profile" style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>Profile</Link>
              {isAdmin && <Link to="/admin" style={{ padding: '10px 12px', color: 'var(--purple)' }}>Admin Panel</Link>}
              <button onClick={handleSignOut} style={{ padding: '10px 12px', color: 'var(--orange)', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: '1rem' }}>
                Sign Out
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hide-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '9px 12px', borderRadius: 6,
  color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500,
  transition: 'background 0.15s', cursor: 'pointer',
  width: '100%',
  ':hover': { background: 'var(--bg-card-hover)' }
}
