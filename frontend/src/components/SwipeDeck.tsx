import { useEffect, useMemo, useState, type PointerEvent } from 'react'
import { Heart, RotateCcw, Sparkles, ThumbsDown } from 'lucide-react'
import type { Joke } from '../types'

export function SwipeDeck({ jokes, onReact }: { jokes: Joke[]; onReact: (joke: Joke, reaction: 'LIKE' | 'DISLIKE') => Promise<void> }) {
  const [seen, setSeen] = useState<number[]>(() => JSON.parse(localStorage.getItem('laughder-seen') || '[]'))
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const unseen = useMemo(() => jokes.filter(j => !seen.includes(j.id)), [jokes, seen])
  const current = unseen[0]
  useEffect(() => localStorage.setItem('laughder-seen', JSON.stringify(seen)), [seen])

  const react = async (reaction: 'LIKE' | 'DISLIKE') => {
    if (!current || busy) return
    setBusy(true); setOffset(reaction === 'LIKE' ? 700 : -700)
    try { await onReact(current, reaction); setSeen(s => [...s, current.id]) } finally { setTimeout(() => { setOffset(0); setBusy(false) }, 180) }
  }
  const down = (e: PointerEvent) => { if (!busy) { setDragging(true); e.currentTarget.setPointerCapture(e.pointerId) } }
  const move = (e: PointerEvent) => { if (dragging) setOffset(v => v + e.movementX) }
  const up = () => { setDragging(false); if (Math.abs(offset) > 110) void react(offset > 0 ? 'LIKE' : 'DISLIKE'); else setOffset(0) }
  const reset = () => { setSeen([]); setOffset(0) }

  if (!current) return <section className="empty deck-empty"><div className="empty-icon"><Sparkles /></div><h2>Ты пересмотрел весь интернет</h2><p>Новых анекдотов пока нет. Можно начать круг почёта.</p><button className="btn primary" onClick={reset}><RotateCcw size={18}/> Смотреть заново</button></section>
  const tilt = offset / 24
  return <section className="swipe-zone">
    <div className="deck-meta"><span>{seen.length + 1} из {jokes.length}</span><span>Тяни карточку в сторону</span></div>
    <div className="card-stage">
      {unseen[1] && <div className="joke-card next-card" />}
      <article className={`joke-card swipe-card ${dragging ? 'dragging' : ''}`} style={{ transform: `translateX(${offset}px) rotate(${tilt}deg)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <span className={`stamp nope ${offset < -45 ? 'visible' : ''}`}>БАЯН</span><span className={`stamp like ${offset > 45 ? 'visible' : ''}`}>АХАХ</span>
        <div className="joke-top"><span className="category">{current.category}</span>{current.adult && <span className="adult">18+</span>}</div>
        <blockquote>{current.text}</blockquote>
        <div className="joke-footer"><div><span>Автор</span><b>{current.author}</b></div><div className="absurd"><span>Абсурд</span><b>{current.absurdityLevel}/10</b></div></div>
      </article>
    </div>
    <div className="reactions"><button className="reaction no" disabled={busy} onClick={() => void react('DISLIKE')} aria-label="Баян"><ThumbsDown /></button><div className="compat"><small>Мемосовместимость</small><b>{Math.min(99, 54 + seen.length * 3)}%</b></div><button className="reaction yes" disabled={busy} onClick={() => void react('LIKE')} aria-label="Смешно"><Heart /></button></div>
  </section>
}

