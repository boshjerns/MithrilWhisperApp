import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We will mock supabase client module used in uploader
vi.mock('../auth/supabaseClient', () => {
  const user = { id: 'user-123' };
  return {
    supabase: {
      auth: {
        getUser: vi.fn(async () => ({ data: { user } })),
      },
      from: vi.fn(() => ({
        insert: vi.fn(async (_payload) => ({ error: null })),
      })),
    },
  };
});

// Mock localStorage for queue persistence
class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.get(k) ?? null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
  clear() { this.map.clear(); }
}

describe('usage uploader', () => {
  let origLocal;
  let flushed;

  beforeEach(async () => {
    origLocal = global.window?.localStorage;
    global.window = { ...(global.window || {}), localStorage: new MemoryStorage(), addEventListener: () => {} };
    flushed = await import('./uploader.js');
  });

  afterEach(() => {
    if (origLocal) global.window.localStorage = origLocal;
  });

  it('queues an event and flushes it when authenticated', async () => {
    const ev = {
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      duration_ms: 1234,
      transcript_chars_original: 10,
      transcript_chars_cleaned: 20,
      model: 'o4-mini',
      platform: 'win32',
      app_version: '1.0.0',
      metadata: { kind: 'assistant', action: 'summarize' },
    };
    await flushed.uploadUsageEvent(ev);

    // After flushQueue is called internally, the queue should be empty
    const raw = window.localStorage.getItem('queued_usage_events_v1');
    const arr = raw ? JSON.parse(raw) : [];
    expect(arr.length).toBe(0);
  });
});


