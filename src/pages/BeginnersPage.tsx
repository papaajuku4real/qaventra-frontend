import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronDown, ArrowLeft } from 'lucide-react'
import { PageBackground } from '@/components/ui/PageBackground'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'

const MODULES = [
  {
    title: 'How financial markets work',
    lessons: [
      { title: 'What is a market?', body: 'A market is simply a place where buyers and sellers agree on a price. Prices move because the balance between people wanting to buy and people wanting to sell is constantly changing.' },
      { title: 'Asset classes explained', body: 'Forex (currencies), stocks, indices, commodities and crypto each behave differently. Forex trades 24 hours on weekdays, stocks follow exchange hours, and crypto never closes.' },
      { title: 'What drives price', body: 'Economic data, interest rate decisions, company earnings, news and overall market sentiment all shift supply and demand — and that shift is what you see as price movement.' },
    ],
  },
  {
    title: 'Reading a price chart',
    lessons: [
      { title: 'Line, bar and candlestick charts', body: 'Candlesticks are the most popular: each candle shows the open, high, low and close for a time period. A green (or hollow) candle closed higher than it opened; a red one closed lower.' },
      { title: 'Timeframes', body: 'The same market looks different on a 5-minute chart versus a daily chart. Beginners usually find higher timeframes (1-hour and above) less noisy and easier to read.' },
      { title: 'Spotting a trend', body: 'An uptrend makes higher highs and higher lows; a downtrend makes lower highs and lower lows. If neither is happening, the market is ranging.' },
    ],
  },
  {
    title: 'Understanding bid/ask & spread',
    lessons: [
      { title: 'Bid and ask prices', body: 'The bid is the price you can sell at, the ask is the price you can buy at. The ask is always slightly higher than the bid.' },
      { title: 'What the spread costs you', body: 'The spread is the gap between bid and ask. Every trade starts slightly negative by this amount, so tighter spreads mean lower trading costs.' },
      { title: 'Pips, points and lot sizes', body: 'A pip is the smallest standard price move in forex (usually 0.0001). Your position size, measured in lots, determines how much each pip is worth to you.' },
    ],
  },
  {
    title: 'Your first demo trade',
    lessons: [
      { title: 'Opening a demo account', body: 'A demo account uses virtual funds in live market conditions. It is the safest way to practise everything in this path before risking real money.' },
      { title: 'Placing a buy or sell order', body: 'Buy (go long) if you expect price to rise, sell (go short) if you expect it to fall. Market orders fill immediately; limit orders wait for your chosen price.' },
      { title: 'Stop-loss and take-profit', body: 'A stop-loss closes your trade automatically if price moves against you by a set amount; a take-profit locks in gains at your target. Always set a stop-loss before you enter.' },
    ],
  },
]

function LessonItem({ n, title, body }: { n: number; title: string; body: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="liquid-glass rounded-2xl overflow-hidden">
      <button className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left gap-4" onClick={() => setOpen(!open)}>
        <span className="flex items-center gap-3">
          <span className="text-xs font-semibold w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>{n}</span>
          <span className="text-foreground text-sm font-medium">{title}</span>
        </span>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300', open && 'rotate-180')} strokeWidth={2} />
      </button>
      {open && <div className="px-5 sm:px-6 pb-5 pl-[3.75rem] sm:pl-[4.25rem] text-muted-foreground text-sm leading-relaxed">{body}</div>}
    </div>
  )
}

export function BeginnersPage() {
  const navigate = useNavigate()
  let n = 0
  return (
    <div className="min-h-screen text-foreground overflow-x-hidden" style={{ background: 'hsl(222 87% 2%)', position: 'relative' }}>
      <PageBackground />
      <section className="relative w-full overflow-hidden pt-6 pb-16 sm:pb-24">
        <Navbar />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20 sm:pt-24">
          <Reveal>
            <button onClick={() => navigate('/education')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Education
            </button>
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
                <BookOpen className="w-7 h-7" style={{ color: '#60a5fa' }} strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-sm font-medium mb-2" style={{ color: '#60a5fa' }}>Beginner · 12 lessons</p>
            <h1 className="text-hero-heading text-[2rem] sm:text-[3.5rem] font-semibold leading-[1.05] tracking-tight">Trading Foundations</h1>
            <p className="text-hero-sub text-base sm:text-lg max-w-2xl mx-auto mt-5 opacity-80 leading-relaxed">
              Start from scratch. Understand how markets work, what drives price, and how to place your first trade safely.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-16 sm:pb-24 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-10 sm:gap-12">
          {MODULES.map((m, mi) => (
            <Reveal key={m.title} delay={mi * 60}>
              <h2 className="text-hero-heading text-lg sm:text-2xl font-semibold mb-4">
                <span className="text-muted-foreground font-normal">Module {mi + 1} · </span>{m.title}
              </h2>
              <div className="flex flex-col gap-3">
                {m.lessons.map((l) => {
                  n += 1
                  return <LessonItem key={l.title} n={n} title={l.title} body={l.body} />
                })}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="pb-16 sm:pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="liquid-glass rounded-[2rem] p-8 sm:p-16 text-center flex flex-col items-center gap-6">
              <h2 className="text-hero-heading text-2xl sm:text-4xl font-semibold leading-tight">Ready to practise?</h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-md">Create a free account to unlock the Intermediate and Advanced paths, plus a demo account to try what you've learned.</p>
              <Button variant="hero" onClick={() => navigate('/register')}>Create Free Account</Button>
            </div>
          </Reveal>
        </div>
      </section>
      <Footer />
    </div>
  )
}
