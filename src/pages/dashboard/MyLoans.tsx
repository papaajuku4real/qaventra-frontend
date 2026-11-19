import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Landmark, Wallet, CheckCircle2, Clock, HandCoins, Loader2, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export interface Loan {
  id: string
  planName: string
  rate: number
  interest: string
  amount: number
  months: number
  purpose: string
  feeAmount: number
  interestAmount: number
  repayment: number
  monthly: number
  collateral: number
  repaid: number
  status: 'Active' | 'Pending' | 'Repaid' | 'Rejected'
  adminNote: string | null
  dueAt: string | null
  createdAt: string
}

const STATUS_STYLE: Record<Loan['status'], { color: string; bg: string; label: string }> = {
  Active:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  label: 'Active' },
  Pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Pending' },
  Repaid:   { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  label: 'Repaid' },
  Rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Declined' },
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const CARD: React.CSSProperties = { background: 'hsl(222 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem' }
const TH: React.CSSProperties = { textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'hsl(240 5% 50%)', padding: '0.75rem 1.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }
const TD: React.CSSProperties = { fontSize: 13, color: 'hsl(40 6% 88%)', padding: '0.875rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }
const PRIMARY_BTN: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.55rem 1rem', borderRadius: '0.6rem',
  background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', color: '#050505', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
}
const GHOST_BTN: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.5rem 0.875rem', borderRadius: '0.6rem', fontSize: 12,
  cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 88%)',
}

export function MyLoans() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const justApplied = (useLocation().state as { justApplied?: boolean } | null)?.justApplied

  const [loans, setLoans]   = useState<Loan[] | null>(null)
  const [error, setError]   = useState('')
  const [repayLoan, setRepayLoan] = useState<Loan | null>(null)
  const [flash, setFlash]   = useState('')

  const load = useCallback(() => {
    api.get<{ success: boolean; data: Loan[] }>('/user/loans')
      .then(r => setLoans(r.data))
      .catch(e => setError(e.message ?? 'Could not load your loans'))
  }, [])
  useEffect(() => { load() }, [load])

  const list     = loans ?? []
  const active   = list.filter(l => l.status === 'Active')
  const pending  = list.filter(l => l.status === 'Pending')
  const borrowed = list.filter(l => l.status === 'Active' || l.status === 'Repaid').reduce((s, l) => s + l.amount, 0)
  const repaid   = list.reduce((s, l) => s + l.repaid, 0)

  const stats = [
    { label: 'Active Loans',   value: String(active.length),  icon: Landmark },
    { label: 'Total Borrowed', value: fmt(borrowed),          icon: Wallet },
    { label: 'Total Repaid',   value: fmt(repaid),            icon: CheckCircle2 },
    { label: 'Pending',        value: String(pending.length), icon: Clock },
  ]

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'hsl(40 6% 95%)', marginBottom: 3 }}>My Loans</h1>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 55%)' }}>Track your loans and repayments</p>
        </div>
        <button onClick={() => navigate('/dashboard/loans/apply')} style={PRIMARY_BTN}>
          <Plus size={14} /> Apply for Loan
        </button>
      </div>

      {(justApplied || flash) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: 'hsl(40 6% 88%)' }}>{flash || 'Your loan application was submitted and is pending review.'}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {stats.map(s => (
          <div key={s.label} style={{ ...CARD, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={16} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(40 6% 92%)' }}>{loans ? s.value : '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loans table */}
      <div style={{ ...CARD, overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr>
                <th style={TH}>Plan</th>
                <th style={TH}>Amount</th>
                <th style={TH}>Duration</th>
                <th style={TH}>Repayment</th>
                <th style={TH}>Status</th>
                <th style={{ ...TH, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: '#f87171', padding: '2.5rem 1.25rem' }}>{error}</td></tr>
              ) : !loans ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', padding: '3rem 1.25rem' }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: 'hsl(240 5% 40%)', margin: '0 auto' }} />
                </td></tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...TD, textAlign: 'center', padding: '3rem 1.25rem' }}>
                    <HandCoins size={28} style={{ color: 'hsl(240 5% 45%)', margin: '0 auto 0.75rem' }} />
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'hsl(40 6% 75%)', marginBottom: 4 }}>No loans yet</p>
                    <p style={{ fontSize: 12, color: 'hsl(240 5% 50%)' }}>Apply for a loan to see it here.</p>
                  </td>
                </tr>
              ) : loans.map(l => {
                const st  = STATUS_STYLE[l.status] ?? STATUS_STYLE.Pending
                const pct = l.repayment > 0 ? Math.min(100, (l.repaid / l.repayment) * 100) : 0
                return (
                  <tr key={l.id}>
                    <td style={TD}>
                      <p style={{ fontWeight: 600 }}>{l.planName}</p>
                      <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginTop: 2 }}>{l.rate}% {l.interest.toLowerCase()} · {fmtDate(l.createdAt)}</p>
                    </td>
                    <td style={TD}>{fmt(l.amount)}</td>
                    <td style={TD}>{l.months} {l.months === 1 ? 'month' : 'months'}</td>
                    <td style={TD}>
                      <p>{fmt(l.repayment)}</p>
                      {(l.status === 'Active' || l.status === 'Repaid') && (
                        <>
                          <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', margin: '6px 0 3px', maxWidth: 140 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: '#60a5fa', borderRadius: 999 }} />
                          </div>
                          <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>{fmt(l.repaid)} paid</p>
                        </>
                      )}
                    </td>
                    <td style={TD}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: st.bg, color: st.color }}>{st.label}</span>
                      {l.status === 'Rejected' && l.adminNote && (
                        <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginTop: 4, maxWidth: 180 }}>{l.adminNote}</p>
                      )}
                      {l.status === 'Active' && l.dueAt && (
                        <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginTop: 4 }}>Due {fmtDate(l.dueAt)}</p>
                      )}
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      {l.status === 'Active' && (
                        <button style={{ ...GHOST_BTN, marginLeft: 'auto' }} onClick={() => { setFlash(''); setRepayLoan(l) }}>Repay</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {repayLoan && (
        <RepayModal
          loan={repayLoan}
          balance={user?.balance ?? 0}
          onClose={() => setRepayLoan(null)}
          onDone={msg => { setRepayLoan(null); setFlash(msg); load(); refreshUser().catch(() => {}) }}
          onDeposit={() => navigate('/dashboard/deposit')}
        />
      )}
    </div>
  )
}

function RepayModal({ loan, balance, onClose, onDone, onDeposit }: {
  loan: Loan; balance: number; onClose: () => void; onDone: (msg: string) => void; onDeposit: () => void
}) {
  const remaining = Math.round((loan.repayment - loan.repaid) * 100) / 100
  const [amount, setAmount] = useState(String(Math.min(loan.monthly, remaining).toFixed(2)))
  const [error, setError]   = useState('')
  const [busy, setBusy]     = useState(false)
  const amt = parseFloat(amount) || 0

  const submit = async () => {
    if (amt <= 0) return setError('Enter a valid amount.')
    if (amt > balance) return setError('That is more than your balance.')
    setBusy(true); setError('')
    try {
      const r = await api.post<{ success: boolean; message: string }>(`/user/loans/${loan.id}/repay`, { amount: Math.min(amt, remaining) })
      onDone(r.message ?? 'Repayment received')
    } catch (e: any) {
      setError(e.message ?? 'Could not process the repayment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ ...CARD, background: 'hsl(222 60% 6%)', width: '100%', maxWidth: 420, padding: '1.25rem' }}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(40 6% 94%)' }}>Repay {loan.planName}</p>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: 'hsl(240 5% 60%)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {[
          ['Remaining',       fmt(remaining)],
          ['Monthly payment', fmt(loan.monthly)],
          ['Your balance',    fmt(balance)],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between" style={{ fontSize: 13, padding: '0.45rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'hsl(240 5% 58%)' }}>{k}</span>
            <span style={{ color: 'hsl(40 6% 88%)', fontWeight: 500 }}>{v}</span>
          </div>
        ))}

        <label style={{ fontSize: 12, color: 'hsl(240 5% 60%)', display: 'block', margin: '1rem 0 6px' }}>Amount (USD)</label>
        <div className="flex gap-2 mb-2">
          <input
            type="number" inputMode="decimal" min={0} max={remaining} step="any"
            value={amount} onChange={e => { setAmount(e.target.value); setError('') }}
            style={{ flex: 1, minWidth: 0, padding: '0.65rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 92%)', fontSize: 14, outline: 'none' }}
          />
          <button style={GHOST_BTN} onClick={() => setAmount(remaining.toFixed(2))}>Pay all</button>
        </div>
        <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginBottom: 12 }}>
          Paid from your balance.{loan.collateral > 0 ? ` Your ${fmt(loan.collateral)} collateral is returned when the loan is fully repaid.` : ''}
        </p>

        {error && (
          <p style={{ fontSize: 12, color: '#f87171', marginBottom: 10 }}>
            {error}{amt > balance && <> <button onClick={onDeposit} style={{ color: '#60a5fa', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}>Deposit funds</button></>}
          </p>
        )}

        <button style={{ ...PRIMARY_BTN, width: '100%', opacity: busy ? 0.7 : 1 }} onClick={submit} disabled={busy}>
          {busy ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : `Pay ${fmt(Math.min(amt, remaining))}`}
        </button>
      </div>
    </div>
  )
}
