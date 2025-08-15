import { supabase } from '../auth/supabaseClient';

const STORE_KEY = 'queued_usage_events_v1';

function loadQueue() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(queue));
  } catch {}
}

export async function uploadUsageEvent(event) {
  const queue = loadQueue();
  queue.push(event);
  saveQueue(queue);
  await flushQueue();
}

export async function flushQueue() {
  let queue = loadQueue();
  if (!queue.length) return;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    console.warn('Usage uploader: not signed in, queue remains at', queue.length);
    return; // wait until signed in
  }
  console.log('Usage uploader: flushing', queue.length, 'events for user', auth.user.id);

  const next = [];
  for (const ev of queue) {
    try {
      const payload = {
        user_id: auth.user.id,
        started_at: ev.started_at,
        ended_at: ev.ended_at,
        duration_ms: ev.duration_ms,
        transcript_chars_original: ev.transcript_chars_original ?? 0,
        transcript_chars_cleaned: ev.transcript_chars_cleaned ?? 0,
        model: ev.model || null,
        platform: ev.platform || null,
        app_version: ev.app_version || null,
        metadata: ev.metadata || null,
      };
      const { error } = await supabase.from('usage_sessions').insert(payload);
      if (error) throw error;
      // Light success log to confirm insert
      // eslint-disable-next-line no-console
      console.log('Usage session inserted', { duration_ms: payload.duration_ms, ts: payload.started_at });
    } catch (e) {
      console.error('Usage upload failed:', e?.message || e, { ev });
      next.push(ev);
    }
  }
  saveQueue(next);
  if (next.length === 0) {
    console.log('Usage uploader: queue cleared');
  } else {
    console.warn('Usage uploader: remaining queued events', next.length);
  }
}

// Auto-flush on online
window.addEventListener('online', () => {
  flushQueue();
});


