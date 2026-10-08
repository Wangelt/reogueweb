// Simulates a browser session hitting the live backend using the real client.ts code.
// Mocks `window` + `document.cookie` so client.ts takes its browser-side branch.

type CookieJar = Map<string, string>;
const jar: CookieJar = new Map();

function cookieString(): string {
  return Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

(globalThis as unknown as { window: object }).window = {};
Object.defineProperty(globalThis, 'document', {
  configurable: true,
  value: {
    get cookie() {
      return cookieString();
    },
    set cookie(value: string) {
      const [kv] = value.split(';');
      if (!kv) return;
      const eq = kv.indexOf('=');
      if (eq < 0) return;
      const key = kv.slice(0, eq).trim();
      const val = kv.slice(eq + 1).trim();
      // Max-Age=0 → delete
      if (/Max-Age=0/i.test(value)) {
        jar.delete(key);
      } else {
        jar.set(key, val);
      }
    },
  },
});

// Point client.ts at the live backend
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/api/v1';

async function main(): Promise<void> {
  // Import AFTER mocks are set up
  const { apiClient } = await import('../lib/api/client');
  const { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } = await import('../lib/auth/cookies');

  // Step 1 — log in via raw fetch (login would set cookies in the real app via providers.tsx)
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'wang@gmail.com', password: 'Admin@12345' }),
  });
  const loginBody = (await loginRes.json()) as {
    data: { tokens: { accessToken: string; refreshToken: string } };
  };
  const { accessToken, refreshToken } = loginBody.data.tokens;

  // Mimic what providers.tsx does after login
  (document as unknown as { cookie: string }).cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}; Path=/`;
  (document as unknown as { cookie: string }).cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(refreshToken)}; Path=/`;
  const initialAccess = jar.get(ACCESS_TOKEN_COOKIE);
  const initialRefresh = jar.get(REFRESH_TOKEN_COOKIE);
  console.log('[Setup] cookies written. access/refresh present:',
    Boolean(initialAccess), Boolean(initialRefresh));

  // Step 2 — call /users/me with the fresh access token (should succeed)
  console.log('\n[Step 2] GET /users/me with valid access token');
  try {
    const me = (await apiClient<{ email: string }>('/users/me')) as { email: string };
    console.log('  → 200 OK, email:', me.email);
  } catch (e) {
    console.log('  → FAIL:', (e as Error).message);
    process.exit(1);
  }

  // Step 3 — poison the access token (simulating expiry); keep refresh token valid
  (document as unknown as { cookie: string }).cookie = `${ACCESS_TOKEN_COOKIE}=not.a.real.token; Path=/`;
  console.log('\n[Step 3] GET /users/me with POISONED access token (refresh still valid)');
  console.log('  Expecting: 401 → attemptRefresh() → write new cookies → retry → 200');

  try {
    const me = (await apiClient<{ email: string }>('/users/me')) as { email: string };
    console.log('  → 200 OK, email:', me.email);
  } catch (e) {
    console.log('  → FAIL:', (e as Error).message);
    process.exit(1);
  }

  // Step 4 — confirm cookies were updated
  const newAccess = jar.get(ACCESS_TOKEN_COOKIE);
  const newRefresh = jar.get(REFRESH_TOKEN_COOKIE);
  console.log('\n[Step 4] cookie rotation check');
  console.log('  access changed from "not.a.real.token"?', newAccess !== 'not.a.real.token' ? 'YES' : 'NO');
  console.log('  refresh changed?', newRefresh !== initialRefresh ? 'YES' : 'NO');

  // Step 5 — concurrent 401s should share a single refresh call (dedup via refreshInFlight)
  // Poison access again, fire 3 calls in parallel.
  (document as unknown as { cookie: string }).cookie = `${ACCESS_TOKEN_COOKIE}=not.a.real.token; Path=/`;
  console.log('\n[Step 5] 3 concurrent 401s → should trigger ONE refresh (not 3, which would nuke the family)');
  const results = await Promise.allSettled([
    apiClient<{ email: string }>('/users/me'),
    apiClient<{ email: string }>('/users/me'),
    apiClient<{ email: string }>('/users/me'),
  ]);
  const ok = results.filter((r) => r.status === 'fulfilled').length;
  console.log('  → successes:', ok, '/ 3');
  if (ok !== 3) {
    console.log('  → one or more failed — family likely got revoked');
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.log(`    [${i}]`, (r.reason as Error).message);
    });
    process.exit(1);
  }

  // Step 6 — negative: no refresh cookie → 401 should propagate (no infinite loop)
  jar.delete(REFRESH_TOKEN_COOKIE);
  (document as unknown as { cookie: string }).cookie = `${ACCESS_TOKEN_COOKIE}=not.a.real.token; Path=/`;
  console.log('\n[Step 6] poison access, delete refresh → should throw 401 (no refresh possible)');
  try {
    await apiClient('/users/me');
    console.log('  → unexpected success');
    process.exit(1);
  } catch (e) {
    const err = e as { status?: number; message: string };
    console.log('  → threw:', err.status ?? '?', err.message);
    if (err.status !== 401) process.exit(1);
  }

  console.log('\n✓ All refresh-flow checks passed.');
}

void main();
