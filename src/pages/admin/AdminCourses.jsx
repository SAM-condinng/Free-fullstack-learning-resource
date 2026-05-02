import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, Edit2, Trash2, BookOpen, Eye, EyeOff, ChevronRight, Save, X } from 'lucide-react'

const emptyForm = { title: '', slug: '', description: '', long_description: '', category: 'frontend', difficulty: 'beginner', estimated_hours: 10, is_published: false }

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    const { data } = await supabase.from('courses').select(`*, lessons(count)`).order('created_at', { ascending: false })
    if (data) setCourses(data.map(c => ({ ...c, lesson_count: c.lessons?.[0]?.count || 0 })))
    setLoading(false)
  }

  function openCreate() { setForm(emptyForm); setEditId(null); setShowForm(true); setError('') }
  function openEdit(course) {
    setForm({ title: course.title, slug: course.slug, description: course.description || '', long_description: course.long_description || '', category: course.category, difficulty: course.difficulty, estimated_hours: course.estimated_hours, is_published: course.is_published })
    setEditId(course.id); setShowForm(true); setError('')
  }

  async function handleSave() {
    if (!form.title || !form.slug) { setError('Title and slug are required'); return }
    setSaving(true)
    const payload = { ...form, updated_at: new Date().toISOString() }
    if (editId) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('courses').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }
    setSaving(false); setShowForm(false); fetchCourses()
  }

  async function togglePublish(course) {
    await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', course.id)
    fetchCourses()
  }

  async function deleteCourse(id) {
    if (!confirm('Delete this course and all its lessons? This cannot be undone.')) return
    await supabase.from('courses').delete().eq('id', id)
    fetchCourses()
  }

  const catColors = { frontend: 'var(--accent)', backend: 'var(--green)', fullstack: 'var(--purple)', databases: 'var(--yellow)', devops: 'var(--orange)' }

  return (
    <div style={{ padding: '36px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>Courses & Content</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage courses, lessons, and learning materials</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={16} />New Course
        </button>
      </div>

      {/* Form modal overlay */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 640, padding: 36, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
                {editId ? 'Edit Course' : 'New Course'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" placeholder="Course title" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: editId ? f.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug *</label>
                  <input className="form-input" placeholder="url-slug" value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {['frontend', 'backend', 'fullstack', 'databases', 'devops'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select className="form-input" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                    {['beginner', 'intermediate', 'advanced'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Est. Hours</label>
                  <input className="form-input" type="number" min={1} value={form.estimated_hours}
                    onChange={e => setForm(f => ({ ...f, estimated_hours: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea className="form-input" rows={2} placeholder="Brief course summary shown in cards"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Full Description</label>
                <textarea className="form-input" rows={4} placeholder="Detailed description shown on course page"
                  value={form.long_description} onChange={e => setForm(f => ({ ...f, long_description: e.target.value }))} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} style={{ accentColor: 'var(--green)', width: 16, height: 16 }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Published (visible to learners)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                <Save size={15} />{saving ? 'Saving…' : 'Save Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses table */}
      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Lessons</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No courses yet. Create your first one!</td></tr>
              ) : courses.map(course => (
                <tr key={course.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{course.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{course.slug}</div>
                  </td>
                  <td>
                    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, background: `${catColors[course.category] || 'var(--accent)'}18`, color: catColors[course.category] || 'var(--accent)' }}>
                      {course.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{course.difficulty}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{course.lesson_count}</td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, background: course.is_published ? 'rgba(63,185,80,0.1)' : 'rgba(139,148,158,0.1)', color: course.is_published ? 'var(--green)' : 'var(--text-muted)' }}>
                      {course.is_published ? 'LIVE' : 'DRAFT'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/admin/courses/${course.id}/lessons`} className="btn btn-sm btn-ghost" title="Manage lessons">
                        <BookOpen size={13} />Lessons
                      </Link>
                      <button onClick={() => togglePublish(course)} className="btn btn-sm btn-ghost" title={course.is_published ? 'Unpublish' : 'Publish'}>
                        {course.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button onClick={() => openEdit(course)} className="btn btn-sm btn-ghost">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => deleteCourse(course.id)} className="btn btn-sm btn-danger">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
