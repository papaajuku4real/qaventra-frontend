import { useState } from 'react'
import { Send, CheckCircle2, Loader2, X } from 'lucide-react'
import { api } from '@/lib/api'

type Source = 'help' | 'suspended' | 'banned'

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: 'hsl(240 5% 50%)', marginBottom: 6,
  letterSpacing: '0.05em', textTransform: 'uppercase',
}
const INPUT: React.CSSProperties = {
  width: '100%', padding: '0 14px', height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(40 6% 92%)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
}

/**
 * Sends a message to the support inbox (POST /support/contact).
 * askIdentity: show name + email fields (for signed-out users, e.g. banned accounts).
 */
export function ContactSupportForm({ source, askIdentity = false, defaultSubject = '', defaultEmail = '', accent = '#fb923c' }: {
  source: Source; askIdentity?: boolean; defaultSubject?: string; defaultEmail?: string; accent?: string
}) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState(defaultEmail)
  const [subject, setSubject] = useState(defaultSubject)
  const [message, setMessage] = useState('')
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  const ready = subject.trim() && message.trim() && (!askIdentity || (name.trim() && email.trim()))

  async function send() {
    if (!ready || busy) return
    if (message.trim().length < 10) return setError('Please describe your issue (at least 10 characters).')
    setBusy(true); setError('')
    try {
      await api.post('/support/contact', {
        source, subject: subject.trim(), message: message.trim(),
        ...(askIdentity ? { name: name.trim(), email: email.trim() } : {}),
      })
      setSent(true)
    } catch (e: any) {
      setError(e.message ?? 'Could not send your message. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <CheckCircle2 size={40} style={{ color: '#4ade80', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(40 6% 94%)', marginBottom: 6 }}>Message sent</p>
        <p style={{ fontSize: 12, color: 'hsl(240 5% 55%)', marginBottom: 14 }}>Our support team will reply to your email within 24 hours.</p>
        <button
          onClick={() => { setSent(false); setSubject(defaultSubject); setMessage('') }}
          style={{ fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'left' }}>
      {askIdentity && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: 14 }}>
          <div>
            <label style={LABEL}>Your name</label>
            <input value={name} onChange={e => { setName(e.target.value); setError('') }} placeholder="John Doe" style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Registered email</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder="you@example.com" style={INPUT} />
          </div>
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <label style={LABEL}>Subject</label>
        <input value={subject} onChange={e => { setSubject(e.target.value); setError('') }} placeholder="e.g. Issue with withdrawal" maxLength={150} style={INPUT} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={LABEL}>Message</label>
        <textarea
          value={message} onChange={e => { setMessage(e.target.value); setError('') }} rows={5} maxLength={5000}
          placeholder="Describe your issue in detail..."
          style={{ ...INPUT, height: 'auto', padding: '12px 14px', resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>
      {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 12 }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={send} disabled={!ready || busy}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 10, border: 'none',
            fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
            background: ready ? 'linear-gradient(135deg,#fb923c,#ea580c)' : 'rgba(255,255,255,0.05)',
            color: ready ? '#050505' : 'hsl(240 5% 40%)', cursor: ready && !busy ? 'pointer' : 'default',
          }}
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} {busy ? 'Sending…' : 'Send Message'}
        </button>
      </div>
    </div>
  )
}

/** The same form in a popup — used on the suspended overlay and the banned page. */
export function ContactSupportModal({ source, askIdentity, defaultSubject, defaultEmail, onClose }: {
  source: Source; askIdentity?: boolean; defaultSubject?: string; defaultEmail?: string; onClose: () => void
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', background: 'hsl(20 12% 6%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'hsl(40 6% 94%)', marginBottom: 3 }}>Contact Support</p>
            <p style={{ fontSize: 12, color: 'hsl(240 5% 55%)' }}>We'll reply to your email within 24 hours.</p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: 'hsl(240 5% 60%)', cursor: 'pointer', padding: 2 }}>
            <X size={18} />
          </button>
        </div>
        <ContactSupportForm source={source} askIdentity={askIdentity} defaultSubject={defaultSubject} defaultEmail={defaultEmail} />
      </div>
    </div>
  )
}
