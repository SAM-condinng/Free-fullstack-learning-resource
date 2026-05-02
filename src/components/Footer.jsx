import React from 'react'
import { Link } from 'react-router-dom'
import { Code2, Twitter, Github, Youtube, Linkedin, Mail, Phone } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      padding: '60px 0 32px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, textDecoration: 'none' }}>
              <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code2 size={20} color="var(--bg-primary)" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Stack<span style={{ color: 'var(--accent)' }}>Path</span>
              </span>
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 300, marginBottom: 20 }}>
              Empowering the next generation of full-stack developers with free, high-quality learning resources.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { icon: Github, href: 'https://github.com', label: 'GitHub' },
                { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
                { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--text-secondary)', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 16 }}>LEARN</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/courses', label: 'All Courses' },
                { to: '/courses?cat=frontend', label: 'Frontend Dev' },
                { to: '/courses?cat=backend', label: 'Backend Dev' },
                { to: '/courses?cat=fullstack', label: 'Full Stack' },
                { to: '/courses?cat=databases', label: 'Databases' },
              ].map(link => (
                <Link key={link.to} to={link.to} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 16 }}>RESOURCES</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: 'https://www.w3schools.com', label: 'W3Schools' },
                { href: 'https://developer.mozilla.org', label: 'MDN Web Docs' },
                { href: 'https://www.freecodecamp.org', label: 'freeCodeCamp' },
                { href: 'https://www.theodinproject.com', label: 'The Odin Project' },
                { href: 'https://roadmap.sh', label: 'Roadmap.sh' },
              ].map(link => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 16 }}>CONTACT</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <Mail size={14} />stackpath@gmail.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <Phone size={14} />+254 712 345 678
              </div>
              <Link to="/contact" className="btn btn-secondary btn-sm" style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                Send Message
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © {year} StackPath (Go-Pro-Design). Founded by Samuel M Gachuru. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service'].map(label => (
              <span key={label} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          footer .container > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          footer .container > div:first-child { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  )
}
