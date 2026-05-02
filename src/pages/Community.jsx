import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Star, Send, Users, ExternalLink } from 'lucide-react'

const communityLinks = [
  { name: 'GitHub', url: 'https://github.com', desc: 'Collaborate on code and open source projects', emoji: '🐙', color: '#333' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: 'Get answers to your coding questions', emoji: '📚', color: '#f48024' },
  { name: 'Dev.to', url: 'https://dev.to', desc: 'Share articles and connect with developers', emoji: '✍️', color: '#0a0a0a' },
  { name: 'Discord Communities', url: 'https://discord.com', desc: 'Join real-time developer chats', emoji: '💬', color: '#5865f2' },
  { name: 'Reddit r/learnprogramming', url: 'https://reddit.com/r/learnprogramming', desc: 'Beginner-friendly programming community', emoji: '🤝', color: '#ff4500' },
  { name: 'LinkedIn', url: 'https://linkedin.com', desc: 'Network with tech professionals', emoji: '🌐', color: '#0077b5' },
]

export default function Community() {
  const { user, profile } = useAuth()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ content: '', rating: 5 })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchTestimonials() }, [])

  async function fetchTestimonials() {
    const { data } = await supabase.from('testimonials').select('*').eq('is_approved', true).order('created_at', { ascending: false })
    setTestimonials(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { setError('Please log in to share your story.'); return }
    if (form.content.trim().length < 20) { setError('Please write at least 20 characters.'); return }
    setSubmitting(true)
    const { error } = await supabase.from('testimonials').insert({
      user_id: user.id,
      author_name: profile?.full_name || user.email,
      author_location: '',
      content: form.content,
      rating: form.rating,
      is_approved: false,
    })
    setSubmitting(false)
    if (error) setError(error.message)
    else { setSubmitted(true); setForm({ content: '', rating: 5 }) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, paddingTop: 'var(--nav-height)' }}>
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '48px 0' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 20, background: 'rgba(0,217,255,0.08)', color: 'var(--accent)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
              <Users size={12} />COMMUNITY
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', marginBottom: 12 }}>
              Learner Stories & Community
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
              Real experiences from people learning full-stack development — and links to connect with the wider developer community.
            </p>
          </div>
        </div>

        <div className="container" style={{ padding: '60px 24px' }}>
          {/* Testimonials */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 28 }}>
            Success Stories
          </h2>
          {loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : (
            <div className="grid-2" style={{ marginBottom: 60 }}>
              {testimonials.map(t => (
                <div key={t.id} className="card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} fill="var(--yellow)" color="var(--yellow)" />
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>
                    "{t.content}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700, color: 'white', flexShrink: 0,
                    }}>
                      {t.author_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.author_name}</div>
                      {t.author_location && <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{t.author_location}</div>}
                    </div>
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No stories yet — be the first to share yours below!
                </div>
              )}
            </div>
          )}

          {/* Submit story */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 60 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 8 }}>
                Share Your Story
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                Has StackPath helped you? Share your experience with the community. Stories are reviewed before publishing.
              </p>
              <div className="card" style={{ padding: 28 }}>
                {submitted ? (
                  <div className="alert alert-success">
                    🎉 Thank you! Your story has been submitted and will appear after review.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {error && <div className="alert alert-error">{error}</div>}
                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                            <Star size={24} fill={n <= form.rating ? 'var(--yellow)' : 'none'} color={n <= form.rating ? 'var(--yellow)' : 'var(--text-muted)'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your Story</label>
                      <textarea className="form-input" rows={5} placeholder="How has StackPath helped your learning journey?"
                        value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        style={{ resize: 'vertical', lineHeight: 1.6 }} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting || !user}>
                      <Send size={15} />
                      {!user ? 'Log in to share' : submitting ? 'Submitting…' : 'Submit Story'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Community links */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 8 }}>
                Join the Developer Community
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                Connect with other developers beyond this platform
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {communityLinks.map(link => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>{link.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{link.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{link.desc}</div>
                      </div>
                      <ExternalLink size={14} color="var(--text-muted)" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
