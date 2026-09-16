import { useEffect, useMemo, useState, type PointerEvent } from 'react'
import { Heart, RotateCcw, Sparkles, ThumbsDown } from 'lucide-react'
import type { Joke } from '../types'
import './SwipeDeck.css'

const SWIPE_DURATION = 320

function CardContent({ joke }: { joke: Joke }) {
  return <>
    <div className="joke-top"><span className="category">{joke.category}</span>{joke.adult && <span className="adult">18+</span>}</div>
    <blockquote>{joke.text}</blockquote>
    <div className="joke-footer"><div><span>Автор</span><b>{joke.author}</b></div><div className="absurd"><span>Абсурд</span><b>{joke.absurdityLevel}/10</b></div></div>
  </>
}

export function SwipeDeck({ jokes, onReact }: { jokes: Joke[]; onReact: (joke: Joke, reaction: 'LIKE' | 'DISLIKE') => Promise<void> }) {
  const [seen, setSeen] = useState<number[]>(() => JSON.parse(localStorage.getItem('laughder-seen') || '[]'))
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const unseen = useMemo(() => jokes.filter(j => !seen.includes(j.id)), [jokes, seen])
  const current = unseen[0]
  const next = unseen[1]
  useEffect(() => localStorage.setItem('laughder-seen', JSON.stringify(seen)), [seen])

  const react = async (reaction: 'LIKE' | 'DISLIKE') => {
    if (!current || busy) return
    const swipedJoke = current
    const direction = reaction === 'LIKE' ? 1 : -1
    const flyDistance = Math.max(window.innerWidth * 1.15, 900)
    setDragging(false)
    setBusy(true)
    setOffset(direction * flyDistance)
    try {
      await Promise.all([
        onReact(swipedJoke, reaction),
        new Promise(resolve => setTimeout(resolve, SWIPE_DURATION)),
      ])
      setSeen(items => [...items, swipedJoke.id])
    } finally {
      setOffset(0)
      setBusy(false)
    }
  }
  const down = (e: PointerEvent) => { if (!busy) { setDragging(true); e.currentTarget.setPointerCapture(e.pointerId) } }
  const move = (e: PointerEvent) => { if (dragging) setOffset(value => value + e.movementX) }
  const up = () => { setDragging(false); if (Math.abs(offset) > 110) void react(offset > 0 ? 'LIKE' : 'DISLIKE'); else setOffset(0) }
  const reset = () => { setSeen([]); setOffset(0) }

  if (!current) return <section className="empty deck-empty"><div className="empty-icon"><Sparkles /></div><h2>Ты пересмотрел весь интернет</h2><p>Новых анекдотов пока нет. Можно начать круг почёта.</p><button className="btn primary" onClick={reset}><RotateCcw size={18}/> Смотреть заново</button></section>

  const tilt = busy ? Math.sign(offset) * 22 : Math.max(-14, Math.min(14, offset / 24))
  const progress = Math.min(Math.abs(offset) / 240, 1)
  const nextY = 18 - progress * 18

  return <section className="swipe-zone">
    <div className="deck-meta"><span>{seen.length + 1} из {jokes.length}</span><span>Тяни карточку в сторону</span></div>
    <div className="card-stage">
      {next && <article key={`next-${next.id}`} className="joke-card next-card" style={{ transform: `translateY(${nextY}px) rotate(${2 - progress * 2}deg)` }} aria-hidden="true"><CardContent joke={next} /></article>}
      <article key={current.id} className={`joke-card swipe-card ${dragging ? 'dragging' : ''} ${busy ? 'flying' : ''}`} style={{ transform: `translateX(${offset}px) rotate(${tilt}deg)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <span className={`stamp nope ${offset < -45 ? 'visible' : ''}`}>БАЯН</span><span className={`stamp like ${offset > 45 ? 'visible' : ''}`}>АХАХ</span>
        <CardContent joke={current} />
      </article>
    </div>
    <div className="reactions"><button className="reaction no" disabled={busy} onClick={() => void react('DISLIKE')} aria-label="Баян"><ThumbsDown /></button><div className="compat"><small>Мемосовместимость</small><b>{Math.min(99, 54 + seen.length * 3)}%</b></div><button className="reaction yes" disabled={busy} onClick={() => void react('LIKE')} aria-label="Смешно"><Heart /></button></div>
  </section>
}
