import { FormEvent, useState } from 'react'
import { KeyRound, LogIn } from 'lucide-react'
import { api, authToken } from '../api'

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [login, setLogin] = useState(''), [password, setPassword] = useState('')
  const [error, setError] = useState(''), [loading, setLoading] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try { const result = await api.login(login, password); authToken.set(result.token); onSuccess() }
    catch (e) { setError(e instanceof Error ? e.message : 'Не удалось войти') }
    finally { setLoading(false) }
  }
  return <section className="admin-login"><form onSubmit={submit}>
    <div className="login-icon"><KeyRound/></div><span className="eyebrow">Только для распорядителя шуток</span>
    <h1>Вход в анекдотеку</h1><p>Создавать, редактировать и удалять анекдоты может только администратор.</p>
    {error && <div className="login-error">{error}</div>}
    <label className="field">Логин<input autoComplete="username" required value={login} onChange={e => setLogin(e.target.value)}/></label>
    <label className="field">Пароль<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)}/></label>
    <button className="btn primary" disabled={loading}><LogIn size={18}/>{loading ? 'Проверяем…' : 'Войти'}</button>
  </form></section>
}
