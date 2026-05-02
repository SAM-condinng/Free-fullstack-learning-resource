import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Star, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react'

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchTestimonials() }, [])

  async function fetchTestimonials() {
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
    setTestimonials(data || [])
    setLoading(false)
  }

  async function toggleApprove(t) {
    await supabase.from('testimonials').update({ is_approved: !t.is_approved }).eq('id', t.id)
    setTestimonials(ts => ts.map(x => x.id === t.id ? { ...x, is_approved: !t.is_approved } : x))
  }

  async function deleteTestimonial(id) {
    if (!confirm('Delete this testimonial?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    setTestimonials(ts => ts.filter(t => t.id !== id))
  }

  const filtered = testimonials.filter(t => filter === 'all' || (filter === 'pending' && !t.is_approved) || (filter === 'approved' && t.is_approved))
  const pendingCount = testimonials.filter(t => !t.is_approved).length

  return (
    <div style={{ padding: '36px 40px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>
          Testimonials {pendingCount > 0 && <span style={{ fontSize: '1rem', color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>({pendingCount} pending)</span>}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review and approve learner stories</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['all', 'pending', 'approved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="btn btn-sm" style={{ background: filter === f ? 'var(--accent)' : 'var(--bg-card)', color: filter === f ? 'var(--bg-primary)' : 'var(--text-secondary)', border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`, fontWeight: filter === f ? 700 : 500, textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-container"><div className="spinner" /></div> : (
        <div className="grid-2">
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No testimonials found
            </div>
          ) : filtered.map(t => (
            <div key={t.id} className="card" style={{ padding: 24, border: `1px solid ${t.is_approved ? 'rgba(63,185,80,0.2)' : 'var(--border)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[...Array(t.rating || 5)].map((_, i) => <Star key={i} size={13} fill="var(--yellow)" color="var(--yellow)" />)}
                </div>
                <span style={{
                  padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                  background: t.is_approved ? 'rgba(63,185,80,0.1)' : 'rgba(227,179,65,0.1)',
                  color: t.is_approved ? 'var(--green)' : 'var(--yellow)',
                }}>
                  {t.is_approved ? 'PUBLISHED' : 'PENDING'}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>
                "{t.content}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                    {t.author_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{t.author_name}</div>
                    {t.author_location && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.author_location}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleApprove(t)} className="btn btn-sm"
                    style={{ background: t.is_approved ? 'rgba(247,129,102,0.1)' : 'rgba(63,185,80,0.1)', color: t.is_approved ? 'var(--orange)' : 'var(--green)', border: `1px solid ${t.is_approved ? 'rgba(247,129,102,0.3)' : 'rgba(63,185,80,0.3)'}` }}>
                    {t.is_approved ? <><EyeOff size={12} />Unpublish</> : <><CheckCircle size={12} />Approve</>}
                  </button>
                  <button onClick={() => deleteTestimonial(t.id)} className="btn btn-sm btn-danger">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {new Date(t.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
