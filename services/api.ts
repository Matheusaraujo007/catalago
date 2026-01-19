
import { Product, Banner, Promotion, CacheData } from '../types';

const API_BASE = "https://catalago-ashen.vercel.app/api";
const CACHE_KEY = "mpx_premium_cache_v2";

export const getLocalCache = (): CacheData | null => {
  const data = localStorage.getItem(CACHE_KEY);
  return data ? JSON.parse(data) : null;
};

export const syncData = async (): Promise<Partial<CacheData>> => {
  try {
    const [p, b, pr] = await Promise.all([
      fetch(`${API_BASE}/produtos`).then(r => r.json()),
      fetch(`${API_BASE}/banner1`).then(r => r.json()),
      fetch(`${API_BASE}/promocoes`).then(r => r.json())
    ]);

    const freshData = { products: p, banners: b, promotions: pr, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
    return freshData;
  } catch (e) {
    console.error("Offline ou erro de rede", e);
    return {};
  }
};
