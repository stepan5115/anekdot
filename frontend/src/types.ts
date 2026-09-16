export interface Joke {
  id: number; text: string; category: string; author: string; publishedAt: string;
  absurdityLevel: number; adult: boolean; likes: number; dislikes: number; createdAt: string;
}
export type JokeInput = Pick<Joke, 'text' | 'category' | 'author' | 'publishedAt' | 'absurdityLevel' | 'adult'>
export interface ApiError { error: string; details: string[] }
export type Reaction = 'LIKE' | 'DISLIKE'
export interface SwipeAction { jokeId: number; reaction: Reaction }
