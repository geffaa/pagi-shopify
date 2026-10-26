/**
 * Menu add-ons as one priced line.
 *
 * Shopify can't add a price to a line property, so "Avo Smash + bacon + extra egg" is built as a
 * bundle: the dish's line is expanded into the dish itself plus one component per add-on. Each
 * component keeps its own variant price, so the line costs the dish plus its add-ons, and the
 * add-ons' inventory is tracked (the kitchen runs out of salmon, not of "salmon option").
 *
 * Prices are never read from the cart: add-ons are variant IDs, checked against the dish's own
 * metafield; anything not allowed leaves the line untouched (and the pickup-slot validation
 * blocks checkout with a message).
 */
import { checkMods, parseMods, parseModifiers } from '../../../lib/modifiers.js';

export function cartTransformRun(input) {
  const operations = [];
  for (const line of input.cart.lines) {
    const variant = line.merchandise;
    if (variant?.__typename !== 'ProductVariant') continue;
    const mods = parseMods(line.mods);
    if (!mods.length) continue;
    const { ok, counts } = checkMods(mods, parseModifiers(variant.product?.modifiers));
    if (!ok) continue;
    operations.push({
      lineExpand: {
        cartLineId: line.id,
        // Quantities are per unit of the parent line: two Avo Smashes with bacon expand to
        // two dishes and two bacons.
        expandedCartItems: [
          { merchandiseId: variant.id, quantity: 1 },
          ...[...counts].map(([merchandiseId, quantity]) => ({ merchandiseId, quantity })),
        ],
      },
    });
  }
  return { operations };
}
