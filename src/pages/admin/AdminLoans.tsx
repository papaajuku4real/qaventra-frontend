import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Landmark, Check, X, Loader2, AlertCircle } from 'lucide-react'
import { adminApi } from '@/lib/api'

interface AdminLoan {
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
  status: 'Pending' | 'Active' | 'Repaid' | 'Rejected'
  adminNote: string | null
  createdAt: string
  user: { id: string; firstName: string; lastName: string; email: string; balance: number } | null
}

const FILTERS = ['Pending', 'Active', 'Repaid', 'Rejected', 'All'] as const
const STATUS_STYLE: Record<AdminLoan['status'], { color: string; bg: string; label: string }> = {
  Pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Pending' },
  Active:   { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  label: 'Active' },
  Repaid:   { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  label: 'Repaid' },
  Rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Declined' },
}
const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const TH: React.CSSProperties = { textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'hsl(240 5% 50%)', padding: '0.75rem 1rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { fontSize: 13, color: 'hsl(40 6% 88%)', padding: '0.875rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }

export function AdminLoans() {
  const [filter, setFilter] = useState<typeof FILTERS[number]>('Pending')
  const [loans, setLoans]   = useState<AdminLoan[] | null>(null)
  const [error, setError]   = useState('')
  const [flash, setFlash]   = useState('')
  const [busyId, setBusyId] = useState('')
  const [declining, setDeclining] = useState<AdminLoan | null>(null)
  const [note, setNote]     = useState('')

  const load = useCallback(() => {
    setLoans(null); setError('')
    adminApi.get<{ success: boolean; data: AdminLoan[] }>(`/admin/loans?status=${filter}`)
      .then(r => setLoans(r.data))
      .catch(e => setError(e.message ?? 'Could not load loans'))
  }, [filter])
  useEffect(() => { load() }, [load])

  const showFlash = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 3500) }

  async function approve(l: AdminLoan) {
    const payout = l.amount - l.feeAmount - l.collateral
    if (!window.confirm(`Approve ${l.planName} for ${fmt(l.amount)}?\n\n${fmt(payout)} will be added to the user's balance.`)) return
    setBusyId(l.id)
    try {
      const r = await adminApi.post<{ success: boolean; message: string }>(`/admin/loans/${l.id}/approve`, {})
      showFlash(r.message ?? 'Loan approved'); load()
    } catch (e: any) { setError(e.message ?? 'Could not approve the loan') }
    finally { setBusyId('') }
  }

  async function decline() {
    if (!declining) return
    setBusyId(declining.id)
    try {
      await adminApi.post(`/admin/loans/${declining.id}/decline`, { note: note.trim() || undefined })
      showFlash('Loan declined'); setDeclining(null); setNote(''); load()
    } catch (e: any) { setError(e.message ?? 'Could not decline the loan') }
    finally { setBusyId('') }
  }

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ color: 'hsl(40 6% 95%)' }}>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.18)', border: '1px solid rgba(249,115,22,0.3)' }}>
              <Landmark size={18} style={{ color: '#fb923c' }} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Loans</h1>
          </div>
          <p className="text-sm" style={{ color: 'hsl(240 5% 65%)' }}>
            Review loan applications. Approving pays the loan (minus fee and collateral) into the user's balance.
          </p>
        </div>
        <Link to="/admin/loan-plans" className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 88%)' }}>
          Manage loan plans
        </Link>
      </div>

      {flash && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#fb923c' }}>
          <Check size={14} /> {flash}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3.5 py-1.5 rounded-lg text-xs font-medium"
            style={filter === f
              ? { background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.35)' }
              : { background: 'rgba(255,255,255,0.04)', color: 'hsl(240 5% 65%)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {f === 'Rejected' ? 'Declined' : f}
          </button>
        ))}
      </div>

      <div className="liquid-glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
            <thead>
              <tr>
                <th style={TH}>User</th>
                <th style={TH}>Plan</th>
                <th style={TH}>Amount</th>
                <th style={TH}>Duration</th>
                <th style={TH}>Repayment</th>
                <th style={TH}>Purpose</th>
                <th style={TH}>Status</th>
                <th style={{ ...TH, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loans && !error && (
                <tr><td colSpan={8} style={{ ...TD, textAlign: 'center', padding: '3rem' }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: 'hsl(240 5% 40%)', margin: '0 auto' }} />
                </td></tr>
              )}
              {loans && loans.length === 0 && (
                <tr><td colSpan={8} style={{ ...TD, textAlign: 'center', padding: '3rem', color: 'hsl(240 5% 60%)' }}>
                  No {filter === 'All' ? '' : (filter === 'Rejected' ? 'declined' : filter.toLowerCase())} loans.
                </td></tr>
              )}
              {loans?.map(l => {
                const st = STATUS_STYLE[l.status] ?? STATUS_STYLE.Pending
                return (
                  <tr key={l.id}>
                    <td style={TD}>
                      {l.user ? (
                        <Link to={`/admin/users/${l.user.id}`} style={{ color: 'hsl(40 6% 92%)', fontWeight: 600 }}>{l.user.firstName} {l.user.lastName}</Link>
                      ) : <span style={{ color: 'hsl(240 5% 50%)' }}>Deleted user</span>}
                      {l.user && <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginTop: 2 }}>{l.user.email} · bal {fmt(l.user.balance)}</p>}
                    </td>
                    <td style={TD}>
                      <p style={{ fontWeight: 600 }}>{l.planName}</p>
                      <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginTop: 2 }}>{l.rate}% {l.interest.toLowerCase()} · {fmtDate(l.createdAt)}</p>
                    </td>
                    <td style={TD}>
                      <p>{fmt(l.amount)}</p>
                      <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginTop: 2 }}>
                        fee {fmt(l.feeAmount)}{l.collateral > 0 ? ` · collat. ${fmt(l.collateral)}` : ''}
                      </p>
                    </td>
                    <td style={TD}>{l.months} mo</td>
                    <td style={TD}>
                      <p>{fmt(l.repayment)}</p>
                      <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginTop: 2 }}>
                        {l.status === 'Pending' || l.status === 'Rejected' ? `${fmt(l.monthly)}/mo` : `${fmt(l.repaid)} repaid`}
                      </p>
                    </td>
                    <td style={{ ...TD, maxWidth: 160, color: 'hsl(240 5% 70%)' }}>{l.purpose}</td>
                    <td style={TD}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: st.bg, color: st.color }}>{st.label}</span>
                      {l.adminNote && <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginTop: 4, maxWidth: 160 }}>{l.adminNote}</p>}
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      {l.status === 'Pending' ? (
                        <div className="flex gap-2 justify-end">
                          <button disabled={busyId === l.id} onClick={() => approve(l)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                            {busyId === l.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approve
                          </button>
                          <button disabled={busyId === l.id} onClick={() => { setNote(''); setDeclining(l) }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                            <X size={12} /> Decline
                          </button>
                        </div>
                      ) : <span style={{ fontSize: 12, color: 'hsl(240 5% 45%)' }}>—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {declining && (
        <div onClick={() => setDeclining(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6" style={{ background: 'hsl(20 12% 6%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-lg font-semibold mb-1">Decline loan</h3>
            <p className="text-sm mb-4" style={{ color: 'hsl(240 5% 65%)' }}>
              {declining.user ? `${declining.user.firstName} ${declining.user.lastName}` : 'User'} · {declining.planName} · {fmt(declining.amount)}
            </p>
            <label className="text-xs block mb-1.5" style={{ color: 'hsl(240 5% 60%)' }}>Reason (optional, shown to the user)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} maxLength={300}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 92%)' }} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeclining(null)} className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(40 6% 88%)' }}>Cancel</button>
              <button onClick={decline} disabled={busyId === declining.id} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#ef4444', color: '#fff' }}>
                {busyId === declining.id && <Loader2 size={13} className="animate-spin" />} Decline loan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
