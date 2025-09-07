// Local mode - usage tracking disabled for privacy
// These functions are no-ops to maintain compatibility with existing code

export async function uploadUsageEvent(event) {
  // No-op in local mode - usage tracking disabled for privacy
  console.log('Local mode: Usage tracking disabled, event discarded');
}

export async function flushQueue() {
  // No-op in local mode - no usage data to flush
}


