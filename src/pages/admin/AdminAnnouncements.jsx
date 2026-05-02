import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit2, Trash2, Save, X, Megaphone, Eye, EyeOff } from 'lucide-react'

const emptyForm = { title: '', content: '', is_active: true, target_audience: 'all', expires_at: '' }

export default function AdminAnnouncements() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchAnnouncements() }, [])

  async function fetchAnnouncements() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setAnnouncements(data || [])
    setLoading(false)
  }

  function openCreate() { setForm(emptyForm); setEditId(null); setShowForm(true); setError('') }
  function openEdit(a) {
    setForm({ title: a.title, content: a.content, is_active: a.is_active, target_audience: a.target_audience, expires_at: a.expires_at ? a.expires_at.slice(0, 10) : '' })
    setEditId(a.id); setShowForm(true); setError('')
  }

  async function handleSave() {
    if (!form.title || !form.content) { setError('Title and content are required'); return }
    setSaving(true)
    const payload = { ...form, expires_at: form.expires_at || null, created_by: user.id }
    if (editId) {
      const { error } = await supabase.from('announcements').update(payload).eq('id', editId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('announcements').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }
    setSaving(false); setShowForm(false); fetchAnnouncements()
  }

  async function toggleActive(a) {
    await supabase.from('announcements').update({ is_active: !a.is_active }).eq('id', a.id)
    setAnnouncements(as => as.map(x => x.id === a.id ? { ...x, is_active: !a.is_active } : x))
  }

  async function deleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(as => as.filter(a => a.id !== id))
  }

  const audienceColors = { all: 'var(--accent)', learners: 'var(--green)', admin: 'var(--purple)' }

  return (
    <div style={{ padding: '36px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>Announcements</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Broadcast messages to learners — shown in dashboard and homepage</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} />New Announcement</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 580, padding: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
                {editId ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="Announcement title" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea className="form-input" rows={4} placeholder="Write your announcement…"
                  value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select className="form-input" value={form.target_audience} onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}>
                    <option value="all">Everyone</option>
                    <option value="learners">Learners only</option>
                    <option value="admin">Admins only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expires (optional)</label>
                  <input className="form-input" type="date" value={form.expires_at}
                    onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ accentColor: 'var(--green)', width: 16, height: 16 }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Active (show to users)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                <Save size={15} />{saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? <div className="loading-container"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.length === 0 ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
              <Megaphone size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ color: 'var(--text-muted)' }}>No announcements yet. Create one to broadcast to learners.</p>
            </div>
          ) : announcements.map(a => (
            <div key={a.id} className="card" style={{ padding: '22px 26px', display: 'flex', gap: 20, alignItems: 'flex-start', border: `1px solid ${a.is_active ? 'rgba(0,217,255,0.15)' : 'var(--border)'}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: a.is_active ? 'rgba(0,217,255,0.1)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Megaphone size={18} color={a.is_active ? 'var(--accent)' : 'var(--text-muted)'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.title}</span>
                  <span style={{ padding: '1px 8px', borderRadius: 20, fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700, background: a.is_active ? 'rgba(63,185,80,0.1)' : 'rgba(139,148,158,0.1)', color: a.is_active ? 'var(--green)' : 'var(--text-muted)' }}>
                    {a.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <span style={{ padding: '1px 8px', borderRadius: 20, fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700, background: `${audienceColors[a.target_audience]}18`, color: audienceColors[a.target_audience] }}>
                    {a.target_audience?.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 8 }}>{a.content}</p>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Created {new Date(a.created_at).toLocaleDateString()}
                  {a.expires_at && ` · Expires ${new Date(a.expires_at).toLocaleDateString()}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleActive(a)} className="btn btn-sm btn-ghost" title={a.is_active ? 'Deactivate' : 'Activate'}>
                  {a.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button onClick={() => openEdit(a)} className="btn btn-sm btn-ghost"><Edit2 size={13} /></button>
                <button onClick={() => deleteAnnouncement(a.id)} className="btn btn-sm btn-danger"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
