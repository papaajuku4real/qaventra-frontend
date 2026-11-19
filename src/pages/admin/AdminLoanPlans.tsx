import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Landmark, Plus, Pencil, Trash2, X, Check, Loader2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { adminApi } from '@/lib/api'

interface LoanPlan {
  id: string
  name: string
  description: string
  rate: number
  interest: 'Simple' | 'Compound'
  minAmount: number
  maxAmount: number
  minMonths: number
  maxMonths: number
  fee: number
  minBalance: number
  collateral: number
  isActive: boolean
  sortOrder: number
}

const EMPTY = {
  name: '', description: '', rate: '', interest: 'Simple', minAmount: '', maxAmount: '',
  minMonths: '1', maxMonths: '12', fee: '0', minBalance: '0', collateral: '0', isActive: true, sortOrder: '0',
}
type Form = typeof EMPTY

const fmt0 = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
const INPUT = 'w-full rounded-xl px-3 py-2 text-sm outline-none'
const INPUT_STYLE: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 92%)' }

export function AdminLoanPlans() {
  const [plans, setPlans]   = useState<LoanPlan[] | null>(null)
  const [error, setError]   = useState('')
  const [flash, setFlash]   = useState('')
  const [editing, setEditing] = useState<LoanPlan | 'new' | null>(null)
  const [deleting, setDeleting] = useState<LoanPlan | null>(null)
  const [form, setForm]     = useState<Form>(EMPTY)
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    adminApi.get<{ success: boolean; data: LoanPlan[] }>('/admin/loan-plans')
      .then(r => setPlans(r.data))
      .catch(e => setError(e.message ?? 'Could not load loan plans'))
  }, [])
  useEffect(() => { load() }, [load])

  const showFlash = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 3000) }

  function openAdd() {
    setForm({ ...EMPTY, sortOrder: String((plans?.length ?? 0) + 1) }); setFormErr(''); setEditing('new')
  }
  function openEdit(p: LoanPlan) {
    setForm({
      name: p.name, description: p.description, rate: String(p.rate), interest: p.interest,
      minAmount: String(p.minAmount), maxAmount: String(p.maxAmount), minMonths: String(p.minMonths), maxMonths: String(p.maxMonths),
      fee: String(p.fee), minBalance: String(p.minBalance), collateral: String(p.collateral), isActive: p.isActive, sortOrder: String(p.sortOrder),
    })
    setFormErr(''); setEditing(p)
  }

  async function save() {
    if (!form.name.trim()) return setFormErr('Plan name is required.')
    const body = {
      ...form,
      rate: Number(form.rate), minAmount: Number(form.minAmount), maxAmount: Number(form.maxAmount),
      minMonths: Number(form.minMonths), maxMonths: Number(form.maxMonths), fee: Number(form.fee),
      minBalance: Number(form.minBalance), collateral: Number(form.collateral), sortOrder: Number(form.sortOrder),
    }
    setSaving(true); setFormErr('')
    try {
      if (editing === 'new') await adminApi.post('/admin/loan-plans', body)
      else if (editing)      await adminApi.put(`/admin/loan-plans/${editing.id}`, body)
      setEditing(null); showFlash('Plan saved'); load()
    } catch (e: any) { setFormErr(e.message ?? 'Could not save the plan') }
    finally { setSaving(false) }
  }

  async function remove() {
    if (!deleting) return
    setSaving(true)
    try {
      await adminApi.delete(`/admin/loan-plans/${deleting.id}`)
      setDeleting(null); showFlash('Plan deleted'); load()
    } catch (e: any) { setError(e.message ?? 'Could not delete the plan'); setDeleting(null) }
    finally { setSaving(false) }
  }

  async function toggle(p: LoanPlan) {
    setPlans(prev => prev?.map(x => x.id === p.id ? { ...x, isActive: !x.isActive } : x) ?? null)
    try { await adminApi.put(`/admin/loan-plans/${p.id}`, { isActive: !p.isActive }) }
    catch (e: any) { setError(e.message ?? 'Could not update the plan'); load() }
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ color: 'hsl(40 6% 95%)' }}>
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <Landmark size={18} style={{ color: '#60a5fa' }} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Loan Plans</h1>
          </div>
          <p className="text-sm" style={{ color: 'hsl(240 5% 65%)' }}>
            Plans shown on the user's Apply for a Loan page. Changes don't affect loans already applied for. <Link to="/admin/loans" style={{ color: '#60a5fa' }}>Review applications</Link>
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', boxShadow: '0 4px 20px rgba(59,130,246,0.35)' }}>
          <Plus size={15} /> Add Plan
        </button>
      </div>

      {flash && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
          <Check size={14} /> {flash}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      {!plans && !error && (
        <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin" style={{ color: 'hsl(240 5% 40%)' }} /></div>
      )}
      {plans && plans.length === 0 && (
        <div className="text-center py-24 liquid-glass rounded-3xl">
          <Landmark size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm" style={{ color: 'hsl(240 5% 65%)' }}>No loan plans yet. Add one above.</p>
        </div>
      )}

      {plans && plans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map(p => (
            <div key={p.id} className="liquid-glass rounded-3xl p-6 flex flex-col gap-3" style={{ opacity: p.isActive ? 1 : 0.6 }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-base" style={{ color: 'hsl(40 6% 95%)' }}>{p.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(240 5% 55%)' }}>order #{p.sortOrder} · {p.isActive ? 'Active' : 'Hidden from users'}</p>
                </div>
                <button onClick={() => toggle(p)} title={p.isActive ? 'Hide from users' : 'Show to users'}>
                  {p.isActive ? <ToggleRight size={24} style={{ color: '#60a5fa' }} /> : <ToggleLeft size={24} style={{ color: 'hsl(240 5% 40%)' }} />}
                </button>
              </div>
              <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
                {p.rate.toFixed(2)}% {p.interest}
              </span>
              <p className="text-xs leading-relaxed" style={{ color: 'hsl(240 5% 60%)' }}>{p.description || '—'}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs" style={{ color: 'hsl(240 5% 62%)' }}>
                <span>Amount: <b style={{ color: 'hsl(40 6% 86%)' }}>{fmt0(p.minAmount)} – {fmt0(p.maxAmount)}</b></span>
                <span>Duration: <b style={{ color: 'hsl(40 6% 86%)' }}>{p.minMonths} – {p.maxMonths} mo</b></span>
                <span>Fee: <b style={{ color: 'hsl(40 6% 86%)' }}>{p.fee}%</b></span>
                <span>Min balance: <b style={{ color: 'hsl(40 6% 86%)' }}>{fmt0(p.minBalance)}</b></span>
                <span>Collateral: <b style={{ color: p.collateral > 0 ? '#f59e0b' : 'hsl(40 6% 86%)' }}>{p.collateral > 0 ? `${p.collateral}%` : 'None'}</b></span>
              </div>
              <div className="flex gap-2 mt-auto pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(40 6% 88%)' }}>
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => setDeleting(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit modal */}
      {editing && (
        <div onClick={() => setEditing(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'hsl(222 60% 6%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editing === 'new' ? 'Add loan plan' : 'Edit loan plan'}</h3>
              <button onClick={() => setEditing(null)}><X size={18} style={{ color: 'hsl(240 5% 60%)' }} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Plan name" full><input className={INPUT} style={INPUT_STYLE} value={form.name} onChange={set('name')} /></Field>
              <Field label="Description" full><textarea className={INPUT} style={INPUT_STYLE} rows={2} value={form.description} onChange={set('description')} /></Field>
              <Field label="Interest rate (% per year)"><input type="number" step="any" className={INPUT} style={INPUT_STYLE} value={form.rate} onChange={set('rate')} /></Field>
              <Field label="Interest type">
                <select className={INPUT} style={INPUT_STYLE} value={form.interest} onChange={set('interest')}>
                  <option value="Simple" style={{ background: '#111' }}>Simple</option>
                  <option value="Compound" style={{ background: '#111' }}>Compound</option>
                </select>
              </Field>
              <Field label="Min amount ($)"><input type="number" step="any" className={INPUT} style={INPUT_STYLE} value={form.minAmount} onChange={set('minAmount')} /></Field>
              <Field label="Max amount ($)"><input type="number" step="any" className={INPUT} style={INPUT_STYLE} value={form.maxAmount} onChange={set('maxAmount')} /></Field>
              <Field label="Min duration (months)"><input type="number" className={INPUT} style={INPUT_STYLE} value={form.minMonths} onChange={set('minMonths')} /></Field>
              <Field label="Max duration (months)"><input type="number" className={INPUT} style={INPUT_STYLE} value={form.maxMonths} onChange={set('maxMonths')} /></Field>
              <Field label="Processing fee (%)"><input type="number" step="any" className={INPUT} style={INPUT_STYLE} value={form.fee} onChange={set('fee')} /></Field>
              <Field label="Min balance to apply ($)"><input type="number" step="any" className={INPUT} style={INPUT_STYLE} value={form.minBalance} onChange={set('minBalance')} /></Field>
              <Field label="Collateral (%, 0 = none)"><input type="number" step="any" className={INPUT} style={INPUT_STYLE} value={form.collateral} onChange={set('collateral')} /></Field>
              <Field label="Display order"><input type="number" className={INPUT} style={INPUT_STYLE} value={form.sortOrder} onChange={set('sortOrder')} /></Field>
              <label className="col-span-2 flex items-center gap-2 text-sm mt-1" style={{ color: 'hsl(240 5% 70%)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ accentColor: '#3b82f6' }} />
                Show this plan to users
              </label>
            </div>

            {formErr && <p className="text-sm mt-4" style={{ color: '#f87171' }}>{formErr}</p>}

            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(40 6% 88%)' }}>Cancel</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff' }}>
                {saving && <Loader2 size={13} className="animate-spin" />} Save plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleting && (
        <div onClick={() => setDeleting(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6" style={{ background: 'hsl(222 60% 6%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-lg font-semibold mb-2">Delete "{deleting.name}"?</h3>
            <p className="text-sm mb-5" style={{ color: 'hsl(240 5% 65%)' }}>
              Users will no longer see this plan. Loans already taken on it keep their terms. This can't be undone. To hide it temporarily, use the toggle instead.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(40 6% 88%)' }}>Cancel</button>
              <button onClick={remove} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#ef4444', color: '#fff' }}>
                {saving && <Loader2 size={13} className="animate-spin" />} Delete plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="text-xs block mb-1.5" style={{ color: 'hsl(240 5% 60%)' }}>{label}</label>
      {children}
    </div>
  )
}
