import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { BookOpen, BriefcaseBusiness, Code2, Dices, Flame, Heart, Laugh, LogOut, Microscope, RefreshCw, Skull, X } from 'lucide-react'
import 'swagger-ui-react/swagger-ui.css'
import { api, authToken } from './api'
import type { Joke, JokeInput, Reaction, SwipeAction } from './types'
import { SwipeDeck } from './components/SwipeDeck'
import { Library } from './components/Library'
import { JokeForm } from './components/JokeForm'
import { JokeMachine } from './components/JokeMachine'
import { FunLab } from './components/FunModes'
import { corporateReport } from './humor'
import { AdminLogin } from './components/AdminLogin'

type Page = 'swipe' | 'machine' | 'lab' | 'favorites' | 'library' | 'docs'
const SwaggerUI = lazy(() => import('swagger-ui-react'))

export default function App() {
  const [page, setPage] = useState<Page>('swipe'), [jokes, setJokes] = useState<Joke[]>([])
  const [loading, setLoading] = useState(true), [error, setError] = useState('')
  const [editing, setEditing] = useState<Joke | null | undefined>(undefined), [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Joke | null>(null), [bossMode, setBossMode] = useState(false)
  const [admin, setAdmin] = useState(() => Boolean(authToken.get()))
  const [, setLogoClicks] = useState(0), [dadMode, setDadMode] = useState(false)
  const [actions, setActions] = useState<SwipeAction[]>(() => {
    try { return JSON.parse(localStorage.getItem('laughder-actions') || '[]') } catch { return [] }
  })
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('laughder-favorites') || '[]') } catch { return [] }
  })
  const load = useCallback(async () => { setLoading(true); setError(''); try { setJokes(await api.list()) } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось загрузить анекдоты') } finally { setLoading(false) } }, [])
  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const unauthorized = () => setAdmin(false)
    window.addEventListener('admin-unauthorized', unauthorized)
    if (admin) void api.verify().catch(() => setAdmin(false))
    return () => window.removeEventListener('admin-unauthorized', unauthorized)
  }, [admin])
  useEffect(() => localStorage.setItem('laughder-actions', JSON.stringify(actions)), [actions])
  useEffect(() => localStorage.setItem('laughder-favorites', JSON.stringify(favoriteIds)), [favoriteIds])
  const save = async (input: JokeInput) => { setSaving(true); setError(''); try { if (editing) await api.replace(editing.id, input); else await api.create(input); setEditing(undefined); await load() } catch (e) { setError(e instanceof Error ? e.message : 'Ошибка сохранения') } finally { setSaving(false) } }
  const remove = async (joke: Joke) => { try { await api.remove(joke.id); setDeleting(null); await load() } catch (e) { setError(e instanceof Error ? e.message : 'Ошибка удаления') } }
  const react = async (joke: Joke, reaction: Reaction) => { const updated = await api.react(joke.id, reaction); setJokes(items => items.map(j => j.id === updated.id ? updated : j)); setActions(items => [...items, { jokeId: joke.id, reaction }]); if (reaction === 'LIKE') setFavoriteIds(items => items.includes(joke.id) ? items : [...items, joke.id]) }
  const undo = async () => { const last = actions.at(-1); if (!last) return; const updated = await api.undoReaction(last.jokeId, last.reaction); setJokes(items => items.map(j => j.id === updated.id ? updated : j)); setActions(items => items.slice(0, -1)); if (last.reaction === 'LIKE') setFavoriteIds(items => items.filter(id => id !== last.jokeId)) }
  const resetDeck = () => setActions([])
  const nav = (next: Page) => { setPage(next); setError('') }
  useEffect(() => { const key = (event: KeyboardEvent) => { if (event.key === 'Escape' && bossMode) setBossMode(false); if (event.ctrlKey && event.key.toLowerCase() === 'b') { event.preventDefault(); setBossMode(value => !value) } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [bossMode])
  const logo = () => { nav('swipe'); setLogoClicks(value => { const next = value + 1; if (next >= 7) { setDadMode(true); return 0 } return next }) }
  if (bossMode) { const report = corporateReport(jokes); return <div className="boss-screen"><header><b>ООО «Распределённые сущности»</b><button onClick={() => setBossMode(false)}>Закрыть отчёт ×</button></header><main><span>Внутренний документ · Q{Math.ceil((new Date().getMonth() + 1) / 3)}</span><h1>Квартальный анализ операционных показателей</h1><div className="boss-metrics"><div><b>{report.kpi}%</b><span>выполнение KPI</span></div><div><b>{report.synergy}%</b><span>межотраслевая синергия</span></div><div><b>{report.entities}</b><span>распределённых сущностей</span></div><div><b>{report.risk}</b><span>зон повышенного риска</span></div></div><table><tbody>{jokes.slice(0, 8).map(joke => <tr key={joke.id}><td>ENT-{String(joke.id).padStart(4, '0')}</td><td>{joke.category}</td><td>В обработке</td><td>{joke.absurdityLevel * 10}%</td></tr>)}</tbody></table><p>Анекдотов обнаружено: 0. Работа ведётся по плану.</p></main></div> }
  return <div className={`app ${dadMode ? 'dad-mode' : ''}`}>
    <header><button className="brand" onClick={logo}><span><Laugh /></span><b>Смехдер</b><small>β</small></button><div className="header-actions"><nav><button className={page === 'swipe' ? 'active' : ''} onClick={() => nav('swipe')}><Flame/> Свайпы</button><button className={page === 'machine' ? 'active' : ''} onClick={() => nav('machine')}><Dices/> Анекдомат</button><button className={page === 'lab' ? 'active' : ''} onClick={() => nav('lab')}><Microscope/> Смехлаб</button><button className={page === 'favorites' ? 'active' : ''} onClick={() => nav('favorites')}><Heart/> Мои ахахи</button><button className={page === 'library' ? 'active' : ''} onClick={() => nav('library')}><BookOpen/> Анекдотека</button><button className={page === 'docs' ? 'active' : ''} onClick={() => nav('docs')}><Code2/> API</button></nav>{admin && <button className="boss-button" onClick={() => { authToken.clear(); setAdmin(false); nav('swipe') }} title="Выйти из админ-панели"><LogOut/></button>}<button className="boss-button" onClick={() => setBossMode(true)} title="Начальник рядом (Ctrl+B)"><BriefcaseBusiness/></button></div></header>
    <main>
      {error && <div className="toast"><span>{error}</span><button onClick={() => setError('')}>×</button></div>}
      {loading && page !== 'docs' ? <div className="loader"><RefreshCw/><span>Прогреваем шутки…</span></div> : <>
        {page === 'swipe' && <div className="swipe-page"><div className="hero"><span className="eyebrow">Алгоритм сомнительного юмора</span><h1>Свайпай.<br/><i>Не осуждай.</i></h1><p>Вправо — «ахах». Влево — «баян». Стрелки работают с клавиатуры, Backspace возвращает последнюю карточку.</p></div><SwipeDeck jokes={jokes} actions={actions} onReact={react} onUndo={undo} onReset={resetDeck}/></div>}
        {page === 'machine' && <JokeMachine jokes={jokes}/>}
        {page === 'lab' && <FunLab jokes={jokes} actions={actions} onReact={react}/>}
        {page === 'favorites' && <Library favorites jokes={jokes.filter(joke => favoriteIds.includes(joke.id))} onAdd={() => {}} onEdit={() => {}} onDelete={() => {}} onRemoveFavorite={joke => setFavoriteIds(items => items.filter(id => id !== joke.id))}/>}
        {page === 'library' && (admin ? <Library jokes={jokes} onAdd={() => setEditing(null)} onEdit={setEditing} onDelete={setDeleting}/> : <AdminLogin onSuccess={() => setAdmin(true)}/>)}
        {page === 'docs' && <section className="docs"><div className="section-head"><div><span className="eyebrow">Здесь смеются строго по контракту</span><h1>Swagger API</h1></div></div><div className="swagger-wrap"><Suspense fallback={<div className="loader"><RefreshCw/><span>Загружаем Swagger…</span></div>}><SwaggerUI url={api.docsUrl}/></Suspense></div></section>}
      </>}
    </main>
    {dadMode && <div className="achievement">🏆 Режим батиного юмора разблокирован. Выхода нет.</div>}
    {editing !== undefined && <JokeForm joke={editing} jokes={jokes} saving={saving} onSave={save} onClose={() => setEditing(undefined)}/>}
    {deleting && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setDeleting(null)}><div className="modal funeral"><button className="icon-btn close" onClick={() => setDeleting(null)}><X/></button><Skull/><span className="eyebrow">Анекдотный некролог</span><h2>Проводить анекдот №{deleting.id} в последний путь?</h2><p>Он прожил {deleting.likes + deleting.dislikes} реакций, получил {deleting.likes} ахахов и {deleting.dislikes} баянов. Причина смерти: административное решение.</p><blockquote>{deleting.text}</blockquote><div className="modal-actions"><button className="btn ghost" onClick={() => setDeleting(null)}>Он ещё может рассмешить</button><button className="btn danger-btn" onClick={() => void remove(deleting)}>Похоронить навсегда</button></div></div></div>}
    <footer><span>Сделано на Java, React и шутках сомнительного качества</span><span>CRUD, но весело</span></footer>
  </div>
}
