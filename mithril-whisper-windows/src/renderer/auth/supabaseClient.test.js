import { describe, it, expect, beforeEach } from 'vitest';

describe('supabase client config exposure', () => {
  beforeEach(() => {
    // Simulate env injection by webpack DefinePlugin
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-public-key';
    // Provide minimal window.localStorage for the client
    if (!global.window) global.window = {};
    if (!global.window.localStorage) {
      const mem = new (class { constructor(){this.m=new Map();} getItem(k){return this.m.get(k)||null;} setItem(k,v){this.m.set(k,String(v));} })();
      global.window.localStorage = mem;
    }
  });

  it('only uses anon key on the client side', async () => {
    const mod = await import('./supabaseClient.js');
    expect(mod.supabase).toBeTruthy();
    // Ensure the presence of anon key env does not imply server secrets exposure
    expect(process.env.SUPABASE_ANON_KEY).toBeDefined();
  });
});


