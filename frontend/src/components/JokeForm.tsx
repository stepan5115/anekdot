import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Joke, JokeInput } from '../types'

const empty: JokeInput = { text: '', category: 'IT', author: 'Народное', publishedAt: new Date().toISOString().slice(0, 10), absurdityLevel: 5, adult: false }

export function JokeForm({ joke, saving, onSave, onClose }: { joke: Joke | null; saving: boolean; onSave: (data: JokeInput) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<JokeInput>(empty)
  useEffect(() => setForm(joke ? { text: joke.text, category: joke.category, author: joke.author, publishedAt: joke.publishedAt, absurdityLevel: joke.absurdityLevel, adult: joke.adult } : empty), [joke])
  const submit = async (e: FormEvent) => { e.preventDefault(); await onSave(form) }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-head"><div><span className="eyebrow">Редактор юмора</span><h2>{joke ? 'Подкрутить анекдот' : 'Добавить анекдот'}</h2></div><button className="icon-btn" type="button" onClick={onClose} aria-label="Закрыть"><X /></button></div>
      <label className="field wide">Текст анекдота<textarea required maxLength={2000} rows={6} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Заходит как-то разработчик в продакшен…" /></label>
      <div className="form-grid">
        <label className="field">Категория<input required maxLength={50} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></label>
        <label className="field">Автор<input required maxLength={100} value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></label>
        <label className="field">Дата публикации<input required type="date" max={new Date().toISOString().slice(0, 10)} value={form.publishedAt} onChange={e => setForm({ ...form, publishedAt: e.target.value })} /></label>
        <label className="field">Уровень абсурда: <b>{form.absurdityLevel}/10</b><input type="range" min="1" max="10" value={form.absurdityLevel} onChange={e => setForm({ ...form, absurdityLevel: Number(e.target.value) })} /></label>
      </div>
      <label className="switch"><input type="checkbox" checked={form.adult} onChange={e => setForm({ ...form, adult: e.target.checked })} /><span />Только для взрослых</label>
      <div className="modal-actions"><button type="button" className="btn ghost" onClick={onClose}>Отмена</button><button className="btn primary" disabled={saving}>{saving ? 'Сохраняем…' : joke ? 'Сохранить' : 'Опубликовать'}</button></div>
    </form>
  </div>
}

