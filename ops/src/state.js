import { availability, earliest, localNow, slotState } from '../../lib/slots.js';

const SHOP_ID = `query { shop { id } }`;
const SET = `
  mutation SetSlotState($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) { userErrors { field message } }
  }`;

/**
 * Publishes the slot state to the shop metafield the checkout Function reads.
 * Runs after every order change and on a timer (slots close as time passes). Writes only when
 * the state changed, and one write at a time.
 */
export function createSlotSync({ db, admin, config, now = () => localNow(config.timeZone), log = console }) {
  let shopId = null;
  let last = null;
  let running = Promise.resolve();

  const current = () => {
    const at = now();
    return { at, used: db.usedFrom(at.slice(0, 10)), paused: db.paused() };
  };

  async function publish() {
    const { at, used, paused } = current();
    const state = slotState({ now: at, used, paused, cfg: config.slots });
    const value = JSON.stringify(state);
    if (value === last || !admin) return false;
    shopId ??= (await admin.graphql(SHOP_ID)).shop.id;
    const data = await admin.graphql(SET, {
      metafields: [{ ownerId: shopId, namespace: 'pagi', key: 'slot_state', type: 'json', value }],
    });
    admin.assertNoUserErrors(data.metafieldsSet, 'metafieldsSet');
    last = value;
    log.info?.(`[slots] published: ${state.closed.length} closed, ${Object.keys(state.used).length} in use`);
    return true;
  }

  return {
    /** Serialised so two webhooks can't race each other's writes. */
    sync() {
      running = running.then(publish, publish);
      return running;
    },
    /** For the storefront picker: same numbers, friendlier shape. */
    availability() {
      const { at, used, paused } = current();
      return { now: at, earliest: earliest(at, config.slots), days: availability({ now: at, used, paused, cfg: config.slots }) };
    },
  };
}
