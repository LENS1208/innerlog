import type { AIResponse } from './ai-coaching/types';

const STORAGE_KEY_PREFIX = 'coaching_cache_v2_';
const CACHE_VERSION = 2;
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface CachedData {
  version: number;
  timestamp: number;
  jobId?: string;
  data: AIResponse;
}

export function getCoachingCache(dataset: 'A' | 'B' | 'C', dbJobId?: string): AIResponse | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${dataset}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed: CachedData = JSON.parse(cached);

    if (parsed.version !== CACHE_VERSION) {
      console.warn('⚠️ キャッシュバージョンが古いため削除します');
      localStorage.removeItem(key);
      return null;
    }

    const age = Date.now() - parsed.timestamp;
    if (age > CACHE_MAX_AGE_MS) {
      console.warn('⚠️ キャッシュが古すぎるため削除します（24時間以上経過）');
      localStorage.removeItem(key);
      return null;
    }

    if (dbJobId && parsed.jobId && parsed.jobId !== dbJobId) {
      console.warn('⚠️ データベースのジョブIDと一致しないため、キャッシュは無効です');
      return null;
    }

    console.log('💾 有効なキャッシュを取得しました', {
      age: Math.floor(age / 1000 / 60),
      jobId: parsed.jobId,
    });
    return parsed.data;
  } catch (error) {
    console.error('キャッシュ読み込みエラー:', error);
    return null;
  }
}

export function setCoachingCache(dataset: 'A' | 'B' | 'C', data: AIResponse, jobId?: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${dataset}`;
    const cachedData: CachedData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      jobId,
      data,
    };
    localStorage.setItem(key, JSON.stringify(cachedData));
    console.log('💾 キャッシュを保存しました', { jobId });
  } catch (error) {
    console.error('キャッシュ保存エラー:', error);
  }
}

export function clearCoachingCache(dataset?: 'A' | 'B' | 'C'): void {
  try {
    if (dataset) {
      const key = `${STORAGE_KEY_PREFIX}${dataset}`;
      localStorage.removeItem(key);
      console.log('💾 キャッシュをクリアしました:', dataset);
    } else {
      ['A', 'B', 'C'].forEach(ds => {
        const key = `${STORAGE_KEY_PREFIX}${ds}`;
        localStorage.removeItem(key);
      });
      console.log('💾 全キャッシュをクリアしました');
    }
  } catch (error) {
    console.error('キャッシュクリアエラー:', error);
  }
}

export function hasCoachingCache(dataset: 'A' | 'B' | 'C'): boolean {
  const cached = getCoachingCache(dataset);
  return cached !== null;
}

export function clearOldCaches(): void {
  try {
    const oldPrefix = 'coaching_cache_';
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(oldPrefix) && !key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
        console.log('🧹 古いキャッシュを削除しました:', key);
      }
    });
  } catch (error) {
    console.error('古いキャッシュクリアエラー:', error);
  }
}
