/**
 * Tiny in-process job queue with retries and exponential backoff + jitter.
 *
 * Shopify expects a webhook response within 5 seconds and retries on
 * timeouts, so handlers acknowledge immediately and do the work here. For
 * multi-instance deployments swap this for a durable queue (SQS, Cloudflare
 * Queues, BullMQ); the handler signatures don't change.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function createQueue({ concurrency = 2, retries = 4, baseDelayMs = 500, log = console } = {}) {
  const pending = [];
  let active = 0;
  let idleResolvers = [];

  async function run(job) {
    for (let attempt = 0; ; attempt++) {
      try {
        await job.fn();
        job.onDone?.();
        return;
      } catch (error) {
        if (attempt >= retries) {
          log.error(`[queue] ${job.name} failed permanently: ${error.message}`);
          job.onFail?.(error);
          return;
        }
        const delay = baseDelayMs * 2 ** attempt * (0.75 + Math.random() * 0.5);
        log.warn(`[queue] ${job.name} attempt ${attempt + 1} failed (${error.message}); retrying in ${Math.round(delay)}ms`);
        await sleep(delay);
      }
    }
  }

  function drain() {
    while (active < concurrency && pending.length) {
      const job = pending.shift();
      active++;
      run(job).finally(() => {
        active--;
        drain();
        if (!active && !pending.length) {
          idleResolvers.forEach((r) => r());
          idleResolvers = [];
        }
      });
    }
  }

  return {
    push(name, fn, hooks = {}) {
      pending.push({ name, fn, ...hooks });
      drain();
    },
    /** Resolves when all queued work has finished (used by tests and graceful shutdown). */
    idle() {
      if (!active && !pending.length) return Promise.resolve();
      return new Promise((r) => idleResolvers.push(r));
    },
    get size() {
      return pending.length + active;
    },
  };
}
