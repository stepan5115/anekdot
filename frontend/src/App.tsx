import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { BookOpen, Code2, Flame, Laugh, RefreshCw } from 'lucide-react'
import 'swagger-ui-react/swagger-ui.css'
import { api } from './api'
import type { Joke, JokeInput } from './types'
import { SwipeDeck } from './components/SwipeDeck'
import { Library } from './components/Library'
import { JokeForm } from './components/JokeForm'

type Page = 'swipe' | 'library' | 'docs'
const SwaggerUI = lazy(() => import('swagger-ui-react'))

export default function App() {
  const [page, setPage] = useState<Page>('swipe'), [jokes, setJokes] = useState<Joke[]>([])
  const [loading, setLoading] = useState(true), [error, setError] = useState('')
  const [editing, setEditing] = useState<Joke | null | undefined>(undefined), [saving, setSaving] = useState(false)
  const load = useCallback(async () => { setLoading(true); setError(''); try { setJokes(await api.list()) } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось загрузить анекдоты') } finally { setLoading(false) } }, [])
  useEffect(() => { void load() }, [load])
  const save = async (input: JokeInput) => { setSaving(true); setError(''); try { if (editing) await api.replace(editing.id, input); else await api.create(input); setEditing(undefined); await load() } catch (e) { setError(e instanceof Error ? e.message : 'Ошибка сохранения') } finally { setSaving(false) } }
  const remove = async (joke: Joke) => { if (!confirm(`Удалить анекдот «${joke.text.slice(0, 50)}…»? Обратно уже не пришутить.`)) return; try { await api.remove(joke.id); await load() } catch (e) { setError(e instanceof Error ? e.message : 'Ошибка удаления') } }
  const react = async (joke: Joke, reaction: 'LIKE' | 'DISLIKE') => { const updated = await api.react(joke.id, reaction); setJokes(items => items.map(j => j.id === updated.id ? updated : j)) }
  const nav = (next: Page) => { setPage(next); setError('') }
  return <div className="app">
    <header><button className="brand" onClick={() => nav('swipe')}><span><Laugh /></span><b>Смехдер</b><small>β</small></button><div className="header-actions"><nav><button className={page === 'swipe' ? 'active' : ''} onClick={() => nav('swipe')}><Flame/> Свайпы</button><button className={page === 'library' ? 'active' : ''} onClick={() => nav('library')}><BookOpen/> Анекдотека</button><button className={page === 'docs' ? 'active' : ''} onClick={() => nav('docs')}><Code2/> API</button></nav></div></header>
    <main>
      {error && <div className="toast"><span>{error}</span><button onClick={() => setError('')}>×</button></div>}
      {loading && page !== 'docs' ? <div className="loader"><RefreshCw/><span>Прогреваем шутки…</span></div> : <>
        {page === 'swipe' && <div className="swipe-page"><div className="hero"><span className="eyebrow">Алгоритм сомнительного юмора</span><h1>Свайпай.<br/><i>Не осуждай.</i></h1><p>Вправо — «ахах». Влево — «баян». Всё как в дейтинге, только никто не спросит твой рост.</p></div><SwipeDeck jokes={jokes} onReact={react}/></div>}
        {page === 'library' && <Library jokes={jokes} onAdd={() => setEditing(null)} onEdit={setEditing} onDelete={remove}/>} 
        {page === 'docs' && <section className="docs"><div className="section-head"><div><span className="eyebrow">Для тех, кто читает документацию</span><h1>Swagger API</h1></div></div><div className="swagger-wrap"><Suspense fallback={<div className="loader"><RefreshCw/><span>Загружаем Swagger…</span></div>}><SwaggerUI url={api.docsUrl}/></Suspense></div></section>}
      </>}
    </main>
    {editing !== undefined && <JokeForm joke={editing} saving={saving} onSave={save} onClose={() => setEditing(undefined)}/>} 
    <footer><span>Сделано на Java, React и шутках сомнительного качества</span><span>CRUD, но весело</span></footer>
  </div>
}
