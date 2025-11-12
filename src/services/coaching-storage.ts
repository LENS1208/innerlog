import type { AIResponse } from './ai-coaching/types';

const STORAGE_KEY_PREFIX = 'coaching_cache_';

export function getCoachingCache(dataset: 'A' | 'B' | 'C'): AIResponse | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${dataset}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    return JSON.parse(cached) as AIResponse;
  } catch (error) {
    console.error('キャッシュ読み込みエラー:', error);
    return null;
  }
}

export function setCoachingCache(dataset: 'A' | 'B' | 'C', data: AIResponse): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${dataset}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('キャッシュ保存エラー:', error);
  }
}

export function clearCoachingCache(dataset?: 'A' | 'B' | 'C'): void {
  try {
    if (dataset) {
      const key = `${STORAGE_KEY_PREFIX}${dataset}`;
      localStorage.removeItem(key);
    } else {
      ['A', 'B', 'C'].forEach(ds => {
        const key = `${STORAGE_KEY_PREFIX}${ds}`;
        localStorage.removeItem(key);
      });
    }
  } catch (error) {
    console.error('キャッシュクリアエラー:', error);
  }
}

export function hasCoachingCache(dataset: 'A' | 'B' | 'C'): boolean {
  const key = `${STORAGE_KEY_PREFIX}${dataset}`;
  return localStorage.getItem(key) !== null;
}
