import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

// ─── Plans (managed by the admin, loaded from the API) ────────────────────────

export interface LoanPlan {
  id: string
  name: string
  description: string
  rate: number            // % per year
  interest: 'Simple' | 'Compound'
  minAmount: number
  maxAmount: number
  minMonths: number
  maxMonths: number
  fee: number             // % of amount, taken at payout
  minBalance: number
  collateral: number      // % of amount held until repaid (0 = none)
}

// Mirrors calcLoan in the backend's loan.controller.ts
export function calcRepayment(plan: LoanPlan, amount: number, months: number) {
  const years      = months / 12
  const r          = plan.rate / 100
  const interest   = plan.interest === 'Compound' ? amount * (Math.pow(1 + r, years) - 1) : amount * r * years
  const fee        = amount * plan.fee / 100
  const collateral = amount * plan.collateral / 100
  const total      = amount + interest
  return {
    interest, fee, total, collateral,
    monthly:  months > 0 ? total / months : 0,
    received: amount - fee - collateral,
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmt0 = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
const CARD: React.CSSProperties = { background: 'hsl(222 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem' }
const LABEL: React.CSSProperties = { fontSize: 12, color: 'hsl(240 5% 60%)', display: 'block', marginBottom: 6 }
const INPUT: React.CSSProperties = {
  width: '100%', padding: '0.65rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 92%)', fontSize: 14, outline: 'none',
}
const PRIMARY_BTN: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.7rem 1.25rem', width: '100%',
  borderRadius: '0.625rem', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
  background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', color: '#050505',
}
const PURPOSES = ['Trading capital', 'Personal expenses', 'Business expansion', 'Property investment', 'Debt consolidation', 'Other']

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ApplyLoan() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const balance = user?.balance ?? 0

  const [planId, setPlanId]   = useState('')
  const [amount, setAmount]   = useState('')
  const [months, setMonths]   = useState('')
  const [purpose, setPurpose] = useState('')
  const [agree, setAgree]     = useState(false)
  const [error, setError]     = useState('')
  const [plans, setPlans]     = useState<LoanPlan[] | null>(null)
  const [loadErr, setLoadErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get<{ success: boolean; data: LoanPlan[] }>('/user/loans/plans')
      .then(r => setPlans(r.data))
      .catch(e => setLoadErr(e.message ?? 'Could not load loan plans'))
  }, [])

  const plan = plans?.find(p => p.id === planId)
  const amt  = parseFloat(amount) || 0
  const mo   = parseInt(months) || 0
  const calc = useMemo(() => plan ? calcRepayment(plan, amt, mo) : null, [plan, amt, mo])
  const lowBalance = plan ? balance < plan.minBalance : false

  const selectPlan = (p: LoanPlan) => {
    setPlanId(p.id)
    setMonths(String(p.minMonths))
    setError('')
  }

  const submit = async () => {
    if (!plan)                                        return setError('Select a loan plan.')
    if (lowBalance)                                    return setError(`This plan needs a balance of at least ${fmt(plan.minBalance)}.`)
    if (amt < plan.minAmount || amt > plan.maxAmount) return setError(`Enter an amount between ${fmt0(plan.minAmount)} and ${fmt0(plan.maxAmount)}.`)
    if (mo < plan.minMonths || mo > plan.maxMonths)   return setError(`Choose a duration between ${plan.minMonths} and ${plan.maxMonths} months.`)
    if (!purpose)                                     return setError('Select the purpose of the loan.')
    if (!agree)                                       return setError('Please accept the loan terms.')
    setError('')
    setSubmitting(true)
    try {
      await api.post('/user/loans', { planId: plan.id, amount: amt, months: mo, purpose })
      navigate('/dashboard/loans', { state: { justApplied: true } })
    } catch (e: any) {
      setError(e.message ?? 'Could not submit your application.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard/loans')}
          aria-label="Back to My Loans"
          style={{ width: 38, height: 38, flexShrink: 0, borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 88%)', cursor: 'pointer' }}
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'hsl(40 6% 95%)', marginBottom: 3 }}>Apply for a Loan</h1>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 55%)' }}>Choose a plan, enter your details, and preview your repayment</p>
        </div>
      </div>

      {/* Plans */}
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'hsl(240 5% 50%)', marginBottom: 10 }}>AVAILABLE PLANS</p>
      {loadErr && <div style={{ ...CARD, padding: '2rem', textAlign: 'center', color: '#f87171', fontSize: 13, marginBottom: 24 }}>{loadErr}</div>}
      {!loadErr && !plans && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <Loader2 size={26} className="animate-spin" style={{ color: 'hsl(240 5% 40%)' }} />
        </div>
      )}
      {plans && plans.length === 0 && (
        <div style={{ ...CARD, padding: '2rem', textAlign: 'center', color: 'hsl(240 5% 60%)', fontSize: 13, marginBottom: 24 }}>No loan plans are available right now.</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {(plans ?? []).map(p => {
          const active = p.id === planId
          return (
            <button
              key={p.id}
              onClick={() => selectPlan(p)}
              style={{
                ...CARD, padding: '1.25rem', textAlign: 'left', cursor: 'pointer', position: 'relative',
                border: active ? '1px solid rgba(96,165,250,0.6)' : CARD.border,
                boxShadow: active ? '0 0 0 3px rgba(96,165,250,0.12)' : 'none',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(40 6% 94%)' }}>{p.name}</p>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: 'rgba(96,165,250,0.12)', color: '#60a5fa', whiteSpace: 'nowrap' }}>
                  {p.rate.toFixed(2)}% {p.interest}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: 'hsl(240 5% 58%)', lineHeight: 1.5, marginBottom: 12 }}>{p.description}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5" style={{ fontSize: 12, color: 'hsl(240 5% 62%)' }}>
                <span>Amount: <b style={{ color: 'hsl(40 6% 86%)', fontWeight: 600 }}>{fmt0(p.minAmount)} – {fmt0(p.maxAmount)}</b></span>
                <span>Duration: <b style={{ color: 'hsl(40 6% 86%)', fontWeight: 600 }}>{p.minMonths} – {p.maxMonths} mo</b></span>
                <span>Fee: <b style={{ color: 'hsl(40 6% 86%)', fontWeight: 600 }}>{p.fee.toFixed(2)}%</b></span>
                <span>Min Balance: <b style={{ color: 'hsl(40 6% 86%)', fontWeight: 600 }}>{fmt0(p.minBalance)}</b></span>
              </div>
              {p.collateral > 0 && (
                <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 10 }}>Requires {p.collateral.toFixed(2)}% collateral</p>
              )}
              {active && (
                <span style={{ position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderRadius: 999, background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} style={{ color: '#050505' }} strokeWidth={3} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {!plan || !calc ? (
        <>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'hsl(240 5% 50%)', marginBottom: 10 }}>REPAYMENT PREVIEW</p>
          <div style={{ ...CARD, padding: '2.5rem 1.25rem', textAlign: 'center', fontSize: 13, color: 'hsl(240 5% 62%)' }}>
            Select a loan plan to see the preview.
          </div>
        </>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Details form */}
        <div className="lg:col-span-3" style={{ ...CARD, padding: '1.25rem' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(40 6% 94%)', marginBottom: 2 }}>Loan Details</p>
          <p style={{ fontSize: 12, color: 'hsl(240 5% 52%)', marginBottom: 16 }}>{plan.name}</p>

          {lowBalance && (
            <div style={{ display: 'flex', gap: 10, padding: '0.75rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', marginBottom: 16 }}>
              <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: 'hsl(40 6% 80%)' }}>
                This plan needs a balance of at least {fmt(plan.minBalance)}. Your balance is {fmt(balance)}.{' '}
                <button onClick={() => navigate('/dashboard/deposit')} style={{ color: '#60a5fa', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}>Deposit funds</button>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label style={LABEL}>Amount (USD)</label>
              <input
                type="number" inputMode="decimal" min={plan.minAmount} max={plan.maxAmount} step="any"
                value={amount} onChange={e => { setAmount(e.target.value); setError('') }}
                placeholder={`${fmt0(plan.minAmount)} – ${fmt0(plan.maxAmount)}`}
                style={INPUT}
              />
            </div>
            <div>
              <label style={LABEL}>Duration (months)</label>
              <select value={months} onChange={e => { setMonths(e.target.value); setError('') }} style={{ ...INPUT, appearance: 'auto' }}>
                {Array.from({ length: plan.maxMonths - plan.minMonths + 1 }, (_, i) => plan.minMonths + i).map(m => (
                  <option key={m} value={m} style={{ background: '#111' }}>{m} {m === 1 ? 'month' : 'months'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label style={LABEL}>Purpose</label>
            <select value={purpose} onChange={e => { setPurpose(e.target.value); setError('') }} style={{ ...INPUT, appearance: 'auto', color: purpose ? INPUT.color : 'hsl(240 5% 50%)' }}>
              <option value="" style={{ background: '#111' }}>Select a purpose</option>
              {PURPOSES.map(p => <option key={p} value={p} style={{ background: '#111', color: 'hsl(40 6% 92%)' }}>{p}</option>)}
            </select>
          </div>

          {plan.collateral > 0 && (
            <div style={{ display: 'flex', gap: 10, padding: '0.75rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', marginBottom: 16 }}>
              <ShieldCheck size={16} style={{ color: '#60a5fa', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: 'hsl(40 6% 80%)' }}>
                This plan requires {plan.collateral}% collateral{amt > 0 ? <> ({fmt(calc.collateral)})</> : null}, held back from the payout and returned to your balance once the loan is fully repaid.
              </p>
            </div>
          )}

          <label className="flex items-start gap-2.5" style={{ cursor: 'pointer', marginBottom: 16 }}>
            <input type="checkbox" checked={agree} onChange={e => { setAgree(e.target.checked); setError('') }} style={{ marginTop: 2, accentColor: '#60a5fa' }} />
            <span style={{ fontSize: 12, color: 'hsl(240 5% 62%)' }}>
              I agree to the loan terms and understand that late repayments may incur additional charges.
            </span>
          </label>

          {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 10 }}>{error}</p>}
          <button style={{ ...PRIMARY_BTN, opacity: submitting ? 0.7 : 1 }} onClick={submit} disabled={submitting}>
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit Application'}
          </button>
        </div>

        {/* Repayment preview */}
        <div className="lg:col-span-2" style={{ ...CARD, padding: '1.25rem', alignSelf: 'start' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(40 6% 94%)', marginBottom: 14 }}>Repayment Preview</p>

          <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: 'hsl(240 5% 58%)', marginBottom: 4 }}>Monthly Payment</p>
            <p className="" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#60a5fa' }}>{fmt(calc.monthly)}</p>
            <p style={{ fontSize: 11, color: 'hsl(240 5% 55%)', marginTop: 2 }}>for {mo} {mo === 1 ? 'month' : 'months'}</p>
          </div>

          {[
            ['Loan Amount',                   fmt(amt)],
            [`Interest (${plan.rate}% ${plan.interest.toLowerCase()})`, fmt(calc.interest)],
            [`Processing Fee (${plan.fee}%)`, fmt(calc.fee)],
            ...(plan.collateral > 0 ? [[`Collateral (${plan.collateral}%)`, fmt(calc.collateral)]] : []),
            ['You Receive',                   fmt(Math.max(0, calc.received))],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between" style={{ fontSize: 13, padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'hsl(240 5% 58%)' }}>{k}</span>
              <span style={{ color: 'hsl(40 6% 88%)', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div className="flex justify-between" style={{ fontSize: 14, padding: '0.75rem 0 0' }}>
            <span style={{ color: 'hsl(40 6% 90%)', fontWeight: 600 }}>Total Repayment</span>
            <span style={{ color: 'hsl(40 6% 96%)', fontWeight: 700 }}>{fmt(calc.total)}</span>
          </div>
          <p style={{ fontSize: 11, color: 'hsl(240 5% 48%)', marginTop: 12 }}>
            Estimate only. The processing fee and any collateral are taken from the loan amount when it is paid out. Repayments are made from your balance.
          </p>
        </div>
      </div>
      )}
    </div>
  )
}
