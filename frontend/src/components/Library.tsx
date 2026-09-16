import { Edit3, HeartOff, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Joke } from '../types'

type Sort = 'newest' | 'rating' | 'controversial' | 'absurdity' | 'reactions'
type Props = { jokes: Joke[]; onAdd: () => void; onEdit: (joke: Joke) => void; onDelete: (joke: Joke) => void; onRemoveFavorite?: (joke: Joke) => void; favorites?: boolean }

export function Library({ jokes, onAdd, onEdit, onDelete, onRemoveFavorite, favorites = false }: Props) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('newest')
  const filtered = useMemo(() => jokes
    .filter(joke => `${joke.text} ${joke.category} ${joke.author}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'rating') return (b.likes - b.dislikes) - (a.likes - a.dislikes)
      if (sort === 'controversial') return Math.abs(a.likes - a.dislikes) - Math.abs(b.likes - b.dislikes)
      if (sort === 'absurdity') return b.absurdityLevel - a.absurdityLevel
      if (sort === 'reactions') return (b.likes + b.dislikes) - (a.likes + a.dislikes)
      return b.id - a.id
    }), [jokes, query, sort])
  return <section className="library">
    <div className="section-head"><div><span className="eyebrow">{favorites ? 'То, что попало прямо в чувство юмора' : 'Пульт управления смехом'}</span><h1>{favorites ? 'Мои ахахи' : 'Анекдотека'} <em>{jokes.length}</em></h1></div>{!favorites && <button className="btn primary" onClick={onAdd}><Plus size={19}/> Добавить анекдот</button>}</div>
    <div className="library-tools"><div className="search"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Искать по тексту, категории или автору" /></div><select value={sort} onChange={event => setSort(event.target.value as Sort)} aria-label="Сортировка"><option value="newest">Сначала новые</option><option value="rating">Лучшие</option><option value="controversial">Самые спорные</option><option value="absurdity">Самые абсурдные</option><option value="reactions">Больше реакций</option></select></div>
    {filtered.length === 0 ? <div className="empty"><h2>{jokes.length ? 'Ничего не нашлось' : favorites ? 'Ты пока ничему не поставил «Ахах»' : 'Здесь пока подозрительно тихо'}</h2><p>{jokes.length ? 'Попробуй другой запрос.' : favorites ? 'Свайпай вправо — понравившиеся шутки появятся здесь.' : 'Добавь первый анекдот и запусти маховик юмора.'}</p>{!jokes.length && !favorites && <button className="btn primary" onClick={onAdd}><Plus size={18}/> Добавить</button>}</div> :
    <div className="joke-list">{filtered.map(joke => <article className="list-card" key={joke.id}>
      <div className="list-content"><div className="tags"><span className="category">{joke.category}</span>{joke.adult && <span className="adult">18+</span>}<span className="date">{new Date(joke.publishedAt).toLocaleDateString('ru-RU')}</span></div><p>{joke.text}</p><div className="stats"><span>Автор: <b>{joke.author}</b></span><span>Абсурд: <b>{joke.absurdityLevel}/10</b></span><span>💚 {joke.likes}</span><span>🫠 {joke.dislikes}</span></div></div>
      {favorites ? <div className="row-actions"><button className="icon-btn danger" onClick={() => onRemoveFavorite?.(joke)} title="Убрать из моих ахахов"><HeartOff size={18}/></button></div> : <div className="row-actions"><button className="icon-btn" onClick={() => onEdit(joke)} title="Редактировать"><Edit3 size={18}/></button><button className="icon-btn danger" onClick={() => onDelete(joke)} title="Удалить"><Trash2 size={18}/></button></div>}
    </article>)}</div>}
  </section>
}
