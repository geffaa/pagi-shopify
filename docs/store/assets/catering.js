/** Catering quote request: live estimate, field errors from the backend, a reference on success. */
const { formatMoney, strings, publish } = window.Pagi;

class CateringForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    const date = this.form.elements.date;
    const min = new Date(Date.now() + Number(this.dataset.minDays) * 86_400_000);
    date.min = min.toISOString().slice(0, 10);
    this.form.addEventListener('input', () => this.estimate());
    this.form.addEventListener('submit', (e) => this.submit(e));
    this.estimate();
  }

  estimate() {
    const pkg = this.form.querySelector('[name=package]:checked');
    const guests = Number(this.form.elements.guests.value) || 0;
    const out = this.querySelector('[data-estimate]');
    out.textContent = pkg && guests ? out.dataset.template.replace('{amount}', formatMoney(Number(pkg.dataset.per) * guests)) : '';
  }

  async submit(e) {
    e.preventDefault();
    const btn = this.form.querySelector('[type=submit]');
    const done = this.querySelector('[data-done]');
    this.querySelectorAll('[data-err]').forEach((el) => (el.textContent = ''));
    const body = Object.fromEntries(new FormData(this.form));
    body.guests = Number(body.guests);
    btn.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch(this.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && data.errors) {
        for (const [k, msg] of Object.entries(data.errors)) {
          const el = this.querySelector(`[data-err="${k}"]`);
          if (el) el.textContent = msg;
        }
        this.querySelector('[data-err]:not(:empty)')?.closest('.field')?.querySelector('input,textarea')?.focus();
        return;
      }
      if (!res.ok) throw new Error(data.error || strings.error);
      done.textContent = `${data.message} (${data.reference})`;
      done.hidden = false;
      this.form.querySelectorAll('input,textarea,button').forEach((el) => (el.disabled = true));
      publish('catering_requested', { guests: body.guests, package: body.package });
    } catch (err) {
      done.textContent = err.message;
      done.hidden = false;
    } finally {
      btn.removeAttribute('aria-busy');
    }
  }
}
customElements.define('catering-form', CateringForm);
