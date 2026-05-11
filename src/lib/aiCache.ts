/**
 * Dual-layer caching system for AI-generated presentations
 * - Browser cache (IndexedDB) for offline access
 * - Server metadata in Supabase for cache coordination
 */

import type { Presentation } from '@/types/presentation';

export interface CacheMetadata {
  key: string;
  promptHash: string;
  createdAt: number;
  expiresAt: number;
  size: number; // bytes
  hits: number;
}

class AICache {
  private dbName = 'NanoBanana_Cache';
  private storeName = 'presentations';
  private metadataStoreName = 'cache_metadata';
  private db: IDBDatabase | null = null;
  private readonly CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('promptHash', 'promptHash', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.metadataStoreName)) {
          db.createObjectStore(this.metadataStoreName, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Generate cache key from prompt hash
   */
  static getCacheKey(promptHash: string): string {
    return `cache_${promptHash}`;
  }

  /**
   * Get cached presentation
   */
  async get(promptHash: string): Promise<{ presentation: Presentation; metadata: CacheMetadata } | null> {
    await this.init();
    
    if (!this.db) return null;

    const key = AICache.getCacheKey(promptHash);

    return new Promise((resolve) => {
      const tx = this.db!.transaction([this.storeName, this.metadataStoreName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const metaStore = tx.objectStore(this.metadataStoreName);

      const cacheRequest = store.get(key);
      const metaRequest = metaStore.get(key);

      tx.oncomplete = () => {
        const cached = cacheRequest.result;
        const metadata = metaRequest.result as CacheMetadata | undefined;

        // Check if expired
        if (!cached || !metadata || metadata.expiresAt < Date.now()) {
          if (cached) {
            this.delete(promptHash).catch(console.error);
          }
          resolve(null);
          return;
        }

        // Increment hit count
        metadata.hits++;
        const updateTx = this.db!.transaction(this.metadataStoreName, 'readwrite');
        updateTx.objectStore(this.metadataStoreName).put(metadata);

        resolve({ presentation: cached, metadata });
      };

      tx.onerror = () => resolve(null);
    });
  }

  /**
   * Cache a presentation
   */
  async set(promptHash: string, presentation: Presentation): Promise<void> {
    await this.init();

    if (!this.db) return;

    const key = AICache.getCacheKey(promptHash);
    const metadata: CacheMetadata = {
      key,
      promptHash,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.CACHE_TTL_MS,
      size: JSON.stringify(presentation).length,
      hits: 0,
    };

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName, this.metadataStoreName], 'readwrite');

      tx.objectStore(this.storeName).put({ key, ...presentation });
      tx.objectStore(this.metadataStoreName).put(metadata);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Delete cached presentation
   */
  async delete(promptHash: string): Promise<void> {
    await this.init();

    if (!this.db) return;

    const key = AICache.getCacheKey(promptHash);

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName, this.metadataStoreName], 'readwrite');

      tx.objectStore(this.storeName).delete(key);
      tx.objectStore(this.metadataStoreName).delete(key);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    await this.init();

    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName, this.metadataStoreName], 'readwrite');

      tx.objectStore(this.storeName).clear();
      tx.objectStore(this.metadataStoreName).clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    oldestEntry: number;
    mostRecentEntry: number;
  }> {
    await this.init();

    if (!this.db) {
      return { totalEntries: 0, totalSize: 0, oldestEntry: 0, mostRecentEntry: 0 };
    }

    return new Promise((resolve) => {
      const tx = this.db!.transaction(this.metadataStoreName, 'readonly');
      const store = tx.objectStore(this.metadataStoreName);
      const allRequest = store.getAll();

      tx.oncomplete = () => {
        const entries = allRequest.result as CacheMetadata[];
        const totalSize = entries.reduce((sum, e) => sum + e.size, 0);
        const createdDates = entries.map(e => e.createdAt).sort((a, b) => a - b);

        resolve({
          totalEntries: entries.length,
          totalSize,
          oldestEntry: createdDates[0] || 0,
          mostRecentEntry: createdDates[createdDates.length - 1] || 0,
        });
      };

      tx.onerror = () => {
        resolve({ totalEntries: 0, totalSize: 0, oldestEntry: 0, mostRecentEntry: 0 });
      };
    });
  }
}

// Singleton instance
export const aiCache = new AICache();
