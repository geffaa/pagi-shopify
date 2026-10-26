/**
 * Modifier rules shared by both Functions, the seed script and the preview (one source of truth).
 *
 * A dish's allowed add-ons are in its `pagi.modifiers` metafield, written by the seed script:
 *   { "groups": [{ "key": "add_protein", "min": 0, "max": 3, "addons": ["gid://shopify/ProductVariant/1", ...] }] }
 * The theme puts the chosen add-on variant IDs on the cart line as `_mods` (comma separated;
 * a repeated ID means two of it). Free choices such as "scrambled" are plain line properties.
 */

export function parseModifiers(metafield) {
  try {
    const groups = JSON.parse(metafield?.value ?? '{}').groups;
    return Array.isArray(groups) ? groups : [];
  } catch {
    return [];
  }
}

export function parseMods(attribute) {
  return String(attribute?.value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Checks chosen add-ons against the dish's groups. Each add-on must belong to a group, and no
 * group may hold more add-ons than its max. Returns { ok, counts } where counts maps variant
 * ID to quantity per dish.
 */
export function checkMods(mods, groups) {
  const counts = new Map();
  for (const id of mods) counts.set(id, (counts.get(id) ?? 0) + 1);
  if (!mods.length) return { ok: true, counts };
  const perGroup = new Map();
  for (const [id, n] of counts) {
    const group = groups.find((g) => g.addons?.includes(id));
    if (!group) return { ok: false, counts, reason: 'not_allowed' };
    perGroup.set(group.key, (perGroup.get(group.key) ?? 0) + n);
  }
  for (const g of groups) if ((perGroup.get(g.key) ?? 0) > (g.max ?? Infinity)) return { ok: false, counts, reason: 'too_many' };
  return { ok: true, counts };
}

/**
 * The dish's groups with add-ons resolved to variant IDs. Free choices stay labels (they become
 * visible line properties); add-ons carry a price and the variant the Cart Transform adds.
 */
export function modifiersFor(item, catalog, addonVariant) {
  const addons = Object.fromEntries(catalog.addons.map((a) => [a.handle, a]));
  return {
    groups: item.groups.map((key) => {
      const g = catalog.groups[key];
      const options = g.options.map((o) =>
        o.addon
          ? { label: addons[o.addon].title, label_id: addons[o.addon].title_id, price: addons[o.addon].price, variant: addonVariant[o.addon] }
          : { label: o.label, label_id: o.label_id, price: 0 }
      );
      return { key, title: g.title, title_id: g.title_id, min: g.min, max: g.max, options, addons: options.filter((o) => o.variant).map((o) => o.variant) };
    }),
  };
}
