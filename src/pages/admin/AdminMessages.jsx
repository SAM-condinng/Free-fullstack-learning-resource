// AdminMessages.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Mail, CheckCircle, Clock, Trash2, Eye } from 'lucide-react'

export function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchMessages() }, [])

  async function fetchMessages() {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  async function markRead(id) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id)
    setMessages(ms => ms.map(m => m.id === id ? { ...m, is_read: true } : m))
    if (selected?.id === id) setSelected(s => ({ ...s, is_read: true }))
  }

  async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return
    await supabase.from('contact_messages').delete().eq('id', id)
    setMessages(ms => ms.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const filtered = messages.filter(m => filter === 'all' || (filter === 'unread' && !m.is_read) || (filter === 'read' && m.is_read))
  const unreadCount = messages.filter(m => !m.is_read).length

  return (
    <div style={{ padding: '36px 40px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>
          Contact Messages {unreadCount > 0 && <span style={{ fontSize: '1rem', color: 'var(--orange)', fontFamily: 'var(--font-mono)' }}>({unreadCount} new)</span>}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Messages from the contact form</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'unread', 'read'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="btn btn-sm" style={{ background: filter === f ? 'var(--accent)' : 'var(--bg-card)', color: filter === f ? 'var(--bg-primary)' : 'var(--text-secondary)', border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`, fontWeight: filter === f ? 700 : 500, textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? <div className="loading-container"><div className="spinner" /></div> : filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No messages</div>
          ) : filtered.map(m => (
            <div key={m.id} onClick={() => { setSelected(m); if (!m.is_read) markRead(m.id) }}
              style={{
                padding: '16px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                background: selected?.id === m.id ? 'rgba(0,217,255,0.05)' : m.is_read ? 'transparent' : 'rgba(247,129,102,0.04)',
                borderLeft: `3px solid ${selected?.id === m.id ? 'var(--accent)' : m.is_read ? 'transparent' : 'var(--orange)'}`,
                transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontWeight: m.is_read ? 500 : 700, fontSize: '0.875rem' }}>{m.sender_name}</div>
                {!m.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0 }} />}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                {m.subject || 'No subject'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>

        {selected ? (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{selected.subject || 'No subject'}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>From: <strong>{selected.sender_name}</strong> · {selected.sender_email}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => deleteMessage(selected.id)} className="btn btn-sm btn-danger"><Trash2 size={13} /></button>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 20, lineHeight: 1.7, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20, whiteSpace: 'pre-wrap' }}>
              {selected.message}
            </div>
            <a href={`mailto:${selected.sender_email}?subject=Re: ${selected.subject || 'Your message'}`}
              className="btn btn-primary btn-sm">
              <Mail size={13} />Reply via Email
            </a>
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Mail size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
            <p style={{ fontSize: '0.875rem' }}>Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMessages
