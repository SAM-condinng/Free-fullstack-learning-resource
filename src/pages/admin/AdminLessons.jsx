import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, ExternalLink, Eye, EyeOff, GripVertical } from 'lucide-react'

const emptyLesson = { title: '', description: '', youtube_embed_id: '', content: '', order_index: 1, duration_minutes: 30, is_published: false }
const emptyResource = { title: '', url: '', platform: '', resource_type: 'documentation' }

export default function AdminLessons() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyLesson)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [resources, setResources] = useState([])
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [resourceForm, setResourceForm] = useState(emptyResource)

  useEffect(() => { fetchData() }, [courseId])

  async function fetchData() {
    const { data: c } = await supabase.from('courses').select('*').eq('id', courseId).single()
    setCourse(c)
    const { data: l } = await supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index')
    setLessons(l || [])
    setLoading(false)
  }

  async function fetchResources(lessonId) {
    const { data } = await supabase.from('lesson_resources').select('*').eq('lesson_id', lessonId)
    setResources(data || [])
  }

  function openCreate() {
    setForm({ ...emptyLesson, order_index: (lessons.length + 1) })
    setEditId(null); setShowForm(true); setError('')
  }

  function openEdit(lesson) {
    setForm({ title: lesson.title, description: lesson.description || '', youtube_embed_id: lesson.youtube_embed_id || '', content: lesson.content || '', order_index: lesson.order_index, duration_minutes: lesson.duration_minutes, is_published: lesson.is_published })
    setEditId(lesson.id); setShowForm(true); setError('')
  }

  async function handleSave() {
    if (!form.title) { setError('Title is required'); return }
    setSaving(true)
    const payload = { ...form, course_id: courseId, updated_at: new Date().toISOString() }
    if (editId) {
      const { error } = await supabase.from('lessons').update(payload).eq('id', editId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('lessons').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }
    setSaving(false); setShowForm(false); fetchData()
  }

  async function deleteLesson(id) {
    if (!confirm('Delete this lesson?')) return
    await supabase.from('lessons').delete().eq('id', id)
    fetchData()
  }

  async function togglePublish(lesson) {
    await supabase.from('lessons').update({ is_published: !lesson.is_published }).eq('id', lesson.id)
    fetchData()
  }

  async function selectLesson(lesson) {
    setSelectedLesson(lesson)
    fetchResources(lesson.id)
    setShowResourceForm(false)
  }

  async function addResource() {
    if (!resourceForm.title || !resourceForm.url) return
    await supabase.from('lesson_resources').insert({ ...resourceForm, lesson_id: selectedLesson.id })
    fetchResources(selectedLesson.id)
    setResourceForm(emptyResource)
    setShowResourceForm(false)
  }

  async function deleteResource(id) {
    await supabase.from('lesson_resources').delete().eq('id', id)
    fetchResources(selectedLesson.id)
  }

  if (loading) return <div className="loading-container"><div className="spinner" /></div>

  return (
    <div style={{ padding: '36px 40px' }}>
      <Link to="/admin/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
        <ArrowLeft size={14} />Back to Courses
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>
            {course?.title} — Lessons
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{lessons.length} lessons · Manage content, videos, and resources</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} />Add Lesson</button>
      </div>

      {/* Lesson form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 680, padding: 36, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
                {editId ? 'Edit Lesson' : 'New Lesson'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Lesson Title *</label>
                <input className="form-input" placeholder="e.g. Introduction to HTML" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Short Description</label>
                <input className="form-input" placeholder="Brief overview" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">YouTube Video ID</label>
                  <input className="form-input" placeholder="e.g. kUMe1FH4CHE" value={form.youtube_embed_id}
                    onChange={e => setForm(f => ({ ...f, youtube_embed_id: e.target.value }))} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>From youtube.com/watch?v=<strong>ID</strong></span>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input className="form-input" type="number" min={1} value={form.duration_minutes}
                    onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Order / Position</label>
                  <input className="form-input" type="number" min={1} value={form.order_index}
                    onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Written Content (optional HTML)</label>
                <textarea className="form-input" rows={5} placeholder="You can use basic HTML for formatting…"
                  style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                  value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} style={{ accentColor: 'var(--green)', width: 16, height: 16 }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Published (visible to learners)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                <Save size={15} />{saving ? 'Saving…' : 'Save Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Lessons list */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>YouTube</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No lessons yet. Add your first lesson!</td></tr>
              ) : lessons.map(l => (
                <tr key={l.id} style={{ cursor: 'pointer', background: selectedLesson?.id === l.id ? 'rgba(0,217,255,0.04)' : 'transparent' }} onClick={() => selectLesson(l)}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{l.order_index}</td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{l.title}</div>
                    {l.description && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.description}</div>}
                  </td>
                  <td>
                    {l.youtube_embed_id ? (
                      <a href={`https://youtube.com/watch?v=${l.youtube_embed_id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                        <ExternalLink size={11} />Video
                      </a>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{l.duration_minutes}m</td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, background: l.is_published ? 'rgba(63,185,80,0.1)' : 'rgba(139,148,158,0.1)', color: l.is_published ? 'var(--green)' : 'var(--text-muted)' }}>
                      {l.is_published ? 'LIVE' : 'DRAFT'}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => togglePublish(l)} className="btn btn-sm btn-ghost">
                        {l.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => openEdit(l)} className="btn btn-sm btn-ghost"><Edit2 size={12} /></button>
                      <button onClick={() => deleteLesson(l.id)} className="btn btn-sm btn-danger"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resources panel */}
        <div>
          {selectedLesson ? (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                Resources — {selectedLesson.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 20 }}>
                Free platform links shown in this lesson
              </p>

              {resources.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.82rem' }}>{r.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.platform} · {r.resource_type}</div>
                  </div>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}><ExternalLink size={13} /></a>
                  <button onClick={() => deleteResource(r.id)} className="btn btn-sm btn-danger" style={{ padding: '4px 6px' }}><Trash2 size={12} /></button>
                </div>
              ))}

              {showResourceForm ? (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input className="form-input" placeholder="Resource title" value={resourceForm.title}
                    onChange={e => setResourceForm(f => ({ ...f, title: e.target.value }))} />
                  <input className="form-input" placeholder="URL" value={resourceForm.url}
                    onChange={e => setResourceForm(f => ({ ...f, url: e.target.value }))} />
                  <input className="form-input" placeholder="Platform (e.g. MDN Web Docs)" value={resourceForm.platform}
                    onChange={e => setResourceForm(f => ({ ...f, platform: e.target.value }))} />
                  <select className="form-input" value={resourceForm.resource_type}
                    onChange={e => setResourceForm(f => ({ ...f, resource_type: e.target.value }))}>
                    {['documentation', 'course', 'article', 'video', 'tool'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={addResource} className="btn btn-primary btn-sm" style={{ flex: 1 }}><Save size={13} />Add</button>
                    <button onClick={() => setShowResourceForm(false)} className="btn btn-ghost btn-sm"><X size={13} /></button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowResourceForm(true)} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                  <Plus size={15} />Add Resource
                </button>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              <ExternalLink size={28} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: '0.875rem' }}>Click a lesson to manage its resources</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
