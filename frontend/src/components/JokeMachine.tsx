import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Clover, Sparkles } from 'lucide-react'
import type { Joke } from '../types'
import './JokeMachine.css'

const SYMBOLS = ['АХАХ', 'БАЯН', 'КОТ', '404', '???', 'ХА']
const QUESTIONS = ['Стоит ли сегодня работать?', 'Можно ли выкатывать в прод?', 'Ответит ли он/она?', 'Кто виноват?', 'Я смешной?']
const VERDICTS = ['Категорически возможно.', 'Звёзды говорят: сначала сделай бэкап.', 'Да, но потом придётся объяснять.', 'Нет. Ответственность переложена на кота.', 'Вероятность успеха подозрительно ненулевая.']

export function JokeMachine({ jokes }: { jokes: Joke[] }) {
  const [reels, setReels] = useState(['АХАХ', 'КОТ', '???'])
  const [result, setResult] = useState<Joke | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [leverPull, setLeverPull] = useState(0)
  const [leverDragging, setLeverDragging] = useState(false)
  const [question, setQuestion] = useState(QUESTIONS[0])
  const [verdict, setVerdict] = useState('')
  const leverStartY = useRef(0)
  const leverPullRef = useRef(0)
  const lastId = useRef<number | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const spin = () => {
    if (spinning || !jokes.length) return
    setSpinning(true)
    setResult(null)
    setVerdict('')
    let tick = 0
    const animate = () => {
      setReels([0, 1, 2].map(index => SYMBOLS[(tick + index * 2 + Math.floor(Math.random() * SYMBOLS.length)) % SYMBOLS.length]))
      tick += 1
      if (tick < 17) timers.current.push(window.setTimeout(animate, 65 + tick * 5))
      else {
        const pool = jokes.filter(joke => joke.id !== lastId.current)
        const candidates = pool.length ? pool : jokes
        const joke = candidates[Math.floor(Math.random() * candidates.length)]
        lastId.current = joke.id
        setReels([joke.category.toUpperCase(), `${joke.absurdityLevel}/10`, joke.likes > joke.dislikes ? 'АХАХ' : 'БАЯН'])
        setResult(joke)
        setVerdict(VERDICTS[(joke.id + joke.absurdityLevel) % VERDICTS.length])
        setSpinning(false)
      }
    }
    animate()
  }

  const startLever = (event: PointerEvent<HTMLButtonElement>) => {
    if (spinning || !jokes.length) return
    leverStartY.current = event.clientY
    setLeverDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const moveLever = (event: PointerEvent<HTMLButtonElement>) => {
    if (!leverDragging) return
    const pull = Math.max(0, Math.min(90, event.clientY - leverStartY.current))
    leverPullRef.current = pull
    setLeverPull(pull)
  }
  const releaseLever = () => {
    if (!leverDragging) return
    const shouldSpin = leverPullRef.current >= 58
    setLeverDragging(false)
    leverPullRef.current = 0
    setLeverPull(0)
    if (shouldSpin) spin()
  }

  return <section className="machine-page">
    <div className="machine-intro"><span className="eyebrow">Никаких ставок, только сомнительный юмор</span><h1>Однорукий<br/><i>анекдомат</i></h1><p>Дёрни рычаг, дождись совпадения звёзд и получи случайный анекдот. Проиграть здесь можно только чувство юмора.</p></div>
    <div><label className="fortune-question">Вопрос к автомату<select value={question} onChange={event => setQuestion(event.target.value)}>{QUESTIONS.map(item => <option key={item}>{item}</option>)}</select></label><div className={`slot-machine ${spinning ? 'spinning' : ''}`}>
      <div className="machine-lights">{Array.from({ length: 12 }, (_, index) => <i key={index}/>)}</div>
      <div className="machine-title"><Clover/> СМЕХ · 777 <Clover/></div>
      <div className="reel-window">{reels.map((reel, index) => <div className="reel" key={index}><span>{reel}</span></div>)}</div>
      <div className={`machine-result ${result ? 'revealed' : ''}`}>
        {result ? <><div><span className="category">{result.category}</span><span>Абсурд {result.absurdityLevel}/10</span></div><blockquote>{result.text}</blockquote><small>— {result.author}</small>{verdict && <div className="machine-verdict"><b>{question}</b><span>{verdict} Уверенность: {result.absurdityLevel}/10.</span></div>}</> : <><Sparkles/><p>Испытай юмористическую удачу</p></>}
      </div>
      <div className="pull-hint">{spinning ? 'БАРАБАНЫ КРУТЯТСЯ…' : 'ЗАЖМИ И ПОТЯНИ РЫЧАГ ВНИЗ'}</div>
      <button className={`lever ${leverDragging ? 'dragging' : ''}`} disabled={spinning || !jokes.length} onPointerDown={startLever} onPointerMove={moveLever} onPointerUp={releaseLever} onPointerCancel={releaseLever} style={{ '--pull': `${leverPull}px` } as CSSProperties} aria-label="Потянуть рычаг вниз"><b className="lever-track"/><span className="lever-arm"><i/></span></button>
    </div></div>
  </section>
}
