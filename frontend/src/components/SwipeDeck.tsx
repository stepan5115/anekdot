import { useEffect, useMemo, useState, type PointerEvent } from 'react'
import { Filter, Heart, RotateCcw, Shuffle, Sparkles, ThumbsDown, Undo2 } from 'lucide-react'
import type { Joke, Reaction, SwipeAction } from '../types'
import './SwipeDeck.css'

const SWIPE_DURATION = 320

function CardContent({ joke }: { joke: Joke }) {
  return <>
    <div className="joke-top"><span className="category">{joke.category}</span>{joke.adult && <span className="adult">18+</span>}</div>
    <blockquote>{joke.text}</blockquote>
    <div className="joke-footer"><div><span>Автор</span><b>{joke.author}</b></div><div className="absurd"><span>Абсурд</span><b>{joke.absurdityLevel}/10</b></div></div>
  </>
}

type Props = {
  jokes: Joke[]
  actions: SwipeAction[]
  onReact: (joke: Joke, reaction: Reaction) => Promise<void>
  onUndo: () => Promise<void>
  onReset: () => void
}

export function SwipeDeck({ jokes, actions, onReact, onUndo, onReset }: Props) {
  const categories = useMemo(() => [...new Set(jokes.map(joke => joke.category))].sort(), [jokes])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minAbsurdity, setMinAbsurdity] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [order, setOrder] = useState<number[]>([])
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => setOrder(current => {
    const valid = current.filter(id => jokes.some(joke => joke.id === id))
    const added = jokes.map(joke => joke.id).filter(id => !valid.includes(id))
    return [...valid, ...added]
  }), [jokes])

  const seenIds = useMemo(() => new Set(actions.map(action => action.jokeId)), [actions])
  const filtered = useMemo(() => {
    const byId = new Map(jokes.map(joke => [joke.id, joke]))
    return order.map(id => byId.get(id)).filter((joke): joke is Joke => Boolean(joke))
      .filter(joke => selectedCategories.length === 0 || selectedCategories.includes(joke.category))
      .filter(joke => joke.absurdityLevel >= minAbsurdity)
  }, [jokes, order, selectedCategories, minAbsurdity])
  const unseen = filtered.filter(joke => !seenIds.has(joke.id))
  const filteredSeenCount = filtered.filter(joke => seenIds.has(joke.id)).length
  const current = unseen[0]
  const next = unseen[1]

  const react = async (reaction: Reaction) => {
    if (!current || busy) return
    const direction = reaction === 'LIKE' ? 1 : -1
    setDragging(false)
    setBusy(true)
    setOffset(direction * Math.max(window.innerWidth * 1.15, 900))
    try {
      await new Promise(resolve => setTimeout(resolve, SWIPE_DURATION))
      setResetting(true)
      setOffset(0)
      await new Promise(requestAnimationFrame)
      await onReact(current, reaction)
    } finally {
      setOffset(0)
      setResetting(false)
      setBusy(false)
    }
  }

  const undo = async () => {
    if (!actions.length || busy) return
    setBusy(true)
    try { await onUndo() } finally { setBusy(false) }
  }
  const shuffle = () => setOrder(items => [...items].sort(() => Math.random() - .5))
  const toggleCategory = (category: string) => setSelectedCategories(current => current.includes(category) ? current.filter(item => item !== category) : [...current, category])
  const down = (event: PointerEvent) => { if (!busy) { setDragging(true); event.currentTarget.setPointerCapture(event.pointerId) } }
  const move = (event: PointerEvent) => { if (dragging) setOffset(value => value + event.movementX) }
  const up = () => { setDragging(false); if (Math.abs(offset) > 110) void react(offset > 0 ? 'LIKE' : 'DISLIKE'); else setOffset(0) }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return
      if (event.key === 'ArrowLeft') void react('DISLIKE')
      if (event.key === 'ArrowRight') void react('LIKE')
      if (event.key === 'Backspace') { event.preventDefault(); void undo() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const likes = actions.filter(action => action.reaction === 'LIKE')
  const likedJokes = likes.map(action => jokes.find(joke => joke.id === action.jokeId)).filter((joke): joke is Joke => Boolean(joke))
  const favoriteCategory = [...new Set(likedJokes.map(joke => joke.category))]
    .sort((a, b) => likedJokes.filter(joke => joke.category === b).length - likedJokes.filter(joke => joke.category === a).length)[0]
  const averageAbsurdity = likedJokes.length ? (likedJokes.reduce((sum, joke) => sum + joke.absurdityLevel, 0) / likedJokes.length).toFixed(1) : '—'
  const lastTen = actions.slice(-10)
  const streak = lastTen.length === 10 && lastTen.every(action => action.reaction === lastTen[0].reaction) ? lastTen[0].reaction : null

  const controls = <>
    <div className="deck-tools">
      <button className={`tool-button ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(value => !value)}><Filter size={16}/> Фильтры</button>
      <button className="tool-button" onClick={shuffle}><Shuffle size={16}/> Перемешать</button>
    </div>
    {showFilters && <div className="deck-filters">
      <div className="category-filters">{categories.map(category => <button key={category} className={selectedCategories.includes(category) ? 'active' : ''} onClick={() => toggleCategory(category)}>{category}</button>)}</div>
      <label>Абсурд от <b>{minAbsurdity}</b><input type="range" min="1" max="10" value={minAbsurdity} onChange={event => setMinAbsurdity(Number(event.target.value))}/></label>
    </div>}
  </>

  if (!current) return <section className="swipe-zone">{controls}<div className="empty deck-empty results"><div className="empty-icon"><Sparkles/></div><h2>{actions.length ? 'Колода закончилась' : 'По фильтрам ничего нет'}</h2>{actions.length ? <><div className="result-grid"><div><b>{likes.length}</b><span>ахахов</span></div><div><b>{actions.length - likes.length}</b><span>баянов</span></div><div><b>{favoriteCategory || '—'}</b><span>любимая тема</span></div><div><b>{averageAbsurdity}</b><span>средний абсурд</span></div></div><p>{likes.length > actions.length / 2 ? 'Диагноз: смеёшься чаще, чем осуждаешь.' : 'Диагноз: строгий хранитель качества анекдотов.'}</p><button className="btn primary" onClick={onReset}><RotateCcw size={18}/> Смотреть заново</button></> : <p>Ослабь фильтры — даже странные шутки заслуживают шанс.</p>}</div></section>

  const tilt = busy ? Math.sign(offset) * 22 : Math.max(-14, Math.min(14, offset / 24))
  const progress = Math.min(Math.abs(offset) / 240, 1)

  return <section className="swipe-zone">
    {controls}
    {streak && <div className={`streak ${streak === 'LIKE' ? 'happy' : ''}`}>{streak === 'LIKE' ? '🎉 Смеющийся без причины: 10 ахахов подряд!' : '🧐 Может, дело уже не в анекдотах?'}</div>}
    {actions.length >= 100 && actions.length % 100 === 0 && <div className="streak">Вы посмотрели весь интернет. Можно идти гулять.</div>}
    <div className="deck-meta"><span>{filteredSeenCount + 1} из {filtered.length}</span><span>← баян · ахах →</span></div>
    <div className="card-stage">
      {next && <article key={`next-${next.id}`} className="joke-card next-card" style={{ transform: `translateY(${18 - progress * 18}px) rotate(${2 - progress * 2}deg)` }} aria-hidden="true"><CardContent joke={next}/></article>}
      <article key={current.id} className={`joke-card swipe-card ${dragging ? 'dragging' : ''} ${busy ? 'flying' : ''} ${resetting ? 'resetting' : ''} ${current.absurdityLevel === 10 ? 'maximum-absurdity' : ''} ${current.category === 'Коты' ? 'cat-card' : ''}`} style={{ transform: `translateX(${offset}px) rotate(${tilt}deg)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <span className={`stamp nope ${offset < -45 ? 'visible' : ''}`}>БАЯН</span><span className={`stamp like ${offset > 45 ? 'visible' : ''}`}>АХАХ</span><CardContent joke={current}/>
      </article>
    </div>
    <div className="reactions"><button className="reaction no" disabled={busy} onClick={() => void react('DISLIKE')} aria-label="Баян"><ThumbsDown/></button><button className="reaction undo" disabled={busy || !actions.length} onClick={() => void undo()} title="Вернуть предыдущую карточку (Backspace)"><Undo2/></button><button className="reaction yes" disabled={busy} onClick={() => void react('LIKE')} aria-label="Смешно"><Heart/></button></div>
  </section>
}
