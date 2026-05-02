import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { Mail, Phone, Send, CheckCircle, MessageSquare } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ sender_name: '', sender_email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.message.trim().length < 10) { setError('Please write a longer message.'); return }
    setSending(true)
    setError('')
    const { error } = await supabase.from('contact_messages').insert(form)
    setSending(false)
    if (error) setError(error.message)
    else { setSent(true); setForm({ sender_name: '', sender_email: '', subject: '', message: '' }) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, paddingTop: 'var(--nav-height)' }}>
        {/* Header */}
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '48px 0' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', marginBottom: 12 }}>Contact Us</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Have a question, suggestion, or need help? We'd love to hear from you.
            </p>
          </div>
        </div>

        <div className="container" style={{ padding: '60px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 60, alignItems: 'start' }}>
            {/* Info */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', marginBottom: 24 }}>
                Get in Touch
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 }}>
                {[
                  { icon: Mail, label: 'Email', value: 'stackpath@gmail.com', color: 'var(--accent)' },
                  { icon: Phone, label: 'Helpline', value: '+254 712 345 678', color: 'var(--green)' },
                  { icon: MessageSquare, label: 'Response time', value: 'Within 24–48 hours', color: 'var(--purple)' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 10 }}>FAQ</h3>
                {[
                  { q: 'Is StackPath really free?', a: 'Yes, 100% free. No hidden costs, no credit card required.' },
                  { q: 'Do I need an account to learn?', a: 'You can browse courses freely. An account is needed to track progress.' },
                  { q: 'How do I become an admin?', a: 'Contact us and we will manually assign you the admin role in Supabase.' },
                ].map(({ q, a }) => (
                  <div key={q} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{q}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>{a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div>
              <div className="card" style={{ padding: 36 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 24 }}>
                  Send a Message
                </h2>

                {sent ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <CheckCircle size={48} color="var(--green)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>Message Sent!</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>We'll get back to you within 24–48 hours.</p>
                    <button onClick={() => setSent(false)} className="btn btn-ghost btn-sm" style={{ marginTop: 20 }}>
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {error && <div className="alert alert-error">{error}</div>}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div className="form-group">
                        <label className="form-label">Your Name</label>
                        <input className="form-input" type="text" placeholder="Samuel Gachuru" required
                          value={form.sender_name} onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="you@email.com" required
                          value={form.sender_email} onChange={e => setForm(f => ({ ...f, sender_email: e.target.value }))} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input className="form-input" type="text" placeholder="How can we help?"
                        value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message</label>
                      <textarea className="form-input" rows={6} placeholder="Write your message here…" required
                        style={{ resize: 'vertical', lineHeight: 1.6 }}
                        value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={sending} style={{ justifyContent: 'center' }}>
                      <Send size={16} />
                      {sending ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
