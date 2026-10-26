/**
 * Minimal Admin GraphQL client.
 *
 * - Auth: a static token, or the client credentials grant for Dev Dashboard
 *   apps installed on a store in the same organization (tokens last ~24h, so
 *   they are cached and refreshed shortly before expiry).
 * - Rate limits: Shopify's GraphQL API is cost-based. On THROTTLED errors (or
 *   HTTP 429) we wait exactly as long as the bucket needs to refill for the
 *   requested cost, then retry.
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class ShopifyError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ShopifyError';
    this.details = details;
  }
}

export function createAdminClient({ shop, apiVersion, token, clientId, clientSecret, fetchImpl = fetch, log = () => {} }) {
  if (!shop) throw new Error('SHOPIFY_SHOP is required');
  let cached = token ? { value: token, expiresAt: Infinity } : null;

  async function getToken() {
    if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.value;
    if (!clientId || !clientSecret) {
      throw new Error('Set SHOPIFY_ADMIN_TOKEN, or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET for the client credentials grant.');
    }
    const res = await fetchImpl(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
    });
    if (!res.ok) throw new ShopifyError(`Token request failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    cached = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 86_399) * 1000 };
    log(`token refreshed (scopes: ${data.scope})`);
    return cached.value;
  }

  async function graphql(query, variables = {}, { retries = 6 } = {}) {
    for (let attempt = 0; ; attempt++) {
      const res = await fetchImpl(`https://${shop}/admin/api/${apiVersion}/graphql.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': await getToken() },
        body: JSON.stringify({ query, variables }),
      });

      if (res.status === 429 || res.status >= 500) {
        if (attempt >= retries) throw new ShopifyError(`HTTP ${res.status} after ${retries} retries`);
        const retryAfter = Number(res.headers.get('retry-after')) || 2 ** attempt * 0.5;
        log(`HTTP ${res.status}, retrying in ${retryAfter}s`);
        await sleep(retryAfter * 1000);
        continue;
      }
      if (res.status === 401) {
        cached = token ? cached : null; // force refresh for client-credential tokens
        if (attempt >= 1 || token) throw new ShopifyError('Unauthorized — check token / scopes');
        continue;
      }

      const body = await res.json();
      const throttled = body.errors?.some((e) => e.extensions?.code === 'THROTTLED');
      if (throttled && attempt < retries) {
        const cost = body.extensions?.cost;
        const { currentlyAvailable = 0, restoreRate = 50 } = cost?.throttleStatus ?? {};
        const wait = Math.max(0.5, ((cost?.requestedQueryCost ?? 100) - currentlyAvailable) / restoreRate);
        log(`throttled, waiting ${wait.toFixed(1)}s`);
        await sleep(wait * 1000);
        continue;
      }
      if (body.errors?.length) throw new ShopifyError(body.errors.map((e) => e.message).join('; '), body.errors);
      return body.data;
    }
  }

  /** Throw if a mutation payload returned userErrors. */
  function assertNoUserErrors(payload, label) {
    const errors = payload?.userErrors ?? [];
    if (errors.length) {
      throw new ShopifyError(`${label}: ${errors.map((e) => `${e.field?.join('.') ?? ''} ${e.message}`.trim()).join('; ')}`, errors);
    }
    return payload;
  }

  /** Iterate every node of a connection. `select` returns the connection from the response. */
  async function* paginate(query, variables, select) {
    let after = null;
    do {
      const data = await graphql(query, { ...variables, after });
      const conn = select(data);
      if (!conn) return;
      yield* conn.nodes;
      after = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (after);
  }

  return { graphql, paginate, assertNoUserErrors, getToken, shop };
}

export const gid = (type, id) => (String(id).startsWith('gid://') ? String(id) : `gid://shopify/${type}/${id}`);
export const legacyId = (g) => String(g).split('/').pop();
