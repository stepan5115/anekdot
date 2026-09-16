import { Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Joke } from '../types'

export function Library({ jokes, onAdd, onEdit, onDelete }: { jokes: Joke[]; onAdd: () => void; onEdit: (joke: Joke) => void; onDelete: (joke: Joke) => void }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => jokes.filter(j => `${j.text} ${j.category} ${j.author}`.toLowerCase().includes(query.toLowerCase())), [jokes, query])
  return <section className="library">
    <div className="section-head"><div><span className="eyebrow">Пульт управления смехом</span><h1>Анекдотека <em>{jokes.length}</em></h1></div><button className="btn primary" onClick={onAdd}><Plus size={19}/> Добавить анекдот</button></div>
    <div className="search"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Искать по тексту, категории или автору" /></div>
    {filtered.length === 0 ? <div className="empty"><h2>{jokes.length ? 'Ничего не нашлось' : 'Здесь пока подозрительно тихо'}</h2><p>{jokes.length ? 'Попробуй другой запрос.' : 'Добавь первый анекдот и запусти маховик юмора.'}</p>{!jokes.length && <button className="btn primary" onClick={onAdd}><Plus size={18}/> Добавить</button>}</div> :
    <div className="joke-list">{filtered.map(joke => <article className="list-card" key={joke.id}>
      <div className="list-content"><div className="tags"><span className="category">{joke.category}</span>{joke.adult && <span className="adult">18+</span>}<span className="date">{new Date(joke.publishedAt).toLocaleDateString('ru-RU')}</span></div><p>{joke.text}</p><div className="stats"><span>Автор: <b>{joke.author}</b></span><span>Абсурд: <b>{joke.absurdityLevel}/10</b></span><span>💚 {joke.likes}</span><span>🫠 {joke.dislikes}</span></div></div>
      <div className="row-actions"><button className="icon-btn" onClick={() => onEdit(joke)} title="Редактировать"><Edit3 size={18}/></button><button className="icon-btn danger" onClick={() => onDelete(joke)} title="Удалить"><Trash2 size={18}/></button></div>
    </article>)}</div>}
  </section>
}

