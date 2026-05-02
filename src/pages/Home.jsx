import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CourseCard from '../components/CourseCard'
import { supabase } from '../lib/supabase'
import {
  Code2, Layers, Server, Database, ArrowRight,
  Star, Users, BookOpen, Trophy, ExternalLink, ChevronRight, Play, Zap
} from 'lucide-react'

const freePlatforms = [
  { name: 'freeCodeCamp', desc: 'Full curriculum, certifications', url: 'https://www.freecodecamp.org', color: '#0A0A23' },
  { name: 'The Odin Project', desc: 'Project-based web dev path', url: 'https://www.theodinproject.com', color: '#cc3f3f' },
  { name: 'W3Schools', desc: 'Reference and tutorials', url: 'https://www.w3schools.com', color: '#04aa6d' },
  { name: 'MDN Web Docs', desc: 'Mozilla developer reference', url: 'https://developer.mozilla.org', color: '#000083' },
  { name: 'CS50 – Harvard', desc: 'World-famous intro to CS', url: 'https://cs50.harvard.edu/web', color: '#a51c30' },
  { name: 'Scrimba', desc: 'Interactive coding screencasts', url: 'https://scrimba.com', color: '#2c2c2c' },
  { name: 'Roadmap.sh', desc: 'Visual developer roadmaps', url: 'https://roadmap.sh', color: '#ec4899' },
  { name: 'Khan Academy', desc: 'Beginner computing courses', url: 'https://www.khanacademy.org/computing', color: '#14bf96' },
]

const stats = [
  { value: '5', label: 'Core Courses', icon: BookOpen },
  { value: '30+', label: 'Video Lessons', icon: Play },
  { value: '8', label: 'Free Platforms', icon: ExternalLink },
  { value: '100%', label: 'Free Forever', icon: Trophy },
]

export default function Home() {
  const [courses, setCourses] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [announcement, setAnnouncement] = useState(null)

  useEffect(() => {
    fetchCourses()
    fetchTestimonials()
    fetchAnnouncement()
  }, [])

  async function fetchCourses() {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .limit(3)
    if (data) setCourses(data)
  }

  async function fetchTestimonials() {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .limit(4)
    if (data) setTestimonials(data)
  }

  async function fetchAnnouncement() {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data) setAnnouncement(data)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Announcement banner */}
      {announcement && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(0,217,255,0.1), rgba(163,113,247,0.1))',
          borderBottom: '1px solid rgba(0,217,255,0.2)',
          padding: '10px 24px',
          textAlign: 'center',
          marginTop: 'var(--nav-height)',
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', marginRight: 10 }}>📢 ANNOUNCEMENT</span>
            {announcement.title} — {announcement.content}
          </p>
        </div>
      )}

      {/* Hero */}
      <section style={{
        minHeight: announcement ? 'calc(100vh - var(--nav-height) - 44px)' : 'calc(100vh - var(--nav-height))',
        marginTop: announcement ? 0 : 'var(--nav-height)',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,217,255,0.08) 0%, transparent 60%)',
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '80px 24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.2)',
            color: 'var(--accent)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
            marginBottom: 28,
          }}>
            <Zap size={12} />FREE · SELF-PACED · NO ACCOUNT NEEDED TO BROWSE
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.1,
            color: 'var(--text-primary)', marginBottom: 24, letterSpacing: '-0.03em',
          }}>
            Become a<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Full-Stack Developer
            </span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            Master HTML, CSS, JavaScript, Node.js, Databases and more. Self-paced video lessons,
            curated resources from the best free platforms, and a progress tracker to keep you on track.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-primary btn-lg">
              <BookOpen size={18} />Explore Courses<ArrowRight size={18} />
            </Link>
            <Link to="/signup" className="btn btn-ghost btn-lg">
              <Users size={18} />Create Free Account
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap',
            marginTop: 64,
          }}>
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--accent)' }}>{value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Your Learning Path</h2>
            <p className="section-subtitle">A structured journey from fundamentals to full-stack mastery</p>
          </div>
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
            {[
              { step: '01', icon: Code2, label: 'HTML & CSS', color: 'var(--accent)', desc: 'Structure & Style' },
              { step: '02', icon: Zap, label: 'JavaScript', color: 'var(--yellow)', desc: 'Interactivity' },
              { step: '03', icon: Layers, label: 'React.js', color: 'var(--purple)', desc: 'Component UIs' },
              { step: '04', icon: Server, label: 'Node & Express', color: 'var(--green)', desc: 'Backend APIs' },
              { step: '05', icon: Database, label: 'Databases', color: 'var(--orange)', desc: 'Data Storage' },
            ].map((step, i) => (
              <React.Fragment key={step.step}>
                <div style={{ flex: '1 1 160px', textAlign: 'center', padding: '24px 16px' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: `${step.color}18`, border: `2px solid ${step.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <step.icon size={24} color={step.color} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: step.color, marginBottom: 4 }}>STEP {step.step}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{step.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                </div>
                {i < 4 && (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--border-light)', flexShrink: 0 }}>
                    <ChevronRight size={20} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="section-subtitle">Start with these curated full-stack development courses</p>
            </div>
            <Link to="/courses" className="btn btn-ghost btn-sm">
              View All Courses <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid-3">
            {courses.length > 0
              ? courses.map(course => <CourseCard key={course.id} course={course} />)
              : [1, 2, 3].map(i => (
                <div key={i} className="card" style={{ padding: 24, minHeight: 220 }}>
                  <div style={{ background: 'var(--border)', height: 12, borderRadius: 6, marginBottom: 12, width: '60%' }} />
                  <div style={{ background: 'var(--border)', height: 8, borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ background: 'var(--border)', height: 8, borderRadius: 4, width: '80%' }} />
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* Free Platforms */}
      <section style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Linked Free Platforms</h2>
            <p className="section-subtitle">We connect you with the best free learning resources on the internet</p>
          </div>
          <div className="grid-4">
            {freePlatforms.map(platform => (
              <a key={platform.name} href={platform.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '20px', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: platform.color, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white',
                    }}>
                      {platform.name[0]}
                    </div>
                    <ExternalLink size={14} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{platform.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{platform.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 className="section-title">Learner Success Stories</h2>
              <p className="section-subtitle">Real results from our community</p>
            </div>
            <div className="grid-2">
              {testimonials.map(t => (
                <div key={t.id} className="card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                    {[...Array(t.rating || 5)].map((_, i) => <Star key={i} size={14} fill="var(--yellow)" color="var(--yellow)" />)}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 18, fontStyle: 'italic' }}>
                    "{t.content}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1rem', color: 'white',
                    }}>
                      {t.author_name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.author_name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{t.author_location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, rgba(0,217,255,0.06) 0%, rgba(163,113,247,0.06) 100%)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 16 }}>
            Ready to Start Coding?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1rem', maxWidth: 480, margin: '0 auto 32px' }}>
            Create your free account, track your progress, and join thousands of learners building their future.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Learning Free <ArrowRight size={18} />
            </Link>
            <Link to="/courses" className="btn btn-ghost btn-lg">Browse Courses</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
