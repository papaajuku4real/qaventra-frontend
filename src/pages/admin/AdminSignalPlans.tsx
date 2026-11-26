import { useCallback, useEffect, useState } from 'react'
import { Radio, Plus, Pencil, Trash2, X, Check, Loader2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { adminApi } from '@/lib/api'

interface SignalPlan {
  id: string
  name: string
  price: number
  percentage: number
  description: string
  features: string[]
  isActive: boolean
  sortOrder: number
}

const EMPTY = { name: '', price: '', percentage: '', description: '', features: [''] as string[], isActive: true, sortOrder: '0' }
type Form = typeof EMPTY

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const INPUT = 'w-full rounded-xl px-3 py-2 text-sm outline-none'
const INPUT_STYLE: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 92%)' }

export function AdminSignalPlans() {
  const [plans, setPlans]       = useState<SignalPlan[] | null>(null)
  const [error, setError]       = useState('')
  const [flash, setFlash]       = useState('')
  const [editing, setEditing]   = useState<SignalPlan | 'new' | null>(null)
  const [deleting, setDeleting] = useState<SignalPlan | null>(null)
  const [form, setForm]         = useState<Form>(EMPTY)
  const [formErr, setFormErr]   = useState('')
  const [saving, setSaving]     = useState(false)

  const load = useCallback(() => {
    adminApi.get<{ success: boolean; data: SignalPlan[] }>('/admin/signal-plans')
      .then(r => setPlans(r.data))
      .catch(e => setError(e.message ?? 'Could not load signal plans'))
  }, [])
  useEffect(() => { load() }, [load])

  const showFlash = (m: string) => { setFlash(m); setTimeout(() => setFlash(''), 3000) }

  function openAdd() {
    setForm({ ...EMPTY, sortOrder: String((plans?.length ?? 0) + 1) }); setFormErr(''); setEditing('new')
  }
  function openEdit(p: SignalPlan) {
    setForm({ name: p.name, price: String(p.price), percentage: String(p.percentage), description: p.description, features: p.features?.length ? [...p.features] : [''], isActive: p.isActive, sortOrder: String(p.sortOrder) })
    setFormErr(''); setEditing(p)
  }

  async function save() {
    if (!form.name.trim()) return setFormErr('Name is required.')
    if (form.price === '' || form.percentage === '') return setFormErr('Enter a price and a percentage.')
    const body = { ...form, features: form.features.map(f => f.trim()).filter(Boolean), price: Number(form.price), percentage: Number(form.percentage), sortOrder: Number(form.sortOrder) }
    setSaving(true); setFormErr('')
    try {
      if (editing === 'new') await adminApi.post('/admin/signal-plans', body)
      else if (editing)      await adminApi.put(`/admin/signal-plans/${editing.id}`, body)
      setEditing(null); showFlash('Plan saved'); load()
    } catch (e: any) { setFormErr(e.message ?? 'Could not save the plan') }
    finally { setSaving(false) }
  }

  async function remove() {
    if (!deleting) return
    setSaving(true)
    try {
      await adminApi.delete(`/admin/signal-plans/${deleting.id}`)
      setDeleting(null); showFlash('Plan deleted'); load()
    } catch (e: any) { setError(e.message ?? 'Could not delete the plan'); setDeleting(null) }
    finally { setSaving(false) }
  }

  async function toggle(p: SignalPlan) {
    setPlans(prev => prev?.map(x => x.id === p.id ? { ...x, isActive: !x.isActive } : x) ?? null)
    try { await adminApi.put(`/admin/signal-plans/${p.id}`, { isActive: !p.isActive }) }
    catch (e: any) { setError(e.message ?? 'Could not update the plan'); load() }
  }

  const set = (k: Exclude<keyof Form, 'features' | 'isActive'>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))
  const setFeature = (i: number, v: string) => setForm(f => ({ ...f, features: f.features.map((x, j) => j === i ? v : x) }))
  const addFeature = () => setForm(f => ({ ...f, features: [...f.features, ''] }))
  const removeFeature = (i: number) => setForm(f => ({ ...f, features: f.features.length > 1 ? f.features.filter((_, j) => j !== i) : [''] }))

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ color: 'hsl(40 6% 95%)' }}>
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.18)', border: '1px solid rgba(249,115,22,0.3)' }}>
              <Radio size={18} style={{ color: '#fb923c' }} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Signal Plans</h1>
          </div>
          <p className="text-sm" style={{ color: 'hsl(240 5% 65%)' }}>
            The cards in the Signal List on the user's Signal page. Changes show immediately.
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
          <Plus size={15} /> Add Plan
        </button>
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

      {!plans && !error && (
        <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin" style={{ color: 'hsl(240 5% 40%)' }} /></div>
      )}
      {plans && plans.length === 0 && (
        <div className="text-center py-24 liquid-glass rounded-3xl">
          <Radio size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm" style={{ color: 'hsl(240 5% 65%)' }}>No signal plans yet. Add one above.</p>
        </div>
      )}

      {plans && plans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map(p => (
            <div key={p.id} className="liquid-glass rounded-3xl p-6 flex flex-col gap-4" style={{ opacity: p.isActive ? 1 : 0.6 }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-lg" style={{ color: 'hsl(40 6% 95%)' }}>{p.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(240 5% 55%)' }}>order #{p.sortOrder} · {p.isActive ? 'Shown to users' : 'Hidden from users'}</p>
                </div>
                <button onClick={() => toggle(p)} title={p.isActive ? 'Hide from users' : 'Show to users'}>
                  {p.isActive ? <ToggleRight size={24} style={{ color: '#fb923c' }} /> : <ToggleLeft size={24} style={{ color: 'hsl(240 5% 40%)' }} />}
                </button>
              </div>
              {p.description && <p className="text-xs leading-relaxed" style={{ color: 'hsl(240 5% 60%)' }}>{p.description}</p>}
              {p.features?.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'hsl(40 6% 80%)' }}>
                      <Check size={13} style={{ color: '#fb923c', flexShrink: 0, marginTop: 1 }} /> {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between px-4 py-3 text-sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'hsl(240 5% 60%)' }}>Signal Price</span>
                  <span className="font-bold">{fmt(p.price)}</span>
                </div>
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span style={{ color: 'hsl(240 5% 60%)' }}>Percentage</span>
                  <span className="font-bold" style={{ color: '#fb923c' }}>{p.percentage}%</span>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
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

      {editing && (
        <div onClick={() => setEditing(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'hsl(20 12% 6%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editing === 'new' ? 'Add signal plan' : 'Edit signal plan'}</h3>
              <button onClick={() => setEditing(null)}><X size={18} style={{ color: 'hsl(240 5% 60%)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name (e.g. Silver)" full><input className={INPUT} style={INPUT_STYLE} value={form.name} onChange={set('name')} /></Field>
              <Field label="Signal price ($)"><input type="number" step="any" min="0" className={INPUT} style={INPUT_STYLE} value={form.price} onChange={set('price')} /></Field>
              <Field label="Percentage (%)"><input type="number" step="any" min="0" className={INPUT} style={INPUT_STYLE} value={form.percentage} onChange={set('percentage')} /></Field>
              <Field label="Short description (optional)" full><textarea className={INPUT} style={INPUT_STYLE} rows={2} value={form.description} onChange={set('description')} /></Field>
              <Field label="List of items on the card" full>
                <div className="flex flex-col gap-2">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={INPUT} style={INPUT_STYLE} value={f} maxLength={120}
                        placeholder={`Item ${i + 1}, e.g. Real-time signal alerts`} onChange={e => setFeature(i, e.target.value)} />
                      <button type="button" onClick={() => removeFeature(i)} title="Remove item"
                        className="px-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {form.features.length < 20 && (
                    <button type="button" onClick={addFeature} className="self-start flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c' }}>
                      <Plus size={12} /> Add item
                    </button>
                  )}
                </div>
              </Field>
              <Field label="Display order"><input type="number" className={INPUT} style={INPUT_STYLE} value={form.sortOrder} onChange={set('sortOrder')} /></Field>
              <label className="flex items-end gap-2 text-sm pb-2" style={{ color: 'hsl(240 5% 70%)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ accentColor: '#f97316' }} />
                Show to users
              </label>
            </div>
            {formErr && <p className="text-sm mt-4" style={{ color: '#f87171' }}>{formErr}</p>}
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(40 6% 88%)' }}>Cancel</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff' }}>
                {saving && <Loader2 size={13} className="animate-spin" />} Save plan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div onClick={() => setDeleting(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6" style={{ background: 'hsl(20 12% 6%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-lg font-semibold mb-2">Delete "{deleting.name}"?</h3>
            <p className="text-sm mb-5" style={{ color: 'hsl(240 5% 65%)' }}>
              It will disappear from the user's Signal page. This can't be undone. To hide it temporarily, use the toggle instead.
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
