import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Loader2, Gem, Crown, Medal, Check, CheckCircle2, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export interface SignalPlan {
  id: string
  name: string
  price: number
  percentage: number
  description: string
  features: string[]
  sortOrder: number
  subscribedAt: string | null
}

const CARD: React.CSSProperties = { background: 'hsl(20 12% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem' }
const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// Tier look by name; any other plan the admin adds gets the orange default
const TIERS: Record<string, { color: string; icon: React.ElementType }> = {
  silver:  { color: '#cbd5e1', icon: Medal },
  gold:    { color: '#f59e0b', icon: Crown },
  diamond: { color: '#7dd3fc', icon: Gem },
}
const tierOf = (name: string) => TIERS[name.trim().toLowerCase()] ?? { color: '#fb923c', icon: Radio }

export function Signal() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const balance = user?.balance ?? 0

  const [plans, setPlans]     = useState<SignalPlan[] | null>(null)
  const [error, setError]     = useState('')
  const [flash, setFlash]     = useState('')
  const [confirm, setConfirm] = useState<SignalPlan | null>(null)

  const load = useCallback(() => {
    api.get<{ success: boolean; data: SignalPlan[] }>('/user/signal-plans')
      .then(r => setPlans(r.data))
      .catch(e => setError(e.message ?? 'Could not load signal plans'))
  }, [])
  useEffect(() => { load() }, [load])

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto overflow-x-hidden">
      <div className="mb-6">
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'hsl(40 6% 95%)', marginBottom: 3 }}>Signal</h1>
        <p style={{ fontSize: 13, color: 'hsl(240 5% 55%)' }}>Choose a signal plan that fits your trading</p>
      </div>

      {flash && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: 'hsl(40 6% 88%)' }}>{flash}</p>
        </div>
      )}

      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'hsl(240 5% 50%)', marginBottom: 10 }}>SIGNAL LIST</p>

      {error && <div style={{ ...CARD, padding: '2rem', textAlign: 'center', color: '#f87171', fontSize: 13 }}>{error}</div>}

      {!error && !plans && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <Loader2 size={28} className="animate-spin" style={{ color: 'hsl(240 5% 40%)' }} />
        </div>
      )}

      {plans && plans.length === 0 && (
        <div style={{ ...CARD, padding: '3rem 1.5rem', textAlign: 'center' }}>
          <Radio size={28} style={{ color: 'hsl(240 5% 45%)', margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: 14, fontWeight: 500, color: 'hsl(40 6% 75%)' }}>No signal plans available right now</p>
        </div>
      )}

      {plans && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(p => {
            const t = tierOf(p.name)
            const subscribed = Boolean(p.subscribedAt)
            return (
              <div key={p.id} style={{
                ...CARD, padding: '1.5rem', display: 'flex', flexDirection: 'column', borderTop: `2px solid ${t.color}`,
                ...(subscribed ? { borderColor: 'rgba(74,222,128,0.35)', borderTopColor: t.color } : {}),
              }}>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div style={{ width: 42, height: 42, borderRadius: '0.75rem', background: `${t.color}1f`, border: `1px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <t.icon size={20} style={{ color: t.color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 17, fontWeight: 700, color: 'hsl(40 6% 95%)' }}>{p.name}</p>
                      {p.description && <p style={{ fontSize: 12, color: 'hsl(240 5% 55%)', marginTop: 2 }}>{p.description}</p>}
                    </div>
                  </div>
                  {subscribed && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'rgba(74,222,128,0.12)', color: '#4ade80', whiteSpace: 'nowrap' }}>
                      SUBSCRIBED
                    </span>
                  )}
                </div>

                <div style={{ borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 18 }}>
                  <div className="flex items-center justify-between" style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 13, color: 'hsl(240 5% 58%)' }}>Signal Price</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'hsl(40 6% 95%)' }}>{fmt(p.price)}</span>
                  </div>
                  <div className="flex items-center justify-between" style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 13, color: 'hsl(240 5% 58%)' }}>Percentage</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: t.color }}>{p.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between" style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ fontSize: 13, color: 'hsl(240 5% 58%)' }}>Status</span>
                    {subscribed
                      ? <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>Subscribed · {fmtDate(p.subscribedAt!)}</span>
                      : <span style={{ fontSize: 13, color: 'hsl(240 5% 50%)' }}>Not subscribed</span>}
                  </div>
                </div>

                {p.features?.length > 0 && (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {p.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'hsl(40 6% 82%)' }}>
                        <Check size={14} style={{ color: t.color, flexShrink: 0, marginTop: 2 }} /> {f}
                      </li>
                    ))}
                  </ul>
                )}

                {subscribed ? (
                  <button disabled style={{ marginTop: 'auto', width: '100%', padding: '0.75rem', borderRadius: '0.625rem', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', cursor: 'default' }}>
                    <CheckCircle2 size={15} /> Subscribed
                  </button>
                ) : (
                  <button
                    onClick={() => { setFlash(''); setConfirm(p) }}
                    style={{ marginTop: 'auto', width: '100%', padding: '0.75rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)', color: '#050505' }}
                  >
                    Subscribe
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {confirm && (
        <ConfirmModal
          plan={confirm}
          balance={balance}
          onCancel={() => setConfirm(null)}
          onDeposit={() => navigate('/dashboard/deposit')}
          onDone={msg => { setConfirm(null); setFlash(msg); load(); refreshUser().catch(() => {}) }}
        />
      )}
    </div>
  )
}

function ConfirmModal({ plan, balance, onCancel, onDone, onDeposit }: {
  plan: SignalPlan; balance: number; onCancel: () => void; onDone: (msg: string) => void; onDeposit: () => void
}) {
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')
  const short = balance < plan.price

  async function subscribe() {
    setBusy(true); setError('')
    try {
      await api.post(`/user/signal-plans/${plan.id}/subscribe`, {})
      onDone(`You're now subscribed to ${plan.name}. ${fmt(plan.price)} was deducted from your balance.`)
    } catch (e: any) {
      setError(e.message ?? 'Could not complete your subscription.')
      setBusy(false)
    }
  }

  return (
    <div onClick={() => !busy && onCancel()} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ ...CARD, background: 'hsl(20 12% 6%)', width: '100%', maxWidth: 420, padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: 17, fontWeight: 700, color: 'hsl(40 6% 95%)' }}>Confirm Subscription</p>
          <button onClick={onCancel} disabled={busy} aria-label="Close" style={{ background: 'none', border: 'none', color: 'hsl(240 5% 60%)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'hsl(240 5% 60%)', marginBottom: 16, lineHeight: 1.6 }}>
          Subscribe to the <b style={{ color: 'hsl(40 6% 92%)' }}>{plan.name}</b> signal? The price will be deducted from your balance.
        </p>

        {[
          ['Signal price',          fmt(plan.price)],
          ['Percentage',            `${plan.percentage}%`],
          ['Your balance',          fmt(balance)],
          ['Balance after',         fmt(Math.max(0, balance - plan.price))],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between" style={{ fontSize: 13, padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'hsl(240 5% 58%)' }}>{k}</span>
            <span style={{ color: 'hsl(40 6% 90%)', fontWeight: 600 }}>{v}</span>
          </div>
        ))}

        {short && (
          <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 12 }}>
            Your balance is too low for this plan.{' '}
            <button onClick={onDeposit} style={{ color: '#fb923c', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}>Deposit funds</button>
          </p>
        )}
        {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 12 }}>{error}</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} disabled={busy}
            style={{ flex: 1, padding: '0.7rem', borderRadius: '0.625rem', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 88%)' }}>
            Cancel
          </button>
          <button onClick={subscribe} disabled={busy || short}
            style={{ flex: 1, padding: '0.7rem', borderRadius: '0.625rem', fontSize: 13, fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: short ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)', color: short ? 'hsl(240 5% 40%)' : '#050505', cursor: busy || short ? 'default' : 'pointer' }}>
            {busy ? <><Loader2 size={14} className="animate-spin" /> Subscribing…</> : 'Yes, Subscribe'}
          </button>
        </div>
      </div>
    </div>
  )
}
