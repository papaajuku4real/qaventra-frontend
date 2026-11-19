import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/ui/Navbar'
import { cn } from '@/lib/utils'

const PAIRS = [
  { label: 'BTC/USDT',  price: '103,247.50', change: '+2.34', up: true,  color: '#f7931a' },
  { label: 'ETH/USDT',  price: '3,891.22',   change: '+1.78', up: true,  color: '#627eea' },
  { label: 'SOL/USDT',  price: '182.64',      change: '-0.95', up: false, color: '#9945ff' },
  { label: 'BNB/USDT',  price: '712.10',      change: '+0.63', up: true,  color: '#f3ba2f' },
  { label: 'XRP/USDT',  price: '0.5841',      change: '-1.22', up: false, color: '#346aa9' },
  { label: 'ADA/USDT',  price: '0.4512',      change: '+3.05', up: true,  color: '#4b9cd3' },
  { label: 'DOGE/USDT', price: '0.1823',      change: '+5.41', up: true,  color: '#c2a633' },
  { label: 'AVAX/USDT', price: '38.92',       change: '-2.17', up: false, color: '#e84142' },
]
const PAIRS_DOUBLED = [...PAIRS, ...PAIRS]

// Hero background video — local rotating globe
const HERO_VIDEO = '/videos/rotating_globe.mp4'

// No external poster needed — the first frame of the local video loads instantly
const HERO_POSTER = ''

function AnnouncementBadge() {
  return (
    <div className={cn('liquid-glass rounded-full flex items-center gap-2 px-4 py-2 text-sm text-foreground/80')}>
      <span className="text-primary-gradient font-medium">Nova+ Launched!</span>
      <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-0.5 text-xs font-medium text-foreground/70">
        Explore <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
      </span>
    </div>
  )
}

function SocialProofBar() {
  return (
    <div className="relative z-10 w-full flex items-center gap-8 px-6 py-6 overflow-hidden">
      <div className="shrink-0 text-sm text-foreground/50 leading-snug">
        Live markets<br />available now
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />
        <div className="flex animate-marquee whitespace-nowrap gap-3">
          {PAIRS_DOUBLED.map(({ label, price, change, up, color }, i) => (
            <div key={`${label}-${i}`} className="flex items-center gap-3 shrink-0 liquid-glass rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-sm font-semibold text-foreground/80 tracking-wide">{label}</span>
              <span className="text-sm text-foreground/50 font-mono">${price}</span>
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  color: up ? '#4ade80' : '#f87171',
                  backgroundColor: up ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                }}
              >
                {change}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="relative w-full min-h-screen flex flex-col overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'grayscale(1) brightness(0.45) contrast(1.1)' }}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={HERO_POSTER}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* Orange gradient overlay — multi-layer to keep the globe visible while
          washing the scene in brand purple/violet/cyan. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(249,115,22,0.28) 0%, rgba(249,115,22,0.12) 35%, transparent 65%), radial-gradient(ellipse 60% 50% at 15% 30%, rgba(249,115,22,0.32) 0%, transparent 60%), radial-gradient(ellipse 60% 55% at 85% 70%, rgba(234,88,12,0.18) 0%, transparent 60%), linear-gradient(180deg, rgba(34,33,32,0.55) 0%, rgba(25,24,23,0.65) 40%, rgba(20,19,18,0.88) 75%, hsl(20 12% 3%) 98%)',
          mixBlendMode: 'normal',
        }}
      />
      {/* Soft warm vignette at the edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(124,45,18,0.35) 90%, rgba(28,27,26,0.75) 100%)',
        }}
      />

      {/* Orange horizon arc glow (reference design) — animated */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] pointer-events-none overflow-hidden">
        <div className="qv-arc">
          {/* static base ring + pulsing glow */}
          <div className="qv-arc-base" />
          {/* spinning light that sweeps along the ring */}
          <div className="qv-arc-spin" />
          {/* soft spinning haze above the ring for movement */}
          <div className="qv-arc-haze" />
        </div>
        <style>{`
          .qv-arc {
            position: absolute; left: 50%; top: 38%; transform: translateX(-50%);
            width: 150vw; height: 150vw; max-width: 1800px; max-height: 1800px;
          }
          .qv-arc > div { position: absolute; inset: 0; border-radius: 50%; }
          .qv-arc-base {
            border-top: 1.5px solid rgba(255,138,76,0.55);
            background: radial-gradient(ellipse 50% 12% at 50% 0%, rgba(249,115,22,0.28) 0%, transparent 100%), hsl(20 12% 3%);
            animation: qvArcPulse 4s ease-in-out infinite;
          }
          .qv-arc-spin {
            padding: 2px;
            background: conic-gradient(from 0deg,
              transparent 0deg, rgba(255,170,110,0) 20deg, rgba(255,170,110,1) 40deg, rgba(249,115,22,0.9) 50deg, transparent 80deg,
              transparent 180deg, rgba(255,170,110,0) 200deg, rgba(255,170,110,1) 220deg, rgba(249,115,22,0.9) 230deg, transparent 260deg,
              transparent 360deg);
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude;
            filter: drop-shadow(0 0 6px rgba(255,138,76,0.9)) drop-shadow(0 0 18px rgba(249,115,22,0.7));
            animation: qvArcSpin 9s linear infinite;
          }
          .qv-arc-haze {
            inset: -6% !important;
            background: conic-gradient(from 0deg,
              transparent 0deg, rgba(249,115,22,0.22) 45deg, transparent 100deg,
              transparent 180deg, rgba(244,81,30,0.18) 225deg, transparent 280deg);
            filter: blur(60px);
            -webkit-mask: radial-gradient(circle, transparent 62%, #000 68%, transparent 74%);
                    mask: radial-gradient(circle, transparent 62%, #000 68%, transparent 74%);
            animation: qvArcSpin 14s linear infinite reverse;
          }
          @keyframes qvArcSpin { to { transform: rotate(360deg); } }
          @keyframes qvArcPulse {
            0%, 100% { box-shadow: 0 -18px 60px rgba(249,115,22,0.45), 0 -60px 160px rgba(244,81,30,0.25), inset 0 40px 120px rgba(249,115,22,0.18); }
            50%      { box-shadow: 0 -24px 80px rgba(249,115,22,0.70), 0 -80px 200px rgba(244,81,30,0.40), inset 0 50px 140px rgba(249,115,22,0.28); }
          }
          @media (prefers-reduced-motion: reduce) {
            .qv-arc-spin, .qv-arc-haze, .qv-arc-base { animation: none; }
          }
        `}</style>
      </div>

      <div className="relative z-10 flex flex-col flex-1 w-full">
        <Navbar />

        <div className="flex flex-col flex-1 items-center justify-center px-4 pt-20 pb-8 text-center">
          <AnnouncementBadge />
          <h1 className="mt-8 text-hero-heading text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem] font-semibold leading-[1.05] tracking-tight max-w-5xl">
            Trade Smarter. Grow Faster.<br />Take Control of Your<br />Financial Future.
          </h1>
          <p className="text-hero-sub text-lg max-w-lg mt-4 opacity-80 leading-relaxed">
            Access global markets with powerful tools, real-time data, and a platform built for both beginners and professionals. Start trading with confidence today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Button variant="hero" onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </div>

        <div className="mt-auto">
          <SocialProofBar />
        </div>
      </div>
    </section>
  )
}
