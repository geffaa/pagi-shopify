/**
 * The dish builder. Enforces each group's min/max as the customer taps, shows the running
 * total, and adds the dish with:
 *   properties[<Group>]  the chosen labels, for the kitchen ticket and the receipt
 *   properties[_mods]    paid add-on variant IDs; the Cart Transform prices them, and the
 *                        checkout Validation rejects any the dish doesn't offer
 */
const { addToCart, formatMoney, strings } = window.Pagi;

class DishForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.groups = [...this.querySelectorAll('[data-group]')];
    this.qty = this.querySelector('[name=quantity]');
    this.addEventListener('change', () => this.update());
    this.querySelector('[data-qty-wrap]').addEventListener('click', (e) => {
      const step = e.target.closest('[data-step]');
      if (!step) return;
      this.qty.value = Math.min(20, Math.max(1, Number(this.qty.value) + Number(step.dataset.step)));
      this.update();
    });
    this.form.addEventListener('submit', (e) => this.submit(e));
    this.update();
  }

  chosen(group) {
    return [...group.querySelectorAll('input:checked')];
  }

  update() {
    let unit = Number(this.dataset.base);
    for (const g of this.groups) {
      const picked = this.chosen(g);
      const max = Number(g.dataset.max);
      // At the limit, the rest of a multi-choice group is disabled rather than silently swapped.
      if (max > 1) g.querySelectorAll('input[type=checkbox]').forEach((i) => (i.disabled = !i.checked && picked.length >= max));
      unit += picked.reduce((s, i) => s + Number(i.dataset.price || 0), 0);
    }
    this.querySelector('[data-total]').textContent = formatMoney(unit * Math.max(1, Number(this.qty.value) || 1));
  }

  problem() {
    for (const g of this.groups) {
      const n = this.chosen(g).length;
      const min = Number(g.dataset.min);
      const max = Number(g.dataset.max);
      if (n < min) return { g, message: strings.need.replace('{n}', min).replace('{group}', g.dataset.label) };
      if (n > max) return { g, message: strings.tooMany.replace('{n}', max).replace('{group}', g.dataset.label) };
    }
    return null;
  }

  async submit(e) {
    e.preventDefault();
    const error = this.querySelector('[data-error]');
    const btn = this.form.querySelector('[type=submit]');
    const bad = this.problem();
    this.groups.forEach((g) => g.classList.remove('group--error'));
    if (bad) {
      bad.g.classList.add('group--error');
      bad.g.scrollIntoView({ behavior: 'smooth', block: 'center' });
      error.textContent = bad.message;
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const data = new FormData();
    data.append('id', this.form.querySelector('[name=id]').value);
    data.append('quantity', String(Math.max(1, Number(this.qty.value) || 1)));
    const mods = [];
    for (const g of this.groups) {
      const picked = this.chosen(g);
      if (picked.length) data.append(`properties[${g.dataset.name}]`, picked.map((i) => i.value).join(', '));
      for (const i of picked) if (i.dataset.variant) mods.push(i.dataset.variant);
    }
    if (mods.length) data.append('properties[_mods]', mods.join(','));
    const note = this.form.querySelector('[name="properties[Note]"]').value.trim();
    if (note) data.append('properties[Note]', note);
    btn.setAttribute('aria-busy', 'true');
    try {
      await addToCart(data);
      window.Pagi.publish('dish_added', { mods: mods.length });
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
    } finally {
      btn.removeAttribute('aria-busy');
    }
  }
}
customElements.define('dish-form', DishForm);
