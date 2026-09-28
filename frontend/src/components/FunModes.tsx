import { useMemo, useState } from 'react'
import { BriefcaseBusiness, Copy, Crown, RefreshCw, Search, Sparkles, Swords, UserRoundCheck } from 'lucide-react'
import type { Joke, Reaction, SwipeAction } from '../types'
import { buildHumorProfile, seededJokes } from '../humor'

function MiniJoke({ joke }: { joke: Joke }) {
  return <article className="mini-joke"><div><span className="category">{joke.category}</span><span>Абсурд {joke.absurdityLevel}/10</span></div><p>{joke.text}</p><small>— {joke.author}</small></article>
}

export function HumorPassport({ jokes, actions }: { jokes: Joke[]; actions: SwipeAction[] }) {
  const profile = useMemo(() => buildHumorProfile(jokes, actions), [jokes, actions])
  const copy = () => void navigator.clipboard?.writeText(`Мой диагноз в Смехдере: ${profile.title}. ${profile.verdict} Любимая тема: ${profile.favoriteCategory}, одобрено ${profile.approval}%.`)
  return <section className="feature-page"><div className="section-head"><div><span className="eyebrow">Результаты сомнительного тестирования</span><h1>Паспорт юмора</h1></div></div>{actions.length < 10 ? <div className="empty"><h2>Недостаточно компромата</h2><p>Оцени ещё {10 - actions.length} анекдотов, чтобы алгоритм поставил необратимый диагноз.</p></div> : <div className="passport"><div className="passport-mark">СМЕХДЕР<br/><b>ПРОВЕРЕНО</b></div><span className="eyebrow">Архетип владельца</span><h2>{profile.title}</h2><p className="passport-verdict">{profile.verdict}</p><div className="metric-grid"><div><b>{profile.approval}%</b><span>одобрения</span></div><div><b>{profile.absurdity}/10</b><span>абсурда</span></div><div><b>{profile.stuffiness}%</b><span>душноты</span></div><div><b>{profile.humorAge}</b><span>мемных лет</span></div></div><p>Особая примета: тянется к категории «{profile.favoriteCategory}».</p><button className="btn primary" onClick={copy}><Copy size={18}/> Скопировать диагноз</button></div>}</section>
}

export function Battle({ jokes, onReact }: { jokes: Joke[]; onReact: (joke: Joke, reaction: Reaction) => Promise<void> }) {
  const [round, setRound] = useState(0), [champion, setChampion] = useState<Joke | null>(null), [challengers, setChallengers] = useState(() => [...jokes].sort(() => Math.random() - .5).slice(0, 9)), [busy, setBusy] = useState(false)
  const left = champion || challengers[0], right = champion ? challengers[round + 1] : challengers[1]
  const finished = champion && (!right || round >= 7)
  const choose = async (winner: Joke, loser: Joke) => { if (busy) return; setBusy(true); try { await Promise.all([onReact(winner, 'LIKE'), onReact(loser, 'DISLIKE')]); setChampion(winner); setRound(value => value + 1) } finally { setBusy(false) } }
  const reset = () => { setChampion(null); setRound(0); setChallengers([...jokes].sort(() => Math.random() - .5).slice(0, 9)) }
  return <section className="feature-page"><div className="section-head"><div><span className="eyebrow">Юмористическая гладиаторская</span><h1>Смехобатл</h1></div>{champion && <span className="round-pill">Раунд {Math.min(round + 1, 8)}/8</span>}</div>{finished ? <div className="winner"><Crown/><span className="eyebrow">Царь горы</span><h2>Победитель пережил {round} соперников</h2><MiniJoke joke={champion}/><button className="btn primary" onClick={reset}><RefreshCw size={18}/> Новый турнир</button></div> : left && right ? <div className="battle-grid"><button disabled={busy} onClick={() => void choose(left, right)}><MiniJoke joke={left}/><b>Этот смешнее</b></button><Swords className="versus"/><button disabled={busy} onClick={() => void choose(right, left)}><MiniJoke joke={right}/><b>Нет, этот</b></button></div> : <div className="empty">Для батла нужно хотя бы два анекдота.</div>}</section>
}

export function Horoscope({ jokes }: { jokes: Joke[] }) {
  const date = new Date().toLocaleDateString('ru-RU'), cards = seededJokes(jokes, new Date().toISOString().slice(0, 10), 3)
  const labels = ['Что вас преследует', 'Что вас ждёт', 'Почему не надо открывать рабочий чат']
  return <section className="feature-page cosmic"><div className="section-head"><div><span className="eyebrow">Юридической силы не имеет · {date}</span><h1>Смехоскоп дня</h1></div><Sparkles/></div><p className="daily-verdict">Сегодня звёзды советуют доверять котам, избегать созвонов и ничего не выкатывать после 18:00.</p><div className="horoscope-grid">{cards.map((joke, index) => <div key={joke.id}><b>{labels[index]}</b><MiniJoke joke={joke}/></div>)}</div></section>
}

export function Compatibility({ jokes }: { jokes: Joke[] }) {
  const sample = useMemo(() => seededJokes(jokes, 'compatibility', 10), [jokes]), [person, setPerson] = useState<1 | 2>(1), [answers, setAnswers] = useState<Record<number, boolean[]>>({ 1: [], 2: [] })
  const current = answers[person].length, done = answers[2].length === sample.length
  const answer = (like: boolean) => setAnswers(all => ({ ...all, [person]: [...all[person], like] }))
  const next = () => setPerson(2)
  const score = done ? Math.round(answers[1].filter((value, index) => value === answers[2][index]).length / sample.length * 100) : 0
  const reset = () => { setPerson(1); setAnswers({ 1: [], 2: [] }) }
  return <section className="feature-page"><div className="section-head"><div><span className="eyebrow">Проверка отношений на прочность</span><h1>Смехометр пары</h1></div><UserRoundCheck/></div>{done ? <div className="compat-result"><b>{score}%</b><h2>{score > 70 ? 'Можно вместе читать комментарии' : score > 40 ? 'Отношения возможны под наблюдением комика' : 'Лучше не делить один аккаунт с мемами'}</h2><p>Вы одинаково оценили {Math.round(score / 10)} из 10 анекдотов.</p><button className="btn primary" onClick={reset}>Проверить другую пару</button></div> : current === sample.length ? <div className="handoff"><BriefcaseBusiness/><h2>Передай устройство человеку №2</h2><p>Ответы первого участника надёжно спрятаны примерно никак.</p><button className="btn primary" onClick={next}>Я человек №2</button></div> : sample[current] ? <div className="compat-card"><span>Человек №{person} · {current + 1}/10</span><MiniJoke joke={sample[current]}/><div><button className="btn ghost" onClick={() => answer(false)}>Баян</button><button className="btn primary" onClick={() => answer(true)}>Ахах</button></div></div> : null}</section>
}

function JokeLookup({ jokes }: { jokes: Joke[] }) {
  const [id, setId] = useState('404'), [searched, setSearched] = useState(false)
  const found = jokes.find(joke => joke.id === Number(id)), consolation = seededJokes(jokes, id || '404', 1)[0]
  return <div className="lookup"><span className="eyebrow">Архивный розыск</span><h2>Найти анекдот по делу №</h2><form onSubmit={event => { event.preventDefault(); setSearched(true) }}><input min="1" type="number" value={id} onChange={event => { setId(event.target.value); setSearched(false) }}/><button className="btn primary"><Search size={18}/> Искать</button></form>{searched && (found ? <MiniJoke joke={found}/> : <div className="not-found"><b>404</b><h3>Анекдот №{id} не найден</h3><p>Возможно, он ушёл на пересказ к деду. Вот компенсация морального ущерба:</p>{consolation && <MiniJoke joke={consolation}/>}</div>)}</div>
}

export function FunLab({ jokes, actions, onReact }: { jokes: Joke[]; actions: SwipeAction[]; onReact: (joke: Joke, reaction: Reaction) => Promise<void> }) {
  const [mode, setMode] = useState<'passport' | 'battle' | 'daily' | 'pair' | 'lookup'>('passport')
  return <><div className="lab-tabs"><button className={mode === 'passport' ? 'active' : ''} onClick={() => setMode('passport')}>Паспорт</button><button className={mode === 'battle' ? 'active' : ''} onClick={() => setMode('battle')}>Батл</button><button className={mode === 'daily' ? 'active' : ''} onClick={() => setMode('daily')}>Смехоскоп</button><button className={mode === 'pair' ? 'active' : ''} onClick={() => setMode('pair')}>Совместимость</button><button className={mode === 'lookup' ? 'active' : ''} onClick={() => setMode('lookup')}>Розыск 404</button></div>{mode === 'passport' && <HumorPassport jokes={jokes} actions={actions}/>} {mode === 'battle' && <Battle jokes={jokes} onReact={onReact}/>} {mode === 'daily' && <Horoscope jokes={jokes}/>} {mode === 'pair' && <Compatibility jokes={jokes}/>} {mode === 'lookup' && <section className="feature-page"><LookupHeader/><JokeLookup jokes={jokes}/></section>}</>
}

function LookupHeader() { return <div className="section-head"><div><span className="eyebrow">Записи исчезают, sequence помнит</span><h1>Бюро находок</h1></div></div> }
