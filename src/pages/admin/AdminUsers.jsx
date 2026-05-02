import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Shield, User, ChevronDown } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function changeRole(userId, newRole) {
    setUpdating(userId)
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u))
    setUpdating(null)
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.username || '').toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div style={{ padding: '36px 40px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>Users</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage learner accounts and admin access</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Users', value: users.length, color: 'var(--accent)' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'var(--purple)' },
          { label: 'Learners', value: users.filter(u => u.role === 'learner').length, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '12px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: s.color }}>{s.value}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search by name or username…" style={{ paddingLeft: 36 }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 'auto', minWidth: 140 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="learner">Learner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: u.role === 'admin' ? 'linear-gradient(135deg, var(--purple), var(--accent))' : 'linear-gradient(135deg, var(--accent), var(--green))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {(u.full_name || u.username || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{u.full_name || 'Unnamed User'}</div>
                        {u.bio && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {u.username ? `@${u.username}` : '—'}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                      background: u.role === 'admin' ? 'rgba(163,113,247,0.12)' : 'rgba(0,217,255,0.08)',
                      color: u.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
                    }}>
                      {u.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                      {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <select
                      value={u.role || 'learner'}
                      disabled={updating === u.id}
                      onChange={e => changeRole(u.id, e.target.value)}
                      style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '5px 10px', color: 'var(--text-primary)',
                        fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
                        opacity: updating === u.id ? 0.5 : 1,
                      }}>
                      <option value="learner">Learner</option>
                      <option value="admin">Admin</option>
                    </select>
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
