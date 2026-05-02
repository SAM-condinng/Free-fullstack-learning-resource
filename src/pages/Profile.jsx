import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, AtSign, FileText, Save, CheckCircle } from 'lucide-react'

export default function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await updateProfile(form)
    setSaving(false)
    if (error) setError(typeof error === 'string' ? error : error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, paddingTop: 'var(--nav-height)' }}>
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>Profile Settings</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your account information</p>
          </div>
        </div>

        <div className="container" style={{ padding: '48px 24px', maxWidth: 720 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: 'white',
            }}>
              {(form.full_name || user?.email)?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
                {form.full_name || 'Your Name'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.email}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{
                  padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)', fontWeight: 700,
                  background: profile?.role === 'admin' ? 'rgba(163,113,247,0.12)' : 'rgba(0,217,255,0.08)',
                  color: profile?.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
                }}>
                  {profile?.role?.toUpperCase() || 'LEARNER'}
                </span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 32 }}>
            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}
            {saved && <div className="alert alert-success" style={{ marginBottom: 20 }}>
              <CheckCircle size={14} style={{ display: 'inline', marginRight: 6 }} />Profile saved successfully!
            </div>}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" type="text" placeholder="Your full name" style={{ paddingLeft: 36 }}
                      value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <div style={{ position: 'relative' }}>
                    <AtSign size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" type="text" placeholder="username" style={{ paddingLeft: 36 }}
                      value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email (read-only)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" type="email" value={user?.email || ''} readOnly
                    style={{ paddingLeft: 36, opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <div style={{ position: 'relative' }}>
                  <FileText size={15} style={{ position: 'absolute', left: 11, top: 12, color: 'var(--text-muted)' }} />
                  <textarea className="form-input" rows={4} placeholder="Tell us about yourself and your learning goals…"
                    style={{ paddingLeft: 36, resize: 'vertical', lineHeight: 1.6 }}
                    value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={15} />
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Account info */}
          <div className="card" style={{ padding: 24, marginTop: 20 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Account Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Member since', value: new Date(user?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'Account ID', value: user?.id?.slice(0, 8) + '…' },
                { label: 'Role', value: profile?.role || 'learner' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
