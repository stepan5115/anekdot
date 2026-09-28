import type { Joke, SwipeAction } from './types'

export type HumorProfile = {
  title: string
  verdict: string
  favoriteCategory: string
  approval: number
  absurdity: number
  stuffiness: number
  humorAge: number
}

export function buildHumorProfile(jokes: Joke[], actions: SwipeAction[]): HumorProfile {
  const liked = actions.filter(action => action.reaction === 'LIKE')
    .map(action => jokes.find(joke => joke.id === action.jokeId)).filter((joke): joke is Joke => Boolean(joke))
  const counts = liked.reduce<Record<string, number>>((all, joke) => ({ ...all, [joke.category]: (all[joke.category] || 0) + 1 }), {})
  const favoriteCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Неопознанное'
  const approval = actions.length ? Math.round(liked.length / actions.length * 100) : 0
  const absurdity = liked.length ? Number((liked.reduce((sum, joke) => sum + joke.absurdityLevel, 0) / liked.length).toFixed(1)) : 0
  const titles: Record<string, string> = { IT: 'Сеньор смехотехнических наук', Коты: 'Лицензированный котосмешитель', Работа: 'Корпоративный шаман', Еда: 'Гастрокомик', Абсурд: 'Квантовый хохотун', Отношения: 'Романтический дебаггер', Учёба: 'Академик переменного хихиканья' }
  const title = approval < 30 ? 'Главный редактор журнала «Не смешно»' : approval > 80 ? 'Золотой человек, кошмар стендаперов' : absurdity >= 8 ? 'Квантовый хохотун' : titles[favoriteCategory] || 'Юморист широкого профиля'
  return { title, favoriteCategory, approval, absurdity, stuffiness: 100 - approval, humorAge: Math.max(7, Math.min(99, Math.round(18 + absurdity * 4 - approval / 12))), verdict: approval > 60 ? 'Смеётся чаще, чем осуждает. Социально безопасен.' : 'Шутки проходят строгий контроль качества. Комики нервничают.' }
}

export function seededJokes(jokes: Joke[], seedText: string, count: number) {
  let seed = [...seedText].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 2166136261)
  const pool = [...jokes]
  const result: Joke[] = []
  while (pool.length && result.length < count) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    result.push(pool.splice(seed % pool.length, 1)[0])
  }
  return result
}

export function explainJoke(joke: Joke) {
  const subjects: Record<string, string> = {
    IT: 'конфликтом между технической и социальной реальностью', Коты: 'участием домашнего агента хаоса',
    Работа: 'нарушением корпоративного протокола', Отношения: 'ошибкой романтической бизнес-логики',
    Еда: 'неожиданной кулинарной причинностью', Учёба: 'академической несостоятельностью происходящего'
  }
  return `Комический эффект предположительно достигается ${subjects[joke.category] || 'несовпадением ожидания и действительности'}. Уровень логической деформации — ${joke.absurdityLevel}/10. После данного объяснения шутка официально считается уничтоженной.`
}

function words(text: string) {
  return new Set(text.toLowerCase().replace(/[^а-яёa-z0-9 ]/gi, ' ').split(/\s+/).filter(word => word.length > 2))
}

export function findSimilar(text: string, jokes: Joke[], ignoredId?: number) {
  const source = words(text)
  if (source.size < 3) return null
  return jokes.filter(joke => joke.id !== ignoredId).map(joke => {
    const target = words(joke.text)
    const common = [...source].filter(word => target.has(word)).length
    return { joke, score: common / new Set([...source, ...target]).size }
  }).sort((a, b) => b.score - a.score)[0] || null
}

export function corporateReport(jokes: Joke[]) {
  const reactions = jokes.reduce((sum, joke) => sum + joke.likes + joke.dislikes, 0)
  return { entities: jokes.length, synergy: Math.min(99, 42 + reactions % 57), risk: jokes.filter(joke => joke.absurdityLevel > 7).length, kpi: 70 + jokes.length % 29 }
}
