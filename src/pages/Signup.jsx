import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import { Code2, Mail, Lock, User, AtSign, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const pwStrength = form.password.length >= 8 ? (form.password.match(/[A-Z]/) && form.password.match(/[0-9]/) ? 'strong' : 'medium') : form.password.length > 0 ? 'weak' : ''
  const pwColors = { weak: 'var(--orange)', medium: 'var(--yellow)', strong: 'var(--green)' }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const { error } = await signUp(form)
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess(true)
  }

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <CheckCircle size={64} color="var(--green)" style={{ marginBottom: 24 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 12 }}>Account Created!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
            Check your email to confirm your account, then sign in to start learning.
          </p>
          <Link to="/login" className="btn btn-primary">Go to Login <ArrowRight size={16} /></Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 60px',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(163,113,247,0.06) 0%, transparent 70%)',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 52, height: 52, background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <Code2 size={26} color="white" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 8 }}>
              Start your journey
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Free account — no credit card required
            </p>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" type="text" placeholder="Samuel Gachuru" style={{ paddingLeft: 36 }}
                      value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <div style={{ position: 'relative' }}>
                    <AtSign size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" type="text" placeholder="samgachuru" style={{ paddingLeft: 36 }}
                      value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" type="email" placeholder="you@example.com" style={{ paddingLeft: 36 }}
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                    style={{ paddingLeft: 36, paddingRight: 36 }}
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwStrength && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: pwColors[pwStrength], width: pwStrength === 'weak' ? '33%' : pwStrength === 'medium' ? '66%' : '100%', transition: 'all 0.3s' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: pwColors[pwStrength], fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{pwStrength}</span>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem', marginTop: 4 }}>
                {loading ? 'Creating account…' : <><span>Create Free Account</span><ArrowRight size={16} /></>}
              </button>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                By signing up you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
