var L={"/repo/theme/config/settings_data.json":`{
  "current": "Default",
  "presets": {
    "Default": {
      "wordmark": "pagi",
      "color_paper": "#FFF8EE",
      "color_ink": "#2A1E16",
      "color_muted": "#6F5E50",
      "color_line": "#EADBC8",
      "color_yolk": "#F2A93B",
      "color_leaf": "#5F7F45",
      "timezone": "Asia/Makassar",
      "hours_open": "08:00",
      "hours_close": "16:00",
      "kitchen_close": "15:30",
      "slots_endpoint": "/apps/pagi/slots",
      "delivery_note": "Within 5 km of Pererenan. The delivery fee is added at checkout from your address.",
      "tax_note": "Prices include 10% PB1 tax. No service charge.",
      "address": "Jl. Pantai Pererenan No. 8, Pererenan, Bali",
      "whatsapp": "6281200000000",
      "maps_url": "https://maps.google.com/?q=Pererenan+Bali",
      "instagram": "pagi.bali"
    }
  }
}
`,"/repo/theme/config/settings_schema.json":`[
  {
    "name": "theme_info",
    "theme_name": "Pagi",
    "theme_version": "1.0.0",
    "theme_author": "Yodhimas Geffananda",
    "theme_documentation_url": "https://github.com/geffaa/pagi-shopify",
    "theme_support_url": "https://github.com/geffaa/pagi-shopify"
  },
  {
    "name": "Brand",
    "settings": [
      { "type": "text", "id": "wordmark", "label": "Wordmark", "default": "pagi" },
      { "type": "image_picker", "id": "favicon", "label": "Favicon" }
    ]
  },
  {
    "name": "Colors",
    "settings": [
      { "type": "color", "id": "color_paper", "label": "Paper", "default": "#FFF8EE" },
      { "type": "color", "id": "color_ink", "label": "Ink", "default": "#2A1E16" },
      { "type": "color", "id": "color_muted", "label": "Muted text", "default": "#6F5E50" },
      { "type": "color", "id": "color_line", "label": "Lines", "default": "#EADBC8" },
      { "type": "color", "id": "color_yolk", "label": "Accent", "default": "#F2A93B" },
      { "type": "color", "id": "color_leaf", "label": "Plant-based badge", "default": "#5F7F45" }
    ]
  },
  {
    "name": "Ordering",
    "settings": [
      {
        "type": "paragraph",
        "content": "Shown to customers only. Checkout enforces the real hours and capacity through the pickup-slot validation, configured in Shopify admin."
      },
      { "type": "text", "id": "timezone", "label": "Shop time zone (IANA)", "default": "Asia/Makassar" },
      { "type": "text", "id": "hours_open", "label": "Opens", "default": "08:00" },
      { "type": "text", "id": "hours_close", "label": "Closes", "default": "16:00" },
      { "type": "text", "id": "kitchen_close", "label": "Last food orders", "default": "15:30" },
      { "type": "text", "id": "slots_endpoint", "label": "Slots endpoint (app proxy)", "default": "/apps/pagi/slots" },
      { "type": "text", "id": "delivery_note", "label": "Delivery note", "default": "Within 5 km of Pererenan. The delivery fee is added at checkout from your address." },
      { "type": "text", "id": "tax_note", "label": "Tax note", "default": "Prices include 10% PB1 tax. No service charge." }
    ]
  },
  {
    "name": "Contact",
    "settings": [
      { "type": "text", "id": "address", "label": "Address", "default": "Jl. Pantai Pererenan No. 8, Pererenan, Bali" },
      { "type": "text", "id": "whatsapp", "label": "WhatsApp number (international, digits only)", "default": "6281200000000" },
      { "type": "url", "id": "maps_url", "label": "Directions link" },
      { "type": "text", "id": "instagram", "label": "Instagram handle", "default": "pagi.bali" }
    ]
  }
]
`,"/repo/theme/layout/theme.liquid":`<!doctype html>
<html lang="{{ request.locale.iso_code }}" class="no-js">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="{{ settings.color_paper }}">
    <link rel="canonical" href="{{ canonical_url }}">
    {{ 'fraunces-soft.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}
    {%- if settings.favicon != blank -%}
      <link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 64, height: 64 }}">
    {%- endif -%}
    <title>
      {{- page_title -}}
      {%- unless page_title contains shop.name %} | {{ shop.name }}{% endunless -%}
    </title>
    {%- if page_description -%}
      <meta name="description" content="{{ page_description | escape }}">
    {%- endif -%}
    {%- render 'meta-tags' -%}
    {%- render 'theme-tokens' -%}
    {{ 'base.css' | asset_url | stylesheet_tag }}
    <script>document.documentElement.className = document.documentElement.className.replace('no-js', 'js');<\/script>
    <script type="application/json" id="theme-config">
      {
        "routes": {
          "root": {{ routes.root_url | json }},
          "cart": {{ routes.cart_url | json }},
          "cartAdd": {{ routes.cart_add_url | json }},
          "cartChange": {{ routes.cart_change_url | json }},
          "cartUpdate": {{ routes.cart_update_url | json }}
        },
        "locale": {{ request.locale.iso_code | json }},
        "moneySample": {{ 12345600 | money | strip_html | json }},
        "shop": {
          "timeZone": {{ settings.timezone | json }},
          "open": {{ settings.hours_open | json }},
          "close": {{ settings.hours_close | json }},
          "kitchenClose": {{ settings.kitchen_close | json }},
          "slots": {{ settings.slots_endpoint | json }}
        },
        "strings": {
          "error": {{ 'general.error' | t | json }},
          "added": {{ 'cart.added' | t | json }},
          "statusOpen": {{ 'header.status_open' | t: time: settings.kitchen_close | json }},
          "statusSoon": {{ 'header.status_soon' | t: time: settings.hours_open | json }},
          "statusClosed": {{ 'header.status_closed' | t | json }},
          "today": {{ 'cart.today' | t | json }},
          "tomorrow": {{ 'cart.tomorrow' | t | json }},
          "leftOne": {{ 'cart.left' | t: count: 1 | json }},
          "leftOther": {{ 'cart.left' | t: count: '{n}' | json }},
          "full": {{ 'cart.full' | t | json }},
          "noSlots": {{ 'cart.no_slots' | t | json }},
          "slotsError": {{ 'cart.slots_error' | t | json }},
          "retry": {{ 'cart.retry' | t | json }},
          "slotGone": {{ 'cart.slot_gone' | t | json }},
          "readyAt": {{ 'cart.ready_at' | t: time: '{time}' | json }},
          "need": {{ 'dish.need' | t: count: '{n}', group: '{group}' | json }},
          "tooMany": {{ 'dish.too_many' | t: count: '{n}', group: '{group}' | json }}
        }
      }
    <\/script>
    <script src="{{ 'global.js' | asset_url }}" type="module"><\/script>
    {{ content_for_header }}
  </head>
  <body class="template-{{ template.name | handle }}">
    <a class="skip-link" href="#main">{{ 'general.skip' | t }}</a>
    {% sections 'header-group' %}
    <main id="main" tabindex="-1">
      {{ content_for_layout }}
    </main>
    {% sections 'footer-group' %}
    {% section 'cart-drawer' %}
    <div class="toast" role="status" aria-live="polite" data-toast hidden></div>
  </body>
</html>
`,"/repo/theme/locales/en.default.json":`{
  "general": {
    "close": "Close",
    "error": "Something went wrong. Please try again.",
    "skip": "Skip to content",
    "language": "Language",
    "view_all": "View all"
  },
  "header": {
    "menu": "Menu",
    "cart": {
      "one": "Order, {{ count }} item",
      "other": "Order, {{ count }} items"
    },
    "order_now": "Order now",
    "status_open": "Kitchen open \xB7 last orders {{ time }}",
    "status_soon": "Opens at {{ time }}",
    "status_closed": "Closed now \xB7 order ahead for tomorrow"
  },
  "home": {
    "how_title": "Skip the queue",
    "menu_title": "The menu",
    "menu_lead": "Everything is cooked to order. Choose your eggs, your bread and what goes on top."
  },
  "dish": {
    "add": "Add",
    "add_to_order": "Add to order",
    "choose": "Choose",
    "required": "Required",
    "optional": "Optional",
    "choose_one": "Choose 1",
    "choose_exactly": "Choose {{ count }}",
    "up_to": "Up to {{ count }}",
    "need": "Choose {{ count }} for {{ group }}.",
    "too_many": "Up to {{ count }} for {{ group }}.",
    "note": "Note for the kitchen",
    "note_placeholder": "Allergies, no chilli, sauce on the side\u2026",
    "customise": "Customise",
    "from": "From {{ price }}",
    "quantity": "Quantity",
    "pickup_info": "Pickup at the counter or delivery within 5 km. You choose a time in your order.",
    "diet": {
      "v": "Vegetarian",
      "vg": "Vegan",
      "gf": "Gluten-free"
    }
  },
  "product": {
    "add": "Add to order",
    "size": "Size",
    "amount": "Amount",
    "beans_info": "Roasted weekly. Ships across Indonesia, or collect with your brunch.",
    "gift_info": "Sent by email right after checkout. Use it online or at the counter."
  },
  "cart": {
    "title": "Your order",
    "empty": "Nothing here yet",
    "empty_text": "Start with a plate, a bowl or a flat white.",
    "browse": "See the menu",
    "remove": "Remove",
    "increase": "Add one {{ product }}",
    "decrease": "Remove one {{ product }}",
    "quantity": "Quantity of {{ product }}",
    "subtotal": "Subtotal",
    "checkout": "Checkout",
    "added": "Added to your order",
    "how": "How do you want it?",
    "pickup": "Pickup",
    "pickup_sub": "At the counter, no queue",
    "delivery": "Delivery",
    "delivery_sub": "Within 5 km",
    "time_pickup": "Pickup time",
    "time_delivery": "Delivery time",
    "loading": "Checking the kitchen\u2026",
    "slots_error": "Couldn't load times. Check your connection and try again.",
    "today": "Today",
    "tomorrow": "Tomorrow",
    "left": {
      "one": "{{ count }} left",
      "other": "{{ count }} left"
    },
    "full": "Full",
    "no_slots": "No times left on this day.",
    "choose_time": "Choose a time to check out",
    "slot_gone": "That time just filled up. Please choose another.",
    "ready_at": "Ready at {{ time }}",
    "no_slot_needed": "Beans ship and gift cards arrive by email, so no time needed.",
    "retry": "Try again"
  },
  "catering": {
    "title": "Catering",
    "packages": "Packages",
    "per_guest": "{{ price }} per guest",
    "form_title": "Request a quote",
    "name": "Name",
    "email": "Email",
    "phone": "WhatsApp number",
    "date": "Event date",
    "guests": "Guests",
    "package": "Package",
    "notes": "Anything we should know?",
    "notes_placeholder": "Villa address, dietary needs, timing\u2026",
    "submit": "Send request",
    "estimate": "Estimate: {{ amount }}",
    "terms": "We reply within a day with a quote. You confirm by paying a 50% deposit through our secure checkout."
  },
  "footer": {
    "hours": "Hours",
    "daily": "Every day",
    "kitchen": "Kitchen until {{ time }}",
    "find": "Find us",
    "directions": "Directions",
    "whatsapp": "WhatsApp us",
    "tax": "Prices include 10% PB1 tax."
  },
  "404": {
    "title": "This page isn't on the menu",
    "back": "Back to the menu"
  }
}
`,"/repo/theme/locales/id.json":`{
  "general": {
    "close": "Tutup",
    "error": "Terjadi kesalahan. Silakan coba lagi.",
    "skip": "Langsung ke konten",
    "language": "Bahasa",
    "view_all": "Lihat semua"
  },
  "header": {
    "menu": "Menu",
    "cart": {
      "one": "Pesanan, {{ count }} item",
      "other": "Pesanan, {{ count }} item"
    },
    "order_now": "Pesan sekarang",
    "status_open": "Dapur buka \xB7 pesanan terakhir {{ time }}",
    "status_soon": "Buka pukul {{ time }}",
    "status_closed": "Sudah tutup \xB7 pesan untuk besok"
  },
  "home": {
    "how_title": "Tanpa antre",
    "menu_title": "Menu",
    "menu_lead": "Semua dimasak saat dipesan. Pilih telur, roti, dan topping-nya."
  },
  "dish": {
    "add": "Tambah",
    "add_to_order": "Tambah ke pesanan",
    "choose": "Pilih",
    "required": "Wajib",
    "optional": "Opsional",
    "choose_one": "Pilih 1",
    "choose_exactly": "Pilih {{ count }}",
    "up_to": "Maksimal {{ count }}",
    "need": "Pilih {{ count }} untuk {{ group }}.",
    "too_many": "Maksimal {{ count }} untuk {{ group }}.",
    "note": "Catatan untuk dapur",
    "note_placeholder": "Alergi, tanpa cabai, saus terpisah\u2026",
    "customise": "Atur pesanan",
    "from": "Mulai {{ price }}",
    "quantity": "Jumlah",
    "pickup_info": "Ambil di kasir atau diantar dalam radius 5 km. Waktunya dipilih di pesanan.",
    "diet": {
      "v": "Vegetarian",
      "vg": "Vegan",
      "gf": "Bebas gluten"
    }
  },
  "product": {
    "add": "Tambah ke pesanan",
    "size": "Ukuran",
    "amount": "Nominal",
    "beans_info": "Disangrai setiap minggu. Dikirim ke seluruh Indonesia, atau ambil sekalian brunch.",
    "gift_info": "Dikirim lewat email setelah checkout. Bisa dipakai online atau di kasir."
  },
  "cart": {
    "title": "Pesanan kamu",
    "empty": "Belum ada pesanan",
    "empty_text": "Mulai dengan satu piring, bowl, atau flat white.",
    "browse": "Lihat menu",
    "remove": "Hapus",
    "increase": "Tambah satu {{ product }}",
    "decrease": "Kurangi satu {{ product }}",
    "quantity": "Jumlah {{ product }}",
    "subtotal": "Subtotal",
    "checkout": "Checkout",
    "added": "Ditambahkan ke pesanan",
    "how": "Mau diambil atau diantar?",
    "pickup": "Ambil sendiri",
    "pickup_sub": "Di kasir, tanpa antre",
    "delivery": "Diantar",
    "delivery_sub": "Radius 5 km",
    "time_pickup": "Waktu ambil",
    "time_delivery": "Waktu antar",
    "loading": "Mengecek dapur\u2026",
    "slots_error": "Waktu tidak bisa dimuat. Cek koneksi lalu coba lagi.",
    "today": "Hari ini",
    "tomorrow": "Besok",
    "left": {
      "one": "sisa {{ count }}",
      "other": "sisa {{ count }}"
    },
    "full": "Penuh",
    "no_slots": "Tidak ada waktu tersisa di hari ini.",
    "choose_time": "Pilih waktu untuk checkout",
    "slot_gone": "Waktu itu baru saja penuh. Silakan pilih yang lain.",
    "ready_at": "Siap pukul {{ time }}",
    "no_slot_needed": "Biji kopi dikirim dan kartu hadiah lewat email, jadi tidak perlu pilih waktu.",
    "retry": "Coba lagi"
  },
  "catering": {
    "title": "Katering",
    "packages": "Paket",
    "per_guest": "{{ price }} per tamu",
    "form_title": "Minta penawaran",
    "name": "Nama",
    "email": "Email",
    "phone": "Nomor WhatsApp",
    "date": "Tanggal acara",
    "guests": "Jumlah tamu",
    "package": "Paket",
    "notes": "Ada yang perlu kami tahu?",
    "notes_placeholder": "Alamat vila, kebutuhan diet, jam acara\u2026",
    "submit": "Kirim permintaan",
    "estimate": "Perkiraan: {{ amount }}",
    "terms": "Kami balas dalam sehari dengan penawaran. Konfirmasi dengan membayar DP 50% lewat checkout kami."
  },
  "footer": {
    "hours": "Jam buka",
    "daily": "Setiap hari",
    "kitchen": "Dapur sampai {{ time }}",
    "find": "Lokasi",
    "directions": "Petunjuk arah",
    "whatsapp": "Chat WhatsApp",
    "tax": "Harga sudah termasuk pajak PB1 10%."
  },
  "404": {
    "title": "Halaman ini tidak ada di menu",
    "back": "Kembali ke menu"
  }
}
`,"/repo/theme/sections/band.liquid":`{%- comment -%} A colour band with a picture and a link: beans, gift cards, catering. {%- endcomment -%}
<section class="section">
  <div class="container">
    <div class="band band--{{ section.settings.tone }}{% if section.settings.flip %} band--flip{% endif %}">
      <div class="band__art">
        {%- if section.settings.image -%}{{ section.settings.image | image_url: width: 1000 | image_tag: widths: '500, 800, 1000', sizes: '(min-width: 900px) 40vw, 100vw', loading: 'lazy', alt: '' }}{%- endif -%}
      </div>
      <div class="stack band__copy" style="--gap:16px">
        <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
        <h2 class="d-2">{{ section.settings.heading | escape }}</h2>
        <p class="muted">{{ section.settings.text | escape }}</p>
        {%- if section.settings.collection != blank -%}
          <ul class="band__list" role="list">
            {%- for p in section.settings.collection.products limit: 3 -%}
              <li><a href="{{ p.url }}">{{ p.title | escape }}</a> <span class="muted">{{ p.price | money }}</span></li>
            {%- endfor -%}
          </ul>
        {%- endif -%}
        <div><a href="{{ section.settings.link }}" class="btn">{{ section.settings.cta | escape }} {% render 'icon', name: 'arrow' %}</a></div>
      </div>
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Band",
  "settings": [
    { "type": "select", "id": "tone", "label": "Colour", "default": "yolk", "options": [{ "value": "yolk", "label": "Yolk" }, { "value": "leaf", "label": "Leaf" }, { "value": "clay", "label": "Clay" }] },
    { "type": "checkbox", "id": "flip", "label": "Picture on the right", "default": false },
    { "type": "text", "id": "eyebrow", "label": "Eyebrow" },
    { "type": "text", "id": "heading", "label": "Heading" },
    { "type": "textarea", "id": "text", "label": "Text" },
    { "type": "collection", "id": "collection", "label": "Products to list" },
    { "type": "text", "id": "cta", "label": "Button" },
    { "type": "url", "id": "link", "label": "Button link" },
    { "type": "image_picker", "id": "image", "label": "Image" }
  ],
  "presets": [{ "name": "Band" }]
}
{% endschema %}
`,"/repo/theme/sections/cart-drawer.liquid":`<dialog class="drawer" id="cart-drawer" aria-label="{{ 'cart.title' | t }}">
  <cart-items data-cart-root="cart-drawer" data-count="{{ cart.item_count }}" class="drawer__inner">
    <div class="drawer__head">
      <p class="d-3">{{ 'cart.title' | t }} <span class="muted">({{ cart.item_count }})</span></p>
      <button type="button" class="icon-btn" data-close-dialog aria-label="{{ 'general.close' | t }}">{% render 'icon', name: 'close' %}</button>
    </div>
    <div class="drawer__body">{% render 'cart-body' %}</div>
  </cart-items>
</dialog>

{% schema %}
{ "name": "Cart drawer", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/footer-group.json":`{
  "type": "footer",
  "name": "Footer",
  "sections": { "footer": { "type": "footer", "settings": { "menu": "footer" } } },
  "order": ["footer"]
}
`,"/repo/theme/sections/footer.liquid":`<footer class="footer">
  <div class="container footer__grid">
    <div class="stack" style="--gap:12px">
      <span class="wordmark wordmark--lg">{% render 'icon', name: 'sun' %}{{ settings.wordmark }}</span>
      <p class="muted small">{{ section.settings.blurb }}</p>
    </div>
    <div class="stack" style="--gap:6px">
      <p class="eyebrow">{{ 'footer.hours' | t }}</p>
      <p>{{ 'footer.daily' | t }} \xB7 {{ settings.hours_open }}\u2013{{ settings.hours_close }}</p>
      <p class="muted small">{{ 'footer.kitchen' | t: time: settings.kitchen_close }}</p>
    </div>
    <div class="stack" style="--gap:6px">
      <p class="eyebrow">{{ 'footer.find' | t }}</p>
      <p>{{ settings.address }}</p>
      <p class="footer__links small">
        {%- if settings.maps_url != blank -%}<a href="{{ settings.maps_url }}" rel="noopener" target="_blank">{% render 'icon', name: 'pin' %}{{ 'footer.directions' | t }}</a>{%- endif -%}
        <a href="https://wa.me/{{ settings.whatsapp }}" rel="noopener" target="_blank">{% render 'icon', name: 'chat' %}{{ 'footer.whatsapp' | t }}</a>
      </p>
    </div>
    <nav class="stack" style="--gap:6px" aria-label="Footer">
      {%- for link in section.settings.menu.links -%}<a href="{{ link.url }}" class="small">{{ link.title | escape }}</a>{%- endfor -%}
    </nav>
  </div>
  <div class="container footer__base xsmall muted">
    <span>\xA9 {{ 'now' | date: '%Y' }} {{ shop.name }} \xB7 {{ 'footer.tax' | t }}</span>
    {%- if settings.instagram != blank -%}<a href="https://instagram.com/{{ settings.instagram }}" rel="noopener" target="_blank">@{{ settings.instagram }}</a>{%- endif -%}
  </div>
</footer>

{% schema %}
{
  "name": "Footer",
  "enabled_on": { "groups": ["footer"] },
  "settings": [
    { "type": "textarea", "id": "blurb", "label": "Blurb", "default": "Brunch and specialty coffee in Pererenan. Order ahead, skip the queue." },
    { "type": "link_list", "id": "menu", "label": "Menu", "default": "footer" }
  ]
}
{% endschema %}
`,"/repo/theme/sections/header-group.json":`{
  "type": "header",
  "name": "Header",
  "sections": { "header": { "type": "header", "settings": { "menu": "main-menu" } } },
  "order": ["header"]
}
`,"/repo/theme/sections/header.liquid":`<div class="status-bar" data-open-status hidden></div>
<header class="header">
  <div class="container header__inner">
    <button type="button" class="icon-btn menu-btn" data-open-dialog="nav-drawer" aria-label="{{ 'header.menu' | t }}">{% render 'icon', name: 'menu' %}</button>
    <a href="{{ routes.root_url }}" class="wordmark" aria-label="{{ shop.name | escape }}">{% render 'icon', name: 'sun' %}{{ settings.wordmark | escape }}</a>
    <nav class="nav" aria-label="{{ 'header.menu' | t }}">
      {%- for link in section.settings.menu.links -%}
        <a href="{{ link.url }}" {% if link.current %}aria-current="page"{% endif %}>{{ link.title | escape }}</a>
      {%- endfor -%}
    </nav>
    <div class="header__actions">
      {% render 'language-switch', id: 'header' %}
      <a href="{{ routes.cart_url }}" class="cart-btn" data-open-dialog="cart-drawer" aria-label="{{ 'header.cart' | t: count: cart.item_count }}">
        {% render 'icon', name: 'bag' %}
        <span class="cart-badge" data-cart-count data-count="{{ cart.item_count }}">{{ cart.item_count }}</span>
      </a>
    </div>
  </div>
</header>

<dialog class="drawer drawer--left" id="nav-drawer" aria-label="{{ 'header.menu' | t }}">
  <div class="drawer__head">
    <span class="wordmark">{% render 'icon', name: 'sun' %}{{ settings.wordmark }}</span>
    <button type="button" class="icon-btn" data-close-dialog aria-label="{{ 'general.close' | t }}">{% render 'icon', name: 'close' %}</button>
  </div>
  <nav class="drawer__body stack" style="--gap:2px">
    {%- for link in section.settings.menu.links -%}
      <a href="{{ link.url }}" class="d-2 nav-drawer__link">{{ link.title | escape }}</a>
    {%- endfor -%}
  </nav>
  <div class="drawer__foot">{% render 'language-switch', id: 'drawer' %}</div>
</dialog>

{% schema %}
{
  "name": "Header",
  "enabled_on": { "groups": ["header"] },
  "settings": [{ "type": "link_list", "id": "menu", "label": "Menu", "default": "main-menu" }]
}
{% endschema %}
`,"/repo/theme/sections/hero.liquid":`<section class="hero">
  <div class="container hero__grid">
    <div class="stack hero__copy" style="--gap:22px">
      <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
      <h1 class="d-hero">{{ section.settings.heading | escape }}</h1>
      <p class="lead muted">{{ section.settings.text | escape }}</p>
      <div class="cluster">
        <a href="{{ section.settings.cta_link }}" class="btn btn--lg">{{ section.settings.cta | escape }} {% render 'icon', name: 'arrow' %}</a>
        <span class="hero__ready small" data-next-slot>{% render 'icon', name: 'clock' %}<span>{{ section.settings.ready_hint | escape }}</span></span>
      </div>
    </div>
    <div class="hero__art">
      {%- if section.settings.image -%}
        {{ section.settings.image | image_url: width: 1400 | image_tag: widths: '600, 900, 1200, 1400', sizes: '(min-width: 900px) 50vw, 100vw', preload: true, fetchpriority: 'high', alt: section.settings.image.alt }}
      {%- endif -%}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "Pererenan, Bali" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Brunch, ready when you are" },
    { "type": "textarea", "id": "text", "label": "Text", "default": "Order ahead, pick a time, and collect at the counter. Or have it brought to your villa within 5 km." },
    { "type": "text", "id": "cta", "label": "Button", "default": "Order now" },
    { "type": "url", "id": "cta_link", "label": "Button link", "default": "/#menu" },
    { "type": "text", "id": "ready_hint", "label": "Ready-time hint", "default": "Ready in about 20 minutes" },
    { "type": "image_picker", "id": "image", "label": "Image" }
  ],
  "presets": [{ "name": "Hero" }]
}
{% endschema %}
`,"/repo/theme/sections/main-404.liquid":`<section class="section">
  <div class="container narrow stack center" style="--gap:18px;justify-items:center">
    <h1 class="d-1">{{ '404.title' | t }}</h1>
    <a href="{{ routes.root_url }}#menu" class="btn">{{ '404.back' | t }}</a>
  </div>
</section>

{% schema %}
{ "name": "404", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/main-cart.liquid":`<section class="section">
  <div class="container cart-page">
    <h1 class="d-1">{{ 'cart.title' | t }}</h1>
    <cart-items data-cart-root="{{ section.id }}" data-count="{{ cart.item_count }}" class="cart-page__body">{% render 'cart-body' %}</cart-items>
  </div>
</section>

{% schema %}
{ "name": "Cart", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/main-catering.liquid":`{%- comment -%}
  Catering: packages and a quote request. The form posts to the app proxy, and pagi-ops turns
  it into a draft order the team prices and sends from Shopify admin. Package keys must match
  catering.packages in scripts/catalog.json (the backend checks them).
{%- endcomment -%}
<section class="section catering">
  <div class="container catering__grid">
    <div class="stack" style="--gap:18px">
      <p class="eyebrow">{{ section.settings.eyebrow | escape }}</p>
      <h1 class="d-1">{{ section.settings.heading | escape }}</h1>
      <p class="lead muted">{{ section.settings.text | escape }}</p>
      <h2 class="d-3">{{ 'catering.packages' | t }}</h2>
      <ul class="packages" role="list">
        {%- for block in section.blocks -%}
          {%- assign per = block.settings.per_guest | times: 100 | money -%}
          <li class="package" {{ block.shopify_attributes }}>
            <p class="d-3">{{ block.settings.title | escape }}</p>
            <p class="small muted">{{ block.settings.text | escape }}</p>
            <p class="small"><b>{{ 'catering.per_guest' | t: price: per }}</b></p>
          </li>
        {%- endfor -%}
      </ul>
    </div>
    <catering-form class="card" data-endpoint="{{ section.settings.endpoint }}" data-min-days="{{ section.settings.min_days }}">
      <form class="stack" style="--gap:14px" novalidate>
        <h2 class="d-2">{{ 'catering.form_title' | t }}</h2>
        <label class="field"><span class="small">{{ 'catering.name' | t }}</span><input name="name" autocomplete="name" required><em data-err="name"></em></label>
        <div class="field-row">
          <label class="field"><span class="small">{{ 'catering.email' | t }}</span><input name="email" type="email" autocomplete="email" required><em data-err="email"></em></label>
          <label class="field"><span class="small">{{ 'catering.phone' | t }}</span><input name="phone" type="tel" autocomplete="tel" placeholder="+62"><em data-err="phone"></em></label>
        </div>
        <div class="field-row">
          <label class="field"><span class="small">{{ 'catering.date' | t }}</span><input name="date" type="date" required><em data-err="date"></em></label>
          <label class="field"><span class="small">{{ 'catering.guests' | t }}</span><input name="guests" type="number" min="{{ section.settings.min_guests }}" max="120" value="{{ section.settings.min_guests }}" inputmode="numeric" required><em data-err="guests"></em></label>
        </div>
        <fieldset class="field">
          <legend class="small">{{ 'catering.package' | t }}</legend>
          <div class="group__opts">
            {%- for block in section.blocks -%}
              <label class="opt"><input type="radio" name="package" value="{{ block.settings.key }}" data-per="{{ block.settings.per_guest | times: 100 }}" {% if forloop.first %}checked{% endif %}><span class="opt__label">{{ block.settings.title | escape }}</span></label>
            {%- endfor -%}
          </div>
          <em data-err="package"></em>
        </fieldset>
        <label class="field"><span class="small">{{ 'catering.notes' | t }}</span><textarea name="notes" rows="3" maxlength="1000" placeholder="{{ 'catering.notes_placeholder' | t }}"></textarea></label>
        <p class="d-3" data-estimate data-template="{{ 'catering.estimate' | t: amount: '{amount}' | escape }}"></p>
        <button type="submit" class="btn btn--lg btn--block">{{ 'catering.submit' | t }}</button>
        <p class="xsmall muted">{{ 'catering.terms' | t }}</p>
        <p class="notice" data-done role="status" hidden></p>
      </form>
    </catering-form>
  </div>
</section>
<script src="{{ 'catering.js' | asset_url }}" type="module"><\/script>

{% schema %}
{
  "name": "Catering",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "Villas, retreats, offsites" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Brunch for the whole villa" },
    { "type": "textarea", "id": "text", "label": "Text", "default": "From 15 to 120 guests, set up and cleared by our team anywhere between Canggu and Seseh." },
    { "type": "text", "id": "endpoint", "label": "Request endpoint (app proxy)", "default": "/apps/pagi/catering" },
    { "type": "number", "id": "min_days", "label": "Minimum days ahead", "default": 3 },
    { "type": "number", "id": "min_guests", "label": "Minimum guests", "default": 15 }
  ],
  "blocks": [
    {
      "type": "package",
      "name": "Package",
      "settings": [
        { "type": "text", "id": "key", "label": "Key (matches the backend)" },
        { "type": "text", "id": "title", "label": "Title" },
        { "type": "textarea", "id": "text", "label": "Description" },
        { "type": "number", "id": "per_guest", "label": "Price per guest (Rp)" }
      ]
    }
  ]
}
{% endschema %}
`,"/repo/theme/sections/main-collection.liquid":`<section class="section">
  <div class="container stack" style="--gap:24px">
    <div class="stack" style="--gap:8px">
      <h1 class="d-1">{{ collection.title | escape }}</h1>
      {%- if collection.description != blank -%}<div class="rte muted lead">{{ collection.description }}</div>{%- endif -%}
    </div>
    {%- paginate collection.products by 24 -%}
      <div class="dish-grid">
        {%- for product in collection.products -%}{% render 'dish-card', product: product %}{%- endfor -%}
      </div>
      {{ paginate | default_pagination }}
    {%- endpaginate -%}
  </div>
</section>

{% schema %}
{ "name": "Collection", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/main-page.liquid":`<section class="section">
  <div class="container narrow stack" style="--gap:18px">
    <h1 class="d-1">{{ page.title | escape }}</h1>
    <div class="rte">{{ page.content }}</div>
  </div>
</section>

{% schema %}
{ "name": "Page", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/main-product.liquid":`{%- comment -%}
  Dish page and product page in one section.
  - Dishes (type "Menu") get the modifier builder from the pagi.modifiers metafield. Free choices
    become line properties named after the group; paid add-ons also go into \`_mods\` as variant
    IDs, which the menu-addons Cart Transform turns into priced components of the line.
  - Beans and gift cards get a plain variant picker.
  Group titles stay in English in line properties so the kitchen reads one language.
{%- endcomment -%}
{%- liquid
  assign variant = product.selected_or_first_available_variant
  assign is_dish = false
  if product.type == 'Menu'
    assign is_dish = true
  endif
  assign groups = product.metafields.pagi.modifiers.value.groups
  assign local = false
  if request.locale.iso_code == 'id'
    assign local = true
  endif
-%}
{{ 'product.css' | asset_url | stylesheet_tag }}
<section class="container product">
  <div class="product__media">
    {%- if product.featured_media -%}
      {{ product.featured_media | image_url: width: 1200 | image_tag: widths: '500, 800, 1200', sizes: '(min-width: 900px) 50vw, 100vw', preload: true, alt: product.title }}
    {%- endif -%}
  </div>

  <div class="product__info stack" style="--gap:18px">
    <div class="stack" style="--gap:8px">
      <h1 class="d-1">{{ product.title | escape }}</h1>
      {% render 'diet-badges', product: product %}
    </div>
    <div class="rte muted">{{ product.description }}</div>

    {%- if is_dish -%}
      <dish-form data-base="{{ variant.price }}">
        {%- form 'product', product, id: 'dish-form', novalidate: 'novalidate' -%}
          <input type="hidden" name="id" value="{{ variant.id }}">
          {%- for g in groups -%}
            {%- liquid
              assign g_title = g.title
              if local and g.title_id != blank
                assign g_title = g.title_id
              endif
              if g.min > 0 and g.min == g.max
                if g.min == 1
                  assign rule = 'dish.choose_one' | t
                else
                  assign rule = 'dish.choose_exactly' | t: count: g.min
                endif
              else
                assign rule = 'dish.up_to' | t: count: g.max
              endif
            -%}
            <fieldset class="group" data-group data-min="{{ g.min }}" data-max="{{ g.max }}" data-name="{{ g.title | escape }}" data-label="{{ g_title | escape }}">
              <legend class="group__head">
                <span class="d-3">{{ g_title | escape }}</span>
                <span class="group__rule xsmall {% if g.min > 0 %}group__rule--req{% endif %}">{{ rule }}{% if g.min > 0 %} \xB7 {{ 'dish.required' | t }}{% endif %}</span>
              </legend>
              <div class="group__opts">
                {%- for o in g.options -%}
                  {%- liquid
                    assign o_label = o.label
                    if local and o.label_id != blank
                      assign o_label = o.label_id
                    endif
                    assign o_price = o.price | times: 100
                  -%}
                  <label class="opt">
                    <input
                      type="{% if g.max == 1 %}radio{% else %}checkbox{% endif %}"
                      name="choice-{{ g.key }}"
                      value="{{ o.label | escape }}"
                      data-price="{{ o_price }}"
                      {% if o.variant %}data-variant="{{ o.variant }}"{% endif %}
                      {% if g.max == 1 and g.min == 1 and forloop.first %}checked{% endif %}
                    >
                    <span class="opt__label">{{ o_label | escape }}</span>
                    {%- if o.price > 0 -%}<span class="opt__price small muted">+{{ o_price | money }}</span>{%- endif -%}
                  </label>
                {%- endfor -%}
              </div>
            </fieldset>
          {%- endfor -%}

          <label class="field">
            <span class="small">{{ 'dish.note' | t }}</span>
            <textarea name="properties[Note]" rows="2" maxlength="200" placeholder="{{ 'dish.note_placeholder' | t }}"></textarea>
          </label>

          <div class="buy">
            <div class="qty" data-qty-wrap>
              <button type="button" data-step="-1" aria-label="-">{% render 'icon', name: 'minus' %}</button>
              <input type="number" name="quantity" value="1" min="1" max="20" inputmode="numeric" aria-label="{{ 'dish.quantity' | t }}">
              <button type="button" data-step="1" aria-label="+">{% render 'icon', name: 'plus' %}</button>
            </div>
            <button type="submit" class="btn btn--lg buy__btn">
              <span>{{ 'dish.add_to_order' | t }}</span><span data-total>{{ variant.price | money }}</span>
            </button>
          </div>
          <p class="error small" data-error role="alert" hidden></p>
          <p class="xsmall muted hint">{% render 'icon', name: 'clock' %}<span>{{ 'dish.pickup_info' | t }}</span></p>
        {%- endform -%}
      </dish-form>
      <script src="{{ 'dish.js' | asset_url }}" type="module"><\/script>
    {%- else -%}
      <product-form>
        {%- form 'product', product, id: 'product-form' -%}
          {%- unless product.has_only_default_variant -%}
            <fieldset class="group">
              <legend class="group__head"><span class="d-3">{% if product.gift_card? %}{{ 'product.amount' | t }}{% else %}{{ 'product.size' | t }}{% endif %}</span></legend>
              <div class="group__opts">
                {%- for v in product.variants -%}
                  <label class="opt">
                    <input type="radio" name="id" value="{{ v.id }}" data-price="{{ v.price }}" {% if v.id == variant.id %}checked{% endif %} {% unless v.available %}disabled{% endunless %}>
                    <span class="opt__label">{{ v.title }}</span>
                    <span class="opt__price small muted">{{ v.price | money }}</span>
                  </label>
                {%- endfor -%}
              </div>
            </fieldset>
          {%- else -%}
            <input type="hidden" name="id" value="{{ variant.id }}">
          {%- endunless -%}
          <div class="buy">
            <button type="submit" class="btn btn--lg buy__btn"><span>{{ 'product.add' | t }}</span><span data-total>{{ variant.price | money }}</span></button>
          </div>
          <p class="error small" data-error role="alert" hidden></p>
          <p class="xsmall muted">{% if product.gift_card? %}{{ 'product.gift_info' | t }}{% else %}{{ 'product.beans_info' | t }}{% endif %}</p>
        {%- endform -%}
      </product-form>
    {%- endif -%}
  </div>
</section>

{% schema %}
{ "name": "Product", "settings": [] }
{% endschema %}
`,"/repo/theme/sections/menu.liquid":`{%- comment -%}
  The whole menu on one page: a sticky category bar and a grid per collection. Categories are
  ordinary collections, so staff reorder dishes in Shopify admin.
{%- endcomment -%}
<section class="section menu" id="menu">
  <div class="container stack" style="--gap:10px">
    <h2 class="d-1">{{ section.settings.heading | escape }}</h2>
    <p class="lead muted">{{ section.settings.text | escape }}</p>
  </div>
  <nav class="menu__tabs" aria-label="{{ section.settings.heading | escape }}">
    <div class="container cluster" style="--gap:8px">
      {%- for c in section.settings.categories -%}
        <a href="#cat-{{ c.handle }}" class="chip">{{ c.title | escape }}</a>
      {%- endfor -%}
    </div>
  </nav>
  <div class="container stack" style="--gap:48px">
    {%- for c in section.settings.categories -%}
      <div class="menu__cat" id="cat-{{ c.handle }}">
        <h3 class="d-2">{{ c.title | escape }}</h3>
        <div class="dish-grid">
          {%- for product in c.products -%}{% render 'dish-card', product: product %}{%- endfor -%}
        </div>
      </div>
    {%- endfor -%}
  </div>
</section>

{% schema %}
{
  "name": "Menu",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "The menu" },
    { "type": "textarea", "id": "text", "label": "Text", "default": "Everything is cooked to order. Choose your eggs, your bread and what goes on top." },
    { "type": "collection_list", "id": "categories", "label": "Categories", "limit": 8 }
  ],
  "presets": [{ "name": "Menu" }]
}
{% endschema %}
`,"/repo/theme/sections/steps.liquid":`<section class="section steps">
  <div class="container">
    <h2 class="d-2">{{ section.settings.heading | escape }}</h2>
    <ol class="steps__list" role="list">
      {%- for block in section.blocks -%}
        <li class="steps__item" {{ block.shopify_attributes }}>
          <span class="steps__n">{{ forloop.index }}</span>
          <h3 class="d-3">{{ block.settings.title | escape }}</h3>
          <p class="muted small">{{ block.settings.text | escape }}</p>
        </li>
      {%- endfor -%}
    </ol>
  </div>
</section>

{% schema %}
{
  "name": "Steps",
  "settings": [{ "type": "text", "id": "heading", "label": "Heading", "default": "Skip the queue" }],
  "blocks": [
    {
      "type": "step",
      "name": "Step",
      "settings": [
        { "type": "text", "id": "title", "label": "Title" },
        { "type": "textarea", "id": "text", "label": "Text" }
      ]
    }
  ],
  "presets": [{ "name": "Steps" }]
}
{% endschema %}
`,"/repo/theme/snippets/cart-body.liquid":`{%- comment -%} Shared by the drawer and the cart page. {%- endcomment -%}
{%- liquid
  assign has_dish = false
  for item in cart.items
    if item.product.type == 'Menu'
      assign has_dish = true
    endif
  endfor
  assign needs_slot = false
  if has_dish and cart.attributes.pickup_slot == blank
    assign needs_slot = true
  endif
-%}
{%- if cart.item_count > 0 -%}
  <div class="cart__lines">
    {%- for item in cart.items -%}{% render 'cart-line', item: item, index: forloop.index %}{%- endfor -%}
  </div>
  {% render 'fulfilment', has_dish: has_dish %}
  <form class="cart__foot" action="{{ routes.cart_url }}" method="post" data-checkout-form>
    <div class="totals"><span>{{ 'cart.subtotal' | t }}</span><span>{{ cart.total_price | money }}</span></div>
    <p class="xsmall muted">{{ settings.tax_note }}</p>
    <button type="submit" name="checkout" class="btn btn--block btn--lg" data-checkout data-needs-slot="{{ has_dish }}" {% if needs_slot %}disabled{% endif %}>
      {{ 'cart.checkout' | t }} {% render 'icon', name: 'arrow' %}
    </button>
    <p class="xsmall muted center" data-checkout-hint {% unless needs_slot %}hidden{% endunless %}>{{ 'cart.choose_time' | t }}</p>
  </form>
{%- else -%}
  <div class="stack cart__empty" style="--gap:14px">
    <p class="d-2">{{ 'cart.empty' | t }}</p>
    <p class="muted small">{{ 'cart.empty_text' | t }}</p>
    <a href="{{ routes.root_url }}#menu" class="btn" data-close-dialog>{{ 'cart.browse' | t }}</a>
  </div>
{%- endif -%}
`,"/repo/theme/snippets/cart-line.liquid":`{%- comment -%}
  One cart line. - item, index (1-based line number)
  A dish with add-ons is one line: the Cart Transform expands it into the dish plus add-on
  components, so the price already includes them.
{%- endcomment -%}
<div class="line" data-line="{{ index }}" data-key="{{ item.key }}">
  <a href="{{ item.url }}" class="line__img" tabindex="-1" aria-hidden="true">
    {%- if item.image -%}{{ item.image | image_url: width: 160 | image_tag: widths: '80, 160', sizes: '64px', alt: '', loading: 'lazy' }}{%- endif -%}
  </a>
  <div class="line__main">
    <a href="{{ item.url }}" class="line__title">{{ item.product.title | escape }}</a>
    <div class="line__meta xsmall muted">
      {%- unless item.product.has_only_default_variant -%}<span>{{ item.variant.title }}</span>{%- endunless -%}
      {%- for p in item.properties -%}
        {%- assign first_char = p.first | slice: 0 -%}
        {%- if first_char != '_' and p.last != blank -%}<span>{{ p.first }}: {{ p.last }}</span>{%- endif -%}
      {%- endfor -%}
    </div>
    <div class="line__actions">
      <div class="qty qty--sm">
        <button type="button" data-step="-1" aria-label="{{ 'cart.decrease' | t: product: item.product.title | escape }}">{% render 'icon', name: 'minus' %}</button>
        <input type="number" min="0" inputmode="numeric" value="{{ item.quantity }}" data-qty aria-label="{{ 'cart.quantity' | t: product: item.product.title | escape }}">
        <button type="button" data-step="1" aria-label="{{ 'cart.increase' | t: product: item.product.title | escape }}">{% render 'icon', name: 'plus' %}</button>
      </div>
      <button type="button" class="xsmall link muted" data-remove>{{ 'cart.remove' | t }}</button>
    </div>
  </div>
  <div class="line__price small">{{ item.final_line_price | money }}</div>
</div>
`,"/repo/theme/snippets/diet-badges.liquid":`{%- comment -%} Diet badges from the pagi.diet metafield. - product {%- endcomment -%}
{%- assign diets = product.metafields.pagi.diet.value -%}
{%- if diets != blank -%}
  <span class="diets">
    {%- for d in diets -%}
      {%- case d -%}
        {%- when 'vg' -%}{%- assign label = 'dish.diet.vg' | t -%}
        {%- when 'gf' -%}{%- assign label = 'dish.diet.gf' | t -%}
        {%- else -%}{%- assign label = 'dish.diet.v' | t -%}
      {%- endcase -%}
      <abbr class="diet diet--{{ d }}" title="{{ label }}">{{ d | upcase }}</abbr>
    {%- endfor -%}
  </span>
{%- endif -%}
`,"/repo/theme/snippets/dish-card.liquid":`{%- comment -%}
  A dish on the menu. Dishes with required choices open the dish page; the rest add straight
  to the order. - product
{%- endcomment -%}
{%- liquid
  assign groups = product.metafields.pagi.modifiers.value.groups
  assign needs_choice = false
  for g in groups
    if g.min > 0
      assign needs_choice = true
    endif
  endfor
-%}
<article class="dish">
  <a href="{{ product.url }}" class="dish__img" tabindex="-1" aria-hidden="true">
    {%- if product.featured_media -%}
      {{ product.featured_media | image_url: width: 640 | image_tag: widths: '320, 480, 640', sizes: '(min-width: 900px) 25vw, 50vw', alt: '', loading: 'lazy' }}
    {%- endif -%}
  </a>
  <div class="dish__body">
    <h3 class="dish__title"><a href="{{ product.url }}">{{ product.title | escape }}</a></h3>
    {% render 'diet-badges', product: product %}
    <p class="dish__desc small muted">{{ product.description | strip_html | truncate: 96 }}</p>
  </div>
  <div class="dish__foot">
    <span class="price">{{ product.price | money }}</span>
    {%- if needs_choice or groups.size > 0 -%}
      <a href="{{ product.url }}" class="btn btn--sm btn--ghost">{{ 'dish.customise' | t }}</a>
    {%- else -%}
      <quick-add data-variant="{{ product.selected_or_first_available_variant.id }}">
        <button type="button" class="btn btn--sm" aria-label="{{ 'dish.add' | t }} {{ product.title | escape }}">{% render 'icon', name: 'plus' %} {{ 'dish.add' | t }}</button>
      </quick-add>
    {%- endif -%}
  </div>
</article>
`,"/repo/theme/snippets/fulfilment.liquid":`{%- comment -%}
  Pickup or delivery, and when. Saved as cart attributes (fulfilment, pickup_slot), which the
  pickup-slot Validation checks at checkout and the kitchen board groups by. Times come from
  the app proxy, so they reflect what the kitchen has left right now.
  - has_dish
{%- endcomment -%}
{%- assign fulfilment = cart.attributes.fulfilment | default: 'pickup' -%}
{%- if has_dish -%}
  <fulfilment-picker class="fulfil" data-fulfilment="{{ fulfilment }}" data-slot="{{ cart.attributes.pickup_slot | escape }}">
    <p class="small fulfil__q">{{ 'cart.how' | t }}</p>
    <div class="seg" role="radiogroup">
      <label class="seg__opt">
        <input type="radio" name="fulfilment" value="pickup" {% if fulfilment == 'pickup' %}checked{% endif %}>
        <span>{% render 'icon', name: 'store' %}<b>{{ 'cart.pickup' | t }}</b><small>{{ 'cart.pickup_sub' | t }}</small></span>
      </label>
      <label class="seg__opt">
        <input type="radio" name="fulfilment" value="delivery" {% if fulfilment == 'delivery' %}checked{% endif %}>
        <span>{% render 'icon', name: 'bike' %}<b>{{ 'cart.delivery' | t }}</b><small>{{ 'cart.delivery_sub' | t }}</small></span>
      </label>
    </div>
    <p class="xsmall muted" data-delivery-note {% if fulfilment != 'delivery' %}hidden{% endif %}>{{ settings.delivery_note }}</p>
    <p class="small fulfil__q">
      <span data-when="pickup" {% if fulfilment == 'delivery' %}hidden{% endif %}>{{ 'cart.time_pickup' | t }}</span>
      <span data-when="delivery" {% if fulfilment != 'delivery' %}hidden{% endif %}>{{ 'cart.time_delivery' | t }}</span>
    </p>
    <div class="days" data-days role="tablist"></div>
    <div class="times" data-times><p class="xsmall muted">{{ 'cart.loading' | t }}</p></div>
    <p class="xsmall fulfil__msg" data-slot-msg role="status"></p>
  </fulfilment-picker>
{%- elsif cart.item_count > 0 -%}
  <p class="xsmall muted">{{ 'cart.no_slot_needed' | t }}</p>
{%- endif -%}
`,"/repo/theme/snippets/icon.liquid":`{%- case name -%}
  {%- when 'arrow' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 4.5l5.5 5.5-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
  {%- when 'bag' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 7h11l-1 9.6a1.5 1.5 0 0 1-1.5 1.4H7a1.5 1.5 0 0 1-1.5-1.4L4.5 7zM7.5 7V5.5a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
  {%- when 'menu' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6.5h14M3 13.5h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
  {%- when 'close' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
  {%- when 'plus' -%}<svg class="icon icon--sm" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>
  {%- when 'minus' -%}<svg class="icon icon--sm" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>
  {%- when 'clock' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 6v4.2l2.8 1.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
  {%- when 'bike' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="5" cy="14" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="15" cy="14" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 14l3-6h5l2 6M8 8l3 6M11 5h2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  {%- when 'store' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8l1.5-4h11L17 8M3 8v8h14V8M3 8h14M8 16v-4h4v4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
  {%- when 'pin' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18s5.5-5.2 5.5-9.5a5.5 5.5 0 0 0-11 0C4.5 12.8 10 18 10 18z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="10" cy="8.5" r="2" fill="currentColor"/></svg>
  {%- when 'chat' -%}<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 16.5l1-3.2A6.5 6.5 0 1 1 7.6 16l-3.6.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
  {%- when 'sun' -%}<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="5" fill="var(--yolk)"/><path d="M12 3v3M4.2 6.2l2 2M19.8 6.2l-2 2M2 13h3M19 13h3M3 19h18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
{%- endcase -%}
`,"/repo/theme/snippets/language-switch.liquid":`{%- comment -%} EN / ID toggle through the localization form. - id {%- endcomment -%}
{%- if localization.available_languages.size > 1 -%}
  {%- assign form_id = id | append: '-lang' -%}
  {%- form 'localization', class: 'lang', id: form_id -%}
    <span class="visually-hidden">{{ 'general.language' | t }}</span>
    {%- for language in localization.available_languages -%}
      <button type="submit" name="locale_code" value="{{ language.iso_code }}" lang="{{ language.iso_code }}" {% if language.iso_code == localization.language.iso_code %}aria-current="true"{% endif %}>
        {{- language.iso_code | upcase -}}
      </button>
    {%- endfor -%}
  {%- endform -%}
{%- endif -%}
`,"/repo/theme/snippets/meta-tags.liquid":`<meta property="og:site_name" content="{{ shop.name }}">
<meta property="og:url" content="{{ canonical_url }}">
<meta property="og:title" content="{{ page_title | default: shop.name | escape }}">
<meta property="og:type" content="{% if request.page_type == 'product' %}product{% else %}website{% endif %}">
<meta property="og:description" content="{{ page_description | default: shop.description | escape }}">
{%- if request.page_type == 'product' and product.featured_media -%}
  <meta property="og:image" content="https:{{ product.featured_media | image_url: width: 1200 }}">
{%- endif -%}
<meta name="twitter:card" content="summary_large_image">
{%- if request.page_type == 'index' -%}
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "name": {{ shop.name | json }},
    "address": {{ settings.address | json }},
    "servesCuisine": "Brunch",
    "openingHours": "Mo-Su {{ settings.hours_open }}-{{ settings.hours_close }}",
    "url": {{ canonical_url | json }}
  }
<\/script>
{%- endif -%}
`,"/repo/theme/snippets/theme-tokens.liquid":`{%- comment -%}
  Setting-driven tokens, inline so they exist before base.css. The fallback serif is
  metric-adjusted so the swap to Fraunces doesn't move the layout.
{%- endcomment -%}
<style>
  @font-face {
    font-family: 'Fraunces';
    src: url('{{ 'fraunces-soft.woff2' | asset_url }}') format('woff2');
    font-weight: 100 900;
    font-display: swap;
  }
  @font-face {
    font-family: 'Fraunces Fallback';
    src: local('Georgia'), local('Times New Roman');
    size-adjust: 104%;
    ascent-override: 92%;
    descent-override: 24%;
    line-gap-override: 0%;
  }
  :root {
    --paper: {{ settings.color_paper }};
    --ink: {{ settings.color_ink }};
    --muted: {{ settings.color_muted }};
    --line: {{ settings.color_line }};
    --yolk: {{ settings.color_yolk }};
    --leaf: {{ settings.color_leaf }};
    --ink-rgb: {{ settings.color_ink.red }}, {{ settings.color_ink.green }}, {{ settings.color_ink.blue }};
  }
</style>
`,"/repo/theme/templates/404.json":`{
  "sections": { "main": { "type": "main-404", "settings": {} } },
  "order": ["main"]
}
`,"/repo/theme/templates/cart.json":`{
  "sections": { "main": { "type": "main-cart", "settings": {} } },
  "order": ["main"]
}
`,"/repo/theme/templates/collection.json":`{
  "sections": { "main": { "type": "main-collection", "settings": {} } },
  "order": ["main"]
}
`,"/repo/theme/templates/gift_card.liquid":`{%- comment -%} The page a gift card recipient opens from their email. {%- endcomment -%}
{%- layout none -%}
<!doctype html>
<html lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{{ shop.name }} gift card</title>
    {%- render 'theme-tokens' -%}
    {{ 'base.css' | asset_url | stylesheet_tag }}
    <script src="{{ 'vendor/qrcode.js' | shopify_asset_url }}" defer><\/script>
  </head>
  <body>
    <main class="section">
      <div class="container narrow stack center" style="--gap:18px;justify-items:center">
        <span class="wordmark wordmark--lg">{% render 'icon', name: 'sun' %}{{ settings.wordmark }}</span>
        <p class="d-1">{{ gift_card.balance | money }}</p>
        {%- if gift_card.expired or gift_card.enabled == false -%}<p class="muted">This gift card is no longer active.</p>{%- endif -%}
        <p class="card" style="font:600 1.4rem/1 ui-monospace,monospace;letter-spacing:.12em">{{ gift_card.code | format_code }}</p>
        <div id="QrCode" data-identifier="{{ gift_card.qr_identifier }}"></div>
        <p class="small muted">Show this at the counter, or use the code at checkout on {{ shop.url }}.</p>
        <a href="{{ shop.url }}" class="btn">Order brunch</a>
        {%- if gift_card.pass_url -%}<a href="{{ gift_card.pass_url }}" class="link small">Add to Apple Wallet</a>{%- endif -%}
      </div>
    </main>
    <script>
      window.addEventListener('load', () => {
        const el = document.getElementById('QrCode');
        if (window.QRCode) new QRCode(el, { text: el.dataset.identifier, width: 160, height: 160 });
      });
    <\/script>
  </body>
</html>
`,"/repo/theme/templates/index.json":`{
  "sections": {
    "hero": {
      "type": "hero",
      "settings": {
        "eyebrow": "Pererenan, Bali",
        "heading": "Brunch, ready when you are",
        "text": "Order ahead, pick a time, and collect at the counter. Or have it brought to your villa within 5 km.",
        "cta": "Order now",
        "cta_link": "#menu",
        "ready_hint": "Ready in about 20 minutes",
        "image": "shopify://shop_images/hero-pagi.png"
      }
    },
    "steps": {
      "type": "steps",
      "settings": { "heading": "Skip the queue" },
      "blocks": {
        "s1": { "type": "step", "settings": { "title": "Build your plate", "text": "Pick your eggs and bread, add bacon or avocado. Allergies go in the kitchen note." } },
        "s2": { "type": "step", "settings": { "title": "Choose a time", "text": "Every 15 minutes from 08:00. Times the kitchen can't cook for don't show up." } },
        "s3": { "type": "step", "settings": { "title": "Collect or relax", "text": "Your name is on the bag at the counter. Or a rider brings it to you." } }
      },
      "block_order": ["s1", "s2", "s3"]
    },
    "menu": {
      "type": "menu",
      "settings": {
        "heading": "The menu",
        "text": "Everything is cooked to order. Choose your eggs, your bread and what goes on top.",
        "categories": ["brunch-plates", "toasts", "bowls", "lunch", "drinks"]
      }
    },
    "beans": {
      "type": "band",
      "settings": {
        "tone": "clay",
        "eyebrow": "Take the coffee home",
        "heading": "The beans behind every flat white",
        "text": "Kintamani and Flores arabica, roasted weekly in Canggu. Ships across Indonesia.",
        "collection": "beans",
        "cta": "Shop beans",
        "link": "/collections/beans",
        "image": "shopify://shop_images/beans-kintamani.png"
      }
    },
    "gift": {
      "type": "band",
      "settings": {
        "tone": "yolk",
        "flip": true,
        "eyebrow": "Gift cards",
        "heading": "Brunch for someone else",
        "text": "Sent by email in a minute. Works online and at the counter.",
        "cta": "Send a gift card",
        "link": "/products/pagi-gift-card",
        "image": "shopify://shop_images/gift-card.png"
      }
    },
    "catering": {
      "type": "band",
      "settings": {
        "tone": "leaf",
        "eyebrow": "Catering",
        "heading": "Brunch for the whole villa",
        "text": "Shared boards and a coffee cart for 15 to 120 guests. Ask for a quote; pay the deposit online.",
        "cta": "Plan an event",
        "link": "/pages/catering",
        "image": "shopify://shop_images/platter.png"
      }
    }
  },
  "order": ["hero", "steps", "menu", "beans", "gift", "catering"]
}
`,"/repo/theme/templates/page.catering.json":`{
  "sections": {
    "main": {
      "type": "main-catering",
      "settings": {
        "eyebrow": "Villas, retreats, offsites",
        "heading": "Brunch for the whole villa",
        "text": "From 15 to 120 guests, set up and cleared by our team anywhere between Canggu and Seseh.",
        "endpoint": "/apps/pagi/catering",
        "min_days": 3,
        "min_guests": 15
      },
      "blocks": {
        "p1": {
          "type": "package",
          "settings": {
            "key": "brunch-board",
            "title": "Brunch boards",
            "text": "Sourdough, eggs two ways, smashed avo, roast vegetables, fruit and pastries on shared boards.",
            "per_guest": 145000
          }
        },
        "p2": {
          "type": "package",
          "settings": {
            "key": "coffee-cart",
            "title": "Coffee cart",
            "text": "A barista and our espresso cart for three hours: flat whites, iced lattes, matcha and jamu.",
            "per_guest": 65000
          }
        },
        "p3": {
          "type": "package",
          "settings": {
            "key": "brunch-and-coffee",
            "title": "Brunch boards + coffee cart",
            "text": "Both, for villa mornings, retreats and team offsites.",
            "per_guest": 195000
          }
        }
      },
      "block_order": [
        "p1",
        "p2",
        "p3"
      ]
    }
  },
  "order": [
    "main"
  ]
}
`,"/repo/theme/templates/page.json":`{
  "sections": { "main": { "type": "main-page", "settings": {} } },
  "order": ["main"]
}
`,"/repo/theme/templates/product.json":`{
  "sections": { "main": { "type": "main-product", "settings": {} } },
  "order": ["main"]
}
`,"/repo/scripts/catalog.json":`{
  "shop": {
    "name": "Pagi",
    "tagline": "Brunch in Pererenan, ready when you are",
    "address": "Jl. Pantai Pererenan No. 8, Pererenan, Bali",
    "whatsapp": "+62 812 0000 0000",
    "timezone": "Asia/Makassar",
    "currency": "IDR",
    "hours": {
      "open": "08:00",
      "close": "16:00",
      "kitchen_close": "15:30"
    },
    "slot_minutes": 15,
    "lead_minutes": 20,
    "days_ahead": 2,
    "dishes_per_slot": 12,
    "delivery_radius_km": 5,
    "tax_note": "Prices include 10% PB1 tax. No service charge on pickup and delivery."
  },
  "categories": [
    {
      "handle": "brunch-plates",
      "title": "Brunch plates",
      "title_id": "Paket brunch"
    },
    {
      "handle": "toasts",
      "title": "On toast",
      "title_id": "Roti panggang"
    },
    {
      "handle": "bowls",
      "title": "Bowls",
      "title_id": "Bowl"
    },
    {
      "handle": "lunch",
      "title": "Lunch",
      "title_id": "Makan siang"
    },
    {
      "handle": "drinks",
      "title": "Coffee & drinks",
      "title_id": "Kopi & minuman"
    }
  ],
  "addons": [
    {
      "handle": "addon-egg",
      "title": "Extra egg",
      "title_id": "Tambah telur",
      "price": 8000
    },
    {
      "handle": "addon-bacon",
      "title": "Bacon",
      "title_id": "Bacon",
      "price": 25000
    },
    {
      "handle": "addon-salmon",
      "title": "Smoked salmon",
      "title_id": "Salmon asap",
      "price": 35000
    },
    {
      "handle": "addon-avocado",
      "title": "Avocado",
      "title_id": "Alpukat",
      "price": 20000
    },
    {
      "handle": "addon-halloumi",
      "title": "Grilled halloumi",
      "title_id": "Halloumi panggang",
      "price": 28000
    },
    {
      "handle": "addon-tempeh",
      "title": "Crispy tempeh",
      "title_id": "Tempe renyah",
      "price": 15000
    },
    {
      "handle": "addon-gf-bread",
      "title": "Gluten-free bread",
      "title_id": "Roti bebas gluten",
      "price": 15000
    },
    {
      "handle": "addon-oat-milk",
      "title": "Oat milk",
      "title_id": "Susu oat",
      "price": 8000
    },
    {
      "handle": "addon-almond-milk",
      "title": "Almond milk",
      "title_id": "Susu almond",
      "price": 10000
    },
    {
      "handle": "addon-extra-shot",
      "title": "Extra shot",
      "title_id": "Tambah shot",
      "price": 8000
    },
    {
      "handle": "addon-protein",
      "title": "Plant protein",
      "title_id": "Protein nabati",
      "price": 30000
    },
    {
      "handle": "addon-mushroom",
      "title": "Saut\xE9ed mushrooms",
      "title_id": "Jamur tumis",
      "price": 18000
    },
    {
      "handle": "addon-beet-hummus",
      "title": "Beet hummus",
      "title_id": "Hummus bit",
      "price": 15000
    }
  ],
  "groups": {
    "eggs": {
      "title": "Eggs",
      "title_id": "Telur",
      "min": 1,
      "max": 1,
      "options": [
        {
          "label": "Scrambled",
          "label_id": "Orak-arik"
        },
        {
          "label": "Fried",
          "label_id": "Ceplok"
        },
        {
          "label": "Poached",
          "label_id": "Rebus pecah"
        }
      ]
    },
    "bread": {
      "title": "Bread",
      "title_id": "Roti",
      "min": 1,
      "max": 1,
      "options": [
        {
          "label": "Sourdough",
          "label_id": "Sourdough"
        },
        {
          "label": "Gluten-free",
          "label_id": "Bebas gluten",
          "addon": "addon-gf-bread"
        }
      ]
    },
    "add_protein": {
      "title": "Add protein",
      "title_id": "Tambah protein",
      "min": 0,
      "max": 3,
      "options": [
        {
          "addon": "addon-egg"
        },
        {
          "addon": "addon-bacon"
        },
        {
          "addon": "addon-salmon"
        },
        {
          "addon": "addon-halloumi"
        },
        {
          "addon": "addon-tempeh"
        }
      ]
    },
    "add_greens": {
      "title": "Add more",
      "title_id": "Tambah lagi",
      "min": 0,
      "max": 3,
      "options": [
        {
          "addon": "addon-avocado"
        },
        {
          "addon": "addon-mushroom"
        },
        {
          "addon": "addon-beet-hummus"
        }
      ]
    },
    "milk": {
      "title": "Milk",
      "title_id": "Susu",
      "min": 1,
      "max": 1,
      "options": [
        {
          "label": "Full cream",
          "label_id": "Susu sapi"
        },
        {
          "addon": "addon-oat-milk"
        },
        {
          "addon": "addon-almond-milk"
        }
      ]
    },
    "coffee_extra": {
      "title": "Make it stronger",
      "title_id": "Lebih kuat",
      "min": 0,
      "max": 1,
      "options": [
        {
          "addon": "addon-extra-shot"
        }
      ]
    },
    "bowl_boost": {
      "title": "Boost it",
      "title_id": "Tambahan",
      "min": 0,
      "max": 2,
      "options": [
        {
          "addon": "addon-protein"
        },
        {
          "addon": "addon-avocado"
        }
      ]
    },
    "platter_base": {
      "title": "Choose a base",
      "title_id": "Pilih dasar",
      "min": 1,
      "max": 1,
      "options": [
        {
          "label": "Sourdough",
          "label_id": "Sourdough"
        },
        {
          "label": "Turmeric rice",
          "label_id": "Nasi kunyit"
        },
        {
          "label": "Gluten-free bread",
          "label_id": "Roti bebas gluten",
          "addon": "addon-gf-bread"
        }
      ]
    },
    "platter_sides": {
      "title": "Pick three sides",
      "title_id": "Pilih tiga lauk",
      "min": 3,
      "max": 3,
      "options": [
        {
          "label": "Smashed avo",
          "label_id": "Alpukat hancur"
        },
        {
          "label": "Roast tomato",
          "label_id": "Tomat panggang"
        },
        {
          "label": "Garlic greens",
          "label_id": "Sayur bawang putih"
        },
        {
          "label": "Two eggs your way",
          "label_id": "Dua telur"
        },
        {
          "label": "Saut\xE9ed mushrooms",
          "label_id": "Jamur tumis"
        },
        {
          "label": "Beet hummus",
          "label_id": "Hummus bit"
        }
      ]
    },
    "platter_premium": {
      "title": "Premium extras",
      "title_id": "Tambahan premium",
      "min": 0,
      "max": 3,
      "options": [
        {
          "addon": "addon-bacon"
        },
        {
          "addon": "addon-salmon"
        },
        {
          "addon": "addon-halloumi"
        }
      ]
    }
  },
  "menu": [
    {
      "handle": "the-pagi-plate",
      "title": "The Pagi Plate",
      "title_id": "Piring Pagi",
      "category": "brunch-plates",
      "price": 125000,
      "diet": [],
      "art": "plate-full",
      "description": "Two eggs, smoked bacon, roast tomato, saut\xE9ed mushrooms, garlic greens and sourdough.",
      "description_id": "Dua telur, bacon asap, tomat panggang, jamur tumis, sayur bawang putih dan sourdough.",
      "groups": [
        "eggs",
        "bread",
        "add_protein",
        "add_greens"
      ]
    },
    {
      "handle": "green-garden-plate",
      "title": "Green Garden Plate",
      "title_id": "Piring Kebun Hijau",
      "category": "brunch-plates",
      "price": 115000,
      "diet": [
        "vg"
      ],
      "art": "plate-green",
      "description": "Crispy tempeh, smashed avo, beet hummus, garlic greens and turmeric potatoes.",
      "description_id": "Tempe renyah, alpukat hancur, hummus bit, sayur bawang putih dan kentang kunyit.",
      "groups": [
        "bread",
        "add_greens"
      ]
    },
    {
      "handle": "build-your-platter",
      "title": "Build your platter",
      "title_id": "Racik platter sendiri",
      "category": "brunch-plates",
      "price": 95000,
      "diet": [
        "v"
      ],
      "art": "platter",
      "featured": true,
      "description": "A base, three sides, and anything extra you like. Made for sharing or very hungry mornings.",
      "description_id": "Satu dasar, tiga lauk, dan tambahan sesukamu. Untuk berbagi atau pagi yang sangat lapar.",
      "groups": [
        "platter_base",
        "platter_sides",
        "platter_premium"
      ]
    },
    {
      "handle": "avo-smash",
      "title": "Avo Smash",
      "title_id": "Alpukat Hancur",
      "category": "toasts",
      "price": 85000,
      "diet": [
        "v"
      ],
      "art": "toast-avo",
      "description": "Smashed avocado, lime, chilli flakes, feta and seeds on sourdough.",
      "description_id": "Alpukat hancur, jeruk nipis, cabai, feta dan biji-bijian di atas sourdough.",
      "groups": [
        "bread",
        "add_protein"
      ]
    },
    {
      "handle": "salmon-dill-toast",
      "title": "Salmon & Dill Toast",
      "title_id": "Roti Salmon & Dill",
      "category": "toasts",
      "price": 98000,
      "diet": [],
      "art": "toast-salmon",
      "description": "Smoked salmon, whipped cream cheese, pickled shallot and dill.",
      "description_id": "Salmon asap, krim keju kocok, bawang acar dan dill.",
      "groups": [
        "bread",
        "add_protein"
      ]
    },
    {
      "handle": "mushroom-miso-toast",
      "title": "Mushroom Miso Toast",
      "title_id": "Roti Jamur Miso",
      "category": "toasts",
      "price": 88000,
      "diet": [
        "vg"
      ],
      "art": "toast-mushroom",
      "description": "Shimeji and oyster mushrooms in miso butter, chives and sesame.",
      "description_id": "Jamur shimeji dan tiram dengan mentega miso, kucai dan wijen.",
      "groups": [
        "bread",
        "add_protein"
      ]
    },
    {
      "handle": "dragon-fruit-bowl",
      "title": "Dragon Fruit Bowl",
      "title_id": "Bowl Buah Naga",
      "category": "bowls",
      "price": 85000,
      "diet": [
        "vg",
        "gf"
      ],
      "art": "bowl-pink",
      "description": "Dragon fruit and banana, topped with granola, coconut, kiwi and passionfruit.",
      "description_id": "Buah naga dan pisang dengan granola, kelapa, kiwi dan markisa.",
      "groups": [
        "bowl_boost"
      ]
    },
    {
      "handle": "green-machine-bowl",
      "title": "Green Machine Bowl",
      "title_id": "Bowl Hijau",
      "category": "bowls",
      "price": 88000,
      "diet": [
        "vg",
        "gf"
      ],
      "art": "bowl-green",
      "description": "Spinach, mango and moringa, with granola, cacao nibs and bee pollen.",
      "description_id": "Bayam, mangga dan kelor, dengan granola, cacao nibs dan bee pollen.",
      "groups": [
        "bowl_boost"
      ]
    },
    {
      "handle": "nourish-bowl",
      "title": "Nourish Bowl",
      "title_id": "Bowl Bergizi",
      "category": "lunch",
      "price": 110000,
      "diet": [
        "vg",
        "gf"
      ],
      "art": "bowl-grain",
      "description": "Red rice, roast pumpkin, edamame, pickled cabbage and peanut sambal.",
      "description_id": "Nasi merah, labu panggang, edamame, kubis acar dan sambal kacang.",
      "groups": [
        "add_protein",
        "add_greens"
      ]
    },
    {
      "handle": "chicken-pesto-ciabatta",
      "title": "Chicken Pesto Ciabatta",
      "title_id": "Ciabatta Ayam Pesto",
      "category": "lunch",
      "price": 105000,
      "diet": [],
      "art": "sandwich",
      "description": "Grilled chicken, basil pesto, mozzarella and rocket in toasted ciabatta.",
      "description_id": "Ayam panggang, pesto kemangi, mozzarella dan rocket dalam ciabatta panggang.",
      "groups": [
        "add_greens"
      ]
    },
    {
      "handle": "flat-white",
      "title": "Flat white",
      "title_id": "Flat white",
      "category": "drinks",
      "price": 38000,
      "diet": [
        "v"
      ],
      "art": "cup-flat-white",
      "description": "Double ristretto of our Kintamani house blend with silky milk.",
      "description_id": "Double ristretto racikan Kintamani kami dengan susu lembut.",
      "groups": [
        "milk",
        "coffee_extra"
      ]
    },
    {
      "handle": "iced-matcha-latte",
      "title": "Iced matcha latte",
      "title_id": "Matcha latte dingin",
      "category": "drinks",
      "price": 52000,
      "diet": [
        "v"
      ],
      "art": "cup-matcha",
      "description": "Ceremonial-grade matcha whisked to order, over ice.",
      "description_id": "Matcha kualitas seremonial dikocok saat dipesan, dengan es.",
      "groups": [
        "milk"
      ]
    },
    {
      "handle": "jamu-shot",
      "title": "Jamu shot",
      "title_id": "Jamu",
      "category": "drinks",
      "price": 35000,
      "diet": [
        "vg",
        "gf"
      ],
      "art": "cup-jamu",
      "description": "Fresh turmeric, ginger, tamarind and palm sugar, pressed every morning.",
      "description_id": "Kunyit, jahe, asam dan gula aren segar, diperas setiap pagi.",
      "groups": []
    }
  ],
  "beans": [
    {
      "handle": "kintamani-house-blend",
      "title": "Kintamani house blend",
      "title_id": "Racikan Kintamani",
      "art": "beans-kintamani",
      "description": "The coffee in every flat white we pour. Natural-process arabica from Kintamani: brown sugar, orange, cocoa.",
      "description_id": "Kopi di setiap flat white kami. Arabika proses natural dari Kintamani: gula merah, jeruk, kakao.",
      "variants": [
        {
          "size": "250 g",
          "price": 145000,
          "grams": 250
        },
        {
          "size": "1 kg",
          "price": 495000,
          "grams": 1000
        }
      ]
    },
    {
      "handle": "flores-bajawa",
      "title": "Flores Bajawa single origin",
      "title_id": "Single origin Flores Bajawa",
      "art": "beans-bajawa",
      "description": "Washed arabica from the Bajawa highlands: jasmine, lime, black tea.",
      "description_id": "Arabika proses washed dari dataran tinggi Bajawa: melati, jeruk nipis, teh hitam.",
      "variants": [
        {
          "size": "250 g",
          "price": 165000,
          "grams": 250
        }
      ]
    }
  ],
  "gift_card": {
    "handle": "pagi-gift-card",
    "title": "Pagi gift card",
    "title_id": "Kartu hadiah Pagi",
    "art": "gift-card",
    "denominations": [
      100000,
      250000,
      500000
    ]
  },
  "catering": {
    "min_days_ahead": 3,
    "min_guests": 15,
    "max_guests": 120,
    "packages": [
      {
        "key": "brunch-board",
        "title": "Brunch boards",
        "title_id": "Papan brunch",
        "per_guest": 145000,
        "description": "Sourdough, eggs two ways, smashed avo, roast vegetables, fruit and pastries on shared boards.",
        "description_id": "Sourdough, telur dua cara, alpukat, sayur panggang, buah dan pastry di papan bersama."
      },
      {
        "key": "coffee-cart",
        "title": "Coffee cart",
        "title_id": "Gerobak kopi",
        "per_guest": 65000,
        "description": "A barista and our espresso cart for three hours: flat whites, iced lattes, matcha and jamu.",
        "description_id": "Barista dan gerobak espresso kami selama tiga jam: flat white, es latte, matcha dan jamu."
      },
      {
        "key": "brunch-and-coffee",
        "title": "Brunch boards + coffee cart",
        "title_id": "Papan brunch + gerobak kopi",
        "per_guest": 195000,
        "description": "Both, for villa mornings, retreats and team offsites.",
        "description_id": "Keduanya, untuk pagi di vila, retreat dan acara tim."
      }
    ]
  }
}
`,"/repo/preview/content.id.json":`{
  "Pererenan, Bali": "Pererenan, Bali",
  "Brunch, ready when you are": "Brunch, siap saat kamu datang",
  "Order ahead, pick a time, and collect at the counter. Or have it brought to your villa within 5 km.": "Pesan duluan, pilih jam, lalu ambil di kasir. Atau kami antar ke vilamu dalam radius 5 km.",
  "Order now": "Pesan sekarang",
  "Ready in about 20 minutes": "Siap dalam sekitar 20 menit",
  "Skip the queue": "Tanpa antre",
  "Build your plate": "Racik piringmu",
  "Pick your eggs and bread, add bacon or avocado. Allergies go in the kitchen note.": "Pilih telur dan roti, tambah bacon atau alpukat. Alergi tulis di catatan dapur.",
  "Choose a time": "Pilih jam",
  "Every 15 minutes from 08:00. Times the kitchen can't cook for don't show up.": "Setiap 15 menit mulai 08:00. Jam yang dapur tidak sanggup tidak akan muncul.",
  "Collect or relax": "Ambil atau santai saja",
  "Your name is on the bag at the counter. Or a rider brings it to you.": "Namamu ada di kantong di kasir. Atau kurir mengantarkannya.",
  "The menu": "Menu",
  "Everything is cooked to order. Choose your eggs, your bread and what goes on top.": "Semua dimasak saat dipesan. Pilih telur, roti, dan topping-nya.",
  "Take the coffee home": "Bawa pulang kopinya",
  "The beans behind every flat white": "Biji kopi di balik setiap flat white",
  "Kintamani and Flores arabica, roasted weekly in Canggu. Ships across Indonesia.": "Arabika Kintamani dan Flores, disangrai setiap minggu di Canggu. Dikirim ke seluruh Indonesia.",
  "Shop beans": "Beli biji kopi",
  "Gift cards": "Kartu hadiah",
  "Brunch for someone else": "Brunch untuk orang tersayang",
  "Sent by email in a minute. Works online and at the counter.": "Dikirim lewat email dalam semenit. Bisa dipakai online dan di kasir.",
  "Send a gift card": "Kirim kartu hadiah",
  "Catering": "Katering",
  "Brunch for the whole villa": "Brunch untuk satu vila",
  "Shared boards and a coffee cart for 15 to 120 guests. Ask for a quote; pay the deposit online.": "Papan sajian dan gerobak kopi untuk 15 sampai 120 tamu. Minta penawaran; bayar DP online.",
  "Plan an event": "Rencanakan acara",
  "Villas, retreats, offsites": "Vila, retreat, acara kantor",
  "From 15 to 120 guests, set up and cleared by our team anywhere between Canggu and Seseh.": "Untuk 15 sampai 120 tamu, disiapkan dan dibereskan tim kami di mana saja antara Canggu dan Seseh.",
  "Brunch boards": "Papan brunch",
  "Sourdough, eggs two ways, smashed avo, roast vegetables, fruit and pastries on shared boards.": "Sourdough, telur dua cara, alpukat, sayur panggang, buah dan pastry di papan bersama.",
  "Coffee cart": "Gerobak kopi",
  "A barista and our espresso cart for three hours: flat whites, iced lattes, matcha and jamu.": "Barista dan gerobak espresso kami selama tiga jam: flat white, es latte, matcha dan jamu.",
  "Brunch boards + coffee cart": "Papan brunch + gerobak kopi",
  "Both, for villa mornings, retreats and team offsites.": "Keduanya, untuk pagi di vila, retreat dan acara tim.",
  "Brunch and specialty coffee in Pererenan. Order ahead, skip the queue.": "Brunch dan kopi spesialti di Pererenan. Pesan duluan, tanpa antre.",
  "Within 5 km of Pererenan. The delivery fee is added at checkout from your address.": "Dalam radius 5 km dari Pererenan. Ongkir dihitung saat checkout dari alamatmu.",
  "Prices include 10% PB1 tax. No service charge.": "Harga sudah termasuk pajak PB1 10%. Tanpa service charge."
}
`,"/repo/design/out/beans-bajawa.png":"","/repo/design/out/beans-kintamani.png":"","/repo/design/out/bowl-grain.png":"","/repo/design/out/bowl-green.png":"","/repo/design/out/bowl-pink.png":"","/repo/design/out/cup-flat-white.png":"","/repo/design/out/cup-jamu.png":"","/repo/design/out/cup-matcha.png":"","/repo/design/out/gift-card.png":"","/repo/design/out/hero-pagi.png":"","/repo/design/out/plate-full.png":"","/repo/design/out/plate-green.png":"","/repo/design/out/platter.png":"","/repo/design/out/sandwich.png":"","/repo/design/out/toast-avo.png":"","/repo/design/out/toast-mushroom.png":"","/repo/design/out/toast-salmon.png":""};var Se=L,jt=t=>t instanceof URL?t.pathname:String(t).replace(/^file:\/\//,""),Ve=t=>{let e=jt(t);if(!(e in Se)){let n=new Error(`ENOENT: ${e}`);throw n.code="ENOENT",n}return Se[e]},K=t=>Ve(t),Ie=t=>jt(t)in Se,Ft=async t=>Ve(t),ri=t=>(String(t).match(/\.[^./]*$/)||[""])[0],Lt=t=>jt(t),Pt=null,ai=t=>(Pt=t,{listen:()=>{}});globalThis.process??={env:{}};globalThis.Buffer??={concat:t=>{let e=new Uint8Array(t.reduce((i,s)=>i+s.length,0)),n=0;for(let i of t)e.set(i,n),n+=i.length;return{toString:()=>new TextDecoder().decode(e)}}};var oi={sep:"/",dirname:t=>t.replace(/\/[^/]*$/,""),resolve:(t,e,n)=>{let i=e.endsWith(n)?e:e+n;return i.startsWith("/")?i:`${t.replace(/\/$/,"")}/${i}`},contains:(t,e)=>e.startsWith(t),exists:async t=>t in Se,existsSync:t=>t in Se,readFile:async t=>Ve(t),readFileSync:t=>Ve(t)};var q=class{constructor(e,n,i,s,r){this.kind=e,this.input=n,this.begin=i,this.end=s,this.file=r}getText(){return this.input.slice(this.begin,this.end)}getPosition(){let[e,n]=[1,1];for(let i=0;i<this.begin;i++)this.input[i]===`
`?(e++,n=1):n++;return[e,n]}size(){return this.end-this.begin}},A=class{liquidMethodMissing(e,n){}},Is=Object.prototype.toString,li=String.prototype.toLowerCase,ut=Object.hasOwnProperty;function g(t){return typeof t=="string"}function S(t){return typeof t=="function"}function Us(t){return t&&S(t.then)}function Ge(t){return t&&S(t.next)&&S(t.throw)&&S(t.return)}function h(t){return t=m(t),g(t)?t:x(t)?"":T(t)?t.map(e=>h(e)).join(""):String(t)}function Ae(t,e,n){if(e<0&&(e=t.length+e),!(n&&!ut.call(t,e)))return t[e]}function Me(t){return t=m(t),T(t)?t:g(t)&&t.length>0?[t]:Hs(t)?Array.from(t):ht(t)?Object.keys(t).map(e=>[e,t[e]]):[]}function F(t){return t=m(t),x(t)?[]:T(t)?t:[t]}function m(t){return t instanceof A&&S(t.valueOf)?t.valueOf():t}function qt(t){return+m(t)||0}function Be(t){return typeof t=="number"}function Li(t){return t&&S(t.toLiquid)?Li(t.toLiquid()):t}function x(t){return t==null}function Ws(t){return t===void 0}function T(t){return Is.call(t)==="[object Array]"}function Pi(t){return t&&Be(t.length)}function Hs(t){return ht(t)&&Symbol.iterator in t}function ci(t,e){t=t||{};for(let n in t)if(ut.call(t,n)&&e(t[n],n,t)===!1)break;return t}function Js(t){return t[t.length-1]}function ht(t){let e=typeof t;return t!==null&&(e==="object"||e==="function")}function Ci(t,e,n=1){let i=[];for(let s=t;s<e;s+=n)i.push(s);return i}function me(t,e,n=" "){return qi(t,e,n,(i,s)=>s+i)}function Gs(t,e,n=" "){return qi(t,e,n,(i,s)=>i+s)}function qi(t,e,n,i){t=String(t);let s=e-t.length;return s<=0?t:i(t,n.repeat(s))}function Ai(t){return t}function Ys(t){return[...t].some(n=>n>="a"&&n<="z")?t.toUpperCase():t.toLowerCase()}function Ks(t,e){return t.length>e?t.slice(0,e-3)+"...":t}function Qs(t,e){return x(t)&&x(e)?0:x(t)?1:x(e)||t<e?-1:t>e?1:0}function Zs(t,e){return x(t)&&x(e)?0:x(t)?1:x(e)||(t=li.call(t),e=li.call(e),t<e)?-1:t>e?1:0}function pt(t){return function(...e){return t.call(this,...e.map(m))}}function I(t){return function(...e){return t.call(this,...e.map(qt))}}function*Ue(t){let e=new Set;for(let n of t){let i=JSON.stringify(n);e.has(i)||(e.add(i),yield n)}}var di="__liquidClass__",G=class extends Error{constructor(e,n){super(typeof e=="string"?e:e.message),this.context="",typeof e!="string"&&Object.defineProperty(this,"originalError",{value:e,enumerable:!1}),Object.defineProperty(this,"token",{value:n,enumerable:!1}),Object.defineProperty(this,di,{value:"LiquidError",enumerable:!1})}update(){Object.defineProperty(this,"context",{value:Xs(this.token),enumerable:!1}),this.message=er(this.message,this.token),this.stack=this.message+`
`+this.context+`
`+this.stack,this.originalError&&(this.stack+=`
From `+this.originalError.stack)}static is(e){return e?.[di]==="LiquidError"}},At=class extends G{constructor(e,n){super(e,n),this.name="TokenizationError",super.update()}},Mt=class extends G{constructor(e,n){super(e,n),this.name="ParseError",this.message=e.message,super.update()}},Bt=class extends G{constructor(e,n){super(e,n.token),this.name="RenderError",this.message=e.message,super.update()}static is(e){return e.name==="RenderError"}},Ye=class extends G{constructor(e){super(e[0],e[0].token),this.errors=e,this.name="LiquidErrors";let n=e.length>1?"s":"";this.message=`${e.length} error${n} found`,super.update()}static is(e){return e.name==="LiquidErrors"}},Rt=class extends G{constructor(e,n){super(e,n),this.name="UndefinedVariableError",this.message=e.message,super.update()}},Nt=class extends Error{constructor(e){super(`undefined variable: ${e}`),this.name="InternalUndefinedVariableError",this.variableName=e}},zt=class extends Error{constructor(e){super(e),this.name="AssertionError",this.message=e+""}};function Xs(t){let[e,n]=t.getPosition(),i=t.input.split(`
`),s=Math.max(e-2,1),r=Math.min(e+3,i.length);return Ci(s,r+1).map(o=>{let l=o===e?">> ":"   ",c=me(String(o),String(r).length),d=`${l}${c}| `,u=o===e?`
`+me("^",n+d.length):"";return d+=i[o-1],d+=u,d}).join(`
`)}function er(t,e){e.file&&(t+=`, file:${e.file}`);let[n,i]=e.getPosition();return t+=`, line:${n}, col:${i}`,t}var _=[0,0,0,0,0,0,0,0,0,20,4,4,4,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,2,8,0,0,0,0,8,0,0,0,64,0,65,0,0,33,33,33,33,33,33,33,33,33,33,0,0,2,2,2,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],tr=1,ge=4,ui=8,Mi=16,nr=32,ir=64,sr=128;function We(t){let e=t.charCodeAt(0);return e>=128?!_[e]:!!(_[e]&tr)}_[160]=_[5760]=_[6158]=_[8192]=_[8193]=_[8194]=_[8195]=_[8196]=_[8197]=_[8198]=_[8199]=_[8200]=_[8201]=_[8202]=_[8232]=_[8233]=_[8239]=_[8287]=_[12288]=ge;_[8220]=_[8221]=sr;function O(t,e){if(!t){let n=typeof e=="function"?e():e||`expect ${t} to be true`;throw new zt(n)}}function Ke(t,e=`unexpected ${JSON.stringify(t)}`){O(!t,e)}var Et=class extends A{*equals(e){return x(yield m(e))}gt(){return!1}geq(){return!1}lt(){return!1}leq(){return!1}valueOf(){return null}},je=class t extends A{*equals(e){return e instanceof t?!1:(e=yield m(e),g(e)||T(e)?e.length===0:ht(e)?Object.keys(e).length===0:!1)}gt(){return!1}geq(){return!1}lt(){return!1}leq(){return!1}valueOf(){return""}static is(e){return e instanceof t}},Dt=class t extends je{*equals(e){return e===!1||x(yield m(e))?!0:g(e)?/^\s*$/.test(e):yield super.equals(e)}static is(e){return e instanceof t}},Fe=class extends A{constructor(e,n,i){super(),this.i=0,this.length=e,this.name=`${i}-${n}`}next(){this.i++}index0(){return this.i}index(){return this.i+1}first(){return this.i===0}last(){return this.i===this.length-1}rindex(){return this.length-this.i}rindex0(){return this.length-this.i-1}valueOf(){return JSON.stringify(this)}},Qe=class{constructor(){this.buffer=""}write(e){this.buffer+=h(e)}},Vt=class{constructor(){throw this.buffer="",this.stream=null,new Error("streaming not supported in browser")}},It=class{constructor(){this.buffer=""}write(e){e=m(e),typeof e!="string"&&this.buffer===""?this.buffer=e:this.buffer=h(this.buffer)+h(e)}},Ze=class extends A{constructor(e=()=>""){super(),this.superBlockRender=e}*super(){let e=new Qe;return yield this.superBlockRender(e),e.buffer}};function V(t){return t&&S(t.equals)&&S(t.gt)&&S(t.geq)&&S(t.lt)&&S(t.leq)}var hi=new Et,Bi={true:!0,false:!1,nil:hi,null:hi,empty:new je,blank:new Dt},pi=new WeakMap;function fi(t){let e=pi.get(t);if(e)return e;let n={};for(let[i,s]of Object.entries(t)){let r=n;for(let a=0;a<i.length;a++){let o=i[a];r[o]=r[o]||{},a===i.length-1&&We(i[a])&&(r[o].needBoundary=!0),r=r[o]}r.data=s,r.end=!0}return pi.set(t,n),n}var Xe=function(){return Xe=Object.assign||function(e){for(var n,i=1,s=arguments.length;i<s;i++){n=arguments[i];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},Xe.apply(this,arguments)};function w(t,e,n,i){function s(r){return r instanceof n?r:new n(function(a){a(r)})}return new(n||(n=Promise))(function(r,a){function o(d){try{c(i.next(d))}catch(u){a(u)}}function l(d){try{c(i.throw(d))}catch(u){a(u)}}function c(d){d.done?r(d.value):s(d.value).then(o,l)}c((i=i.apply(t,e||[])).next())})}function Ut(t,e){let n=e||t;return(i,...s)=>i?n(...s):t(...s)}function W(t){return w(this,void 0,void 0,function*(){if(!Ge(t))return t;let e,n=!1,i="next";do{let s=t[i](e);n=!!s.done,e=s.value,i="next";try{Ge(e)&&(e=W(e)),Us(e)&&(e=yield e)}catch(r){i="throw",e=r}}while(!n);return e})}function H(t){if(!Ge(t))return t;let e,n=!1,i="next";do{let s=t[i](e);if(n=!!s.done,e=s.value,i="next",Ge(e))try{e=H(e)}catch(r){i="throw",e=r}}while(!n);return e}var rr=/%([-_0^#:]+)?(\d+)?([EO])?(.)/;function ar(t){return[31,or(t)?29:28,31,30,31,30,31,31,30,31,30,31]}function Ri(t){let e=0;for(let n=0;n<t.getMonth();++n)e+=ar(t)[n];return e+t.getDate()}function mi(t,e){let n=(t.getDay()-e+7)%7;return String(Math.floor((Ri(t)-1-n+7)/7))}function or(t){let e=t.getFullYear();return!!((e&3)===0&&(e%100||e%400===0&&e))}function lr(t){let e=t.getDate();if([11,12,13].includes(e))return"th";switch(e%10){case 1:return"st";case 2:return"nd";case 3:return"rd";default:return"th"}}function cr(t){return Math.floor(t.getFullYear()/100)}var dr={C:2,d:2,e:2,H:2,I:2,j:3,k:2,l:2,L:3,m:2,M:2,S:2,U:2,W:2,y:2},ur=new Set("aAbBceklpP");function gi(t,e){let n=Math.abs(t.getTimezoneOffset()),i=Math.floor(n/60),s=n%60;return(t.getTimezoneOffset()>0?"-":"+")+me(i,2,"0")+(e.flags[":"]?":":"")+me(s,2,"0")}var Wt={a:t=>t.getShortWeekdayName(),A:t=>t.getLongWeekdayName(),b:t=>t.getShortMonthName(),B:t=>t.getLongMonthName(),c:t=>t.toLocaleString(),C:t=>cr(t),d:t=>t.getDate(),e:t=>t.getDate(),H:t=>t.getHours(),I:t=>String(t.getHours()%12||12),j:t=>Ri(t),k:t=>t.getHours(),l:t=>String(t.getHours()%12||12),L:t=>t.getMilliseconds(),m:t=>t.getMonth()+1,M:t=>t.getMinutes(),N:(t,e)=>{var n;let i=Number(e.width)||9,s=me(String(t.getMilliseconds()),3,"0").slice(0,i);return(n=e.memoryLimit)===null||n===void 0||n.use(i-s.length),Gs(s,i,"0")},p:t=>t.getHours()<12?"AM":"PM",P:t=>t.getHours()<12?"am":"pm",q:t=>lr(t),s:t=>Math.floor(t.dateValue()/1e3),S:t=>t.getSeconds(),u:t=>t.getDay()||7,U:t=>mi(t,0),w:t=>t.getDay(),W:t=>mi(t,1),x:t=>t.toLocaleDateString(),X:t=>t.toLocaleTimeString(),y:t=>(t.getFullYear()%100+100)%100,Y:t=>t.getFullYear(),z:gi,Z:(t,e)=>t.getTimeZoneName()||gi(t,e),t:()=>"	",n:()=>`
`,"%":()=>"%"};Wt.h=Wt.b;function He(t,e,n){let i="",s=e,r;for(;r=rr.exec(s);)i+=s.slice(0,r.index),s=s.slice(r.index+r[0].length),i+=hr(t,r,n);return i+s}function hr(t,e,n){let[i,s="",r,a,o]=e,l=Wt[o];if(!l)return i;let c={};for(let f of s)c[f]=!0;let d=String(l(t,{flags:c,width:r,modifier:a,memoryLimit:n})),u=ur.has(o)?" ":"0",p=Number(r)||dr[o]||0;return c["^"]?d=d.toUpperCase():c["#"]&&(d=Ys(d)),c._?u=" ":c[0]&&(u="0"),c["-"]&&(p=0),n?.use(Number(p)-d.length),me(d,p,u)}function Ni(){return typeof Intl<"u"?Intl.DateTimeFormat:void 0}var pr=6e4,fr=/([zZ]|([+-])(\d{2}):?(\d{2}))$/,zi=["January","February","March","April","May","June","July","August","September","October","November","December"],mr=zi.map(t=>t.slice(0,3)),Ei=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],gr=Ei.map(t=>t.slice(0,3)),X=class t{constructor(e,n,i){this.locale=n,this.DateTimeFormat=Ni(),this.date=new Date(e),this.timezoneFixed=i!==void 0,i===void 0&&(i=this.date.getTimezoneOffset()),this.timezoneOffset=g(i)?t.getTimezoneOffset(i,this.date):i,this.timezoneName=g(i)?i:"";let s=(this.date.getTimezoneOffset()-this.timezoneOffset)*pr,r=this.date.getTime()+s;this.displayDate=new Date(r)}getTime(){return this.displayDate.getTime()}dateValue(){return this.date.getTime()}getMilliseconds(){return this.displayDate.getMilliseconds()}getSeconds(){return this.displayDate.getSeconds()}getMinutes(){return this.displayDate.getMinutes()}getHours(){return this.displayDate.getHours()}getDay(){return this.displayDate.getDay()}getDate(){return this.displayDate.getDate()}getMonth(){return this.displayDate.getMonth()}getFullYear(){return this.displayDate.getFullYear()}toLocaleString(e,n){return n?.timeZone?this.date.toLocaleString(e,n):this.displayDate.toLocaleString(e,n)}toLocaleTimeString(e){return this.displayDate.toLocaleTimeString(e)}toLocaleDateString(e){return this.displayDate.toLocaleDateString(e)}getTimezoneOffset(){return this.timezoneOffset}getTimeZoneName(){if(this.timezoneFixed)return this.timezoneName;if(this.DateTimeFormat)return this.DateTimeFormat().resolvedOptions().timeZone}getLongMonthName(){var e;return(e=this.format({month:"long"}))!==null&&e!==void 0?e:zi[this.getMonth()]}getShortMonthName(){var e;return(e=this.format({month:"short"}))!==null&&e!==void 0?e:mr[this.getMonth()]}getLongWeekdayName(){var e;return(e=this.format({weekday:"long"}))!==null&&e!==void 0?e:Ei[this.displayDate.getDay()]}getShortWeekdayName(){var e;return(e=this.format({weekday:"short"}))!==null&&e!==void 0?e:gr[this.displayDate.getDay()]}valid(){return!isNaN(this.getTime())}format(e){return this.DateTimeFormat&&this.DateTimeFormat(this.locale,e).format(this.displayDate)}static createDateFixedToTimezone(e,n){let i=e.match(fr);if(i&&i[1]==="Z")return new t(+new Date(e),n,0);if(i&&i[2]&&i[3]&&i[4]){let[,,s,r,a]=i,o=(s==="+"?-1:1)*(parseInt(r,10)*60+parseInt(a,10));return new t(+new Date(e),n,o)}return new t(e,n)}static getTimezoneOffset(e,n){let i=n.toLocaleString("en-US",{timeZone:e}),s=n.toLocaleString("en-US",{timeZone:"UTC"}),r=new Date(i);return(+new Date(s)-+r)/(60*1e3)}},Le=class{constructor(e,n){this.base=0,this.message=`${e} limit exceeded`,this.limit=n}use(e){+e>0&&(O(this.base+ +e<=this.limit,this.message),this.base+=+e)}check(e){+e>0&&O(+e<=this.limit,this.message)}},Pe=class extends q{constructor(e,[n,i],s,r,a,o,l,c){super(e,s,r,a,c),this.trimLeft=!1,this.trimRight=!1;let d=s[n]==="-",u=s[i-1]==="-",p=d?n+1:n,f=u?i-1:i;for(;p<f&&_[s.charCodeAt(p)]&ge;)p++;for(;f>p&&_[s.charCodeAt(f-1)]&ge;)f--;this.contentRange=[p,f],this.trimLeft=d||o,this.trimRight=u||l}get content(){return this.input.slice(this.contentRange[0],this.contentRange[1])}},et=class extends Pe{constructor(e,n,i,s,r){let{trimTagLeft:a,trimTagRight:o,tagDelimiterLeft:l,tagDelimiterRight:c}=s,[d,u]=[n+l.length,i-c.length];super(k.Tag,[d,u],e,n,i,a,o,r),this.tokenizer=new R(e,s.operators,r,this.contentRange,s.groupedExpressions),this.name=this.tokenizer.readTagName(),this.tokenizer.assert(this.name,"illegal tag syntax, tag name expected"),this.tokenizer.skipBlank(),this.args=this.tokenizer.input.slice(this.tokenizer.p,this.contentRange[1])}},Ht=class extends Pe{constructor(e,n,i,s,r){let{trimOutputLeft:a,trimOutputRight:o,outputDelimiterLeft:l,outputDelimiterRight:c}=s,d=[n+l.length,i-c.length];super(k.Output,d,e,n,i,a,o,r)}},tt=class extends q{constructor(e,n,i,s){super(k.HTML,e,n,i,s),this.input=e,this.begin=n,this.end=i,this.file=s,this.trimLeft=0,this.trimRight=0}getContent(){return this.input.slice(this.begin+this.trimLeft,this.end-this.trimRight)}},Jt=class extends q{constructor(e,n,i,s){super(k.Number,e,n,i,s),this.input=e,this.begin=n,this.end=i,this.file=s,this.content=Number(this.getText())}},Te=class extends q{constructor(e,n,i,s){super(k.Word,e,n,i,s),this.input=e,this.begin=n,this.end=i,this.file=s,this.content=this.getText()}},Gt=class extends q{constructor(e,n,i,s){super(k.Literal,e,n,i,s),this.input=e,this.begin=n,this.end=i,this.file=s,this.literal=this.getText(),this.content=Bi[this.literal]}},yi={"==":2,"!=":2,">":2,"<":2,">=":2,"<=":2,contains:2,not:1,and:0,or:0},yr={"==":0,"!=":0,">":0,"<":0,">=":0,"<=":0,contains:0,not:1,and:0,or:0},Yt=class extends q{constructor(e,n,i,s){super(k.Operator,e,n,i,s),this.input=e,this.begin=n,this.end=i,this.file=s,this.operator=this.getText()}getPrecedence(){return this.operator in yi?yi[this.operator]:1}},nt=class extends q{constructor(e,n,i,s,r,a){super(k.PropertyAccess,i,s,r,a),this.variable=e,this.props=n}},it=class extends q{constructor(e,n,i,s,r,a){super(k.Filter,i,s,r,a),this.name=e,this.args=n}},Kt=class extends q{constructor(e,n,i,s,r,a){super(k.Hash,e,n,i,a),this.input=e,this.begin=n,this.end=i,this.name=s,this.value=r,this.file=a}},br=/[\da-fA-F]/,bi=/[0-7]/,_i={b:"\b",f:"\f",n:`
`,r:"\r",t:"	",v:"\v"};function ki(t){let e=t.charCodeAt(0);return e>=97?e-87:e>=65?e-55:e-48}function _r(t){let e="";for(let n=1;n<t.length-1;n++){if(t[n]!=="\\"){e+=t[n];continue}if(_i[t[n+1]]!==void 0)e+=_i[t[++n]];else if(t[n+1]==="u"){let i=0,s=n+2;for(;s<=n+5&&br.test(t[s]);)i=i*16+ki(t[s++]);n=s-1,e+=String.fromCharCode(i)}else if(!bi.test(t[n+1]))e+=t[++n];else{let i=n+1,s=0;for(;i<=n+3&&bi.test(t[i]);)s=s*8+ki(t[i++]);n=i-1,e+=String.fromCharCode(s)}}return e}var Qt=class extends q{constructor(e,n,i,s){super(k.Quoted,e,n,i,s),this.input=e,this.begin=n,this.end=i,this.file=s,this.content=_r(this.getText())}},Zt=class extends q{constructor(e,n,i,s,r,a){super(k.Range,e,n,i,a),this.input=e,this.begin=n,this.end=i,this.lhs=s,this.rhs=r,this.file=a}},Xt=class extends Pe{constructor(e,n,i,s,r){super(k.Tag,[n,i],e,n,i,!1,!1,r),this.tokenizer=new R(e,s.operators,r,this.contentRange,s.groupedExpressions),this.name=this.tokenizer.readTagName(),this.tokenizer.assert(this.name,"illegal liquid tag syntax"),this.tokenizer.skipBlank()}get args(){return this.tokenizer.input.slice(this.tokenizer.p,this.contentRange[1])}},st=class extends q{constructor(e,n,i,s,r,a){super(k.FilteredValue,i,s,r,a),this.initial=e,this.filters=n,this.input=i,this.begin=s,this.end=r,this.file=a}},kr={now:()=>Date.now()};function en(){return typeof global=="object"&&global.performance||typeof window=="object"&&window.performance||kr}var tn=class{renderTemplatesToNodeStream(e,n){let i=new Vt;return Promise.resolve().then(()=>W(this.renderTemplates(e,n,i))).then(()=>i.end(),s=>i.error(s)),i.stream}*renderTemplates(e,n,i){i||(i=n.opts.keepOutputType?new It:new Qe),n.renderLimit.check(en().now());let s=[];for(let r of e){n.renderLimit.check(en().now());try{let a=yield r.render(n,i);if(a&&i.write(a),n.breakCalled||n.continueCalled)break}catch(a){let o=G.is(a)?a:new Bt(a,r);if(n.opts.catchAllErrors)s.push(o);else throw o}}if(s.length)throw new Ye(s);return i.buffer}};function An(t){return T(t)}var Ce=class{constructor(e,n,i){this.token=e,this.name=e.name,this.handler=S(n)?n:S(n?.handler)?n.handler:Ai,this.raw=!S(n)&&!!n?.raw,this.args=e.args,this.liquid=i}*render(e,n){let i=[];for(let s of this.args)An(s)?i.push([s[0],yield $(s[1],n)]):i.push(yield $(s,n));return yield this.handler.apply({context:n,token:this.token,liquid:this.liquid},[e,...i])}},rt=class{constructor(e){this.postfix=[...Tr(e)]}*evaluate(e,n){O(e,"unable to evaluate: context not defined");let i=[];for(let s of this.postfix)if(Hi(s)){let r=i.pop(),a;if(yr[s.operator]===1)a=yield e.opts.operators[s.operator](r,e);else{let o=i.pop();a=yield e.opts.operators[s.operator](o,r,e)}i.push(a)}else i.push(yield $(s,e,n));return i[0]}valid(){return!!this.postfix.length}};function*$(t,e,n=!1){if(t){if("content"in t)return t.content;if(ct(t))return yield vr(t,e,n);if(Ji(t))return yield Sr(t,e);if(Bn(t))return yield wr(t,e,n)}}function*wr(t,e,n){O(e.liquid,"FilteredValueToken evaluation requires liquid instance in context"),n=n||e.opts.lenientIf&&t.filters.length>0&&t.filters[0].name==="default";let i=yield t.initial.evaluate(e,n);for(let s of t.filters){let r=e.liquid.filters[s.name];O(r||!e.liquid.options.strictFilters,()=>`undefined filter: ${s.name}`),i=yield new Ce(s,r,e.liquid).render(i,e)}return i}function*nn(t,e,n=!1){return yield m(yield $(t,e,n))}function*vr(t,e,n){let i=[];for(let s of t.props)i.push(yield nn(s,e,!1));try{if(t.variable){let s=yield $(t.variable,e,n);return yield e._getFromScope(s,i)}else return yield e._get(i)}catch(s){if(n&&s.name==="InternalUndefinedVariableError")return null;throw new Rt(s,t)}}function xr(t){return t.content}function*Sr(t,e){let n=yield nn(t.lhs,e),i=yield nn(t.rhs,e);return e.memoryLimit.use(i-n+1),Ci(+n,+i+1)}function*Tr(t){let e=[];for(let n of t)if(Hi(n)){for(;e.length&&e[e.length-1].getPrecedence()>n.getPrecedence();)yield e.pop();e.push(n)}else yield n;for(;e.length;)yield e.pop()}function le(t,e){return!ft(t,e)}function ft(t,e){return t=m(t),e.opts.jsTruthy?!t:t===!1||t===void 0||t===null}var Or={"==":function*(t,e){return yield ee(t,e)},"!=":function*(t,e){return!(yield ee(t,e))},">":function*(t,e){return V(t)?yield t.gt(e):V(e)?yield e.lt(t):(yield m(t))>(yield m(e))},"<":function*(t,e){return V(t)?yield t.lt(e):V(e)?yield e.gt(t):(yield m(t))<(yield m(e))},">=":function*(t,e){return V(t)?yield t.geq(e):V(e)?yield e.leq(t):(yield m(t))>=(yield m(e))},"<=":function*(t,e){return V(t)?yield t.leq(e):V(e)?yield e.geq(t):(yield m(t))<=(yield m(e))},contains:function*(t,e){return t=yield m(t),T(t)?yield Di(t,e):S(t?.indexOf)?t.indexOf(yield m(e))>-1:!1},not:function*(t,e){return ft(yield m(t),e)},and:function*(t,e,n){return le(yield m(t),n)&&le(yield m(e),n)},or:function*(t,e,n){return le(yield m(t),n)||le(yield m(e),n)}};function*ee(t,e){return V(t)?yield t.equals(e):V(e)?yield e.equals(t):(t=yield m(t),e=yield m(e),T(t)?T(e)&&(yield $r(t,e)):t===e)}function*$r(t,e){if(t.length!==e.length)return!1;for(let n=0;n<t.length;n++)if(!(yield ee(t[n],e[n])))return!1;return!0}function*Di(t,e){for(let n of t)if(yield ee(n,e))return!0;return!1}var Oe=class{constructor(e,n,i,s){this.key=e,this.value=n,this.next=i,this.prev=s}},at=class{constructor(e,n=0){this.limit=e,this.size=n,this.cache={},this.head=new Oe("HEAD",null,null,null),this.tail=new Oe("TAIL",null,null,null),this.head.next=this.tail,this.tail.prev=this.head}write(e,n){if(this.cache[e])this.cache[e].value=n;else{let i=new Oe(e,n,this.head.next,this.head);this.head.next.prev=i,this.head.next=i,this.cache[e]=i,this.size++,this.ensureLimit()}}read(e){if(!this.cache[e])return;let{value:n}=this.cache[e];return this.remove(e),this.write(e,n),n}remove(e){let n=this.cache[e];n.prev.next=n.next,n.next.prev=n.prev,delete this.cache[e],this.size--}clear(){this.head.next=this.tail,this.tail.prev=this.head,this.size=0,this.cache={}}ensureLimit(){this.size>this.limit&&this.remove(this.tail.prev.key)}};function Vi(t,e){let n=document.createElement("base");n.href=t;let i=document.getElementsByTagName("head")[0];i.insertBefore(n,i.firstChild);let s=document.createElement("a");s.href=e;let r=s.href;return i.removeChild(n),r}function jr(t,e,n){return t.length&&Js(t)!=="/"&&(t+="/"),Vi(t,e).replace(/^(\w+:\/\/[^/]+)(\/[^?]+)/,(s,r,a)=>{let o=a.split("/").pop();return/\.\w+$/.test(o)?s:r+a+n})}function Fr(t){return w(this,void 0,void 0,function*(){return new Promise((e,n)=>{let i=new XMLHttpRequest;i.onload=()=>{i.status>=200&&i.status<300?e(i.responseText):n(new Error(i.statusText))},i.onerror=()=>{n(new Error("An error occurred whilst receiving the response."))},i.open("GET",t),i.send()})})}function Lr(t){let e=new XMLHttpRequest;if(e.open("GET",t,!1),e.send(),e.status<200||e.status>=300)throw new Error(e.statusText);return e.responseText}function Pr(t){return w(this,void 0,void 0,function*(){return!0})}function Cr(t){return!0}function qr(t){return Vi(t,".")}var Ar="/",Mr=Object.freeze({__proto__:null,resolve:jr,readFile:Fr,readFileSync:Lr,exists:Pr,existsSync:Cr,dirname:qr,sep:Ar});function sn(t,e){typeof e=="string"?t.use(e.length):e===null||typeof e=="number"||typeof e=="boolean"?t.use(JSON.stringify(e).length):Array.isArray(e)?t.use(e.length+1):typeof e=="object"&&t.use(2)}function Br(t,e,...n){return t=m(t),T(t)||g(t)?t.length?t:e:t===!1&&new Map(n).get("allow_false")?!1:ft(t,this.context)?e:t}function wi(t,e=0){let n=this.context.memoryLimit;return JSON.stringify(t,(i,s)=>(sn(n,s),s),e)}function Rr(t,e=0){let n=this.context.memoryLimit,i=[];return JSON.stringify(t,function(s,r){if(typeof r!="object"||r===null)return sn(n,r),r;for(;i.length>0&&i[i.length-1]!==this;)i.pop();return i.includes(r)?(n.use(10),"[Circular]"):(i.push(r),sn(n,r),r)},e)}function Nr(t){return Number(t)}var zr={raw:!0,handler:Ai},Ii={default:Br,raw:zr,jsonify:wi,to_integer:Nr,json:wi,inspect:Rr},Er={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},Dr={"&amp;":"&","&lt;":"<","&gt;":">","&#34;":'"',"&#39;":"'"};function mt(t){return t=h(t),this.context.memoryLimit.use(t.length),t.replace(/&|<|>|"|'/g,e=>Er[e])}function Vr(t){return mt.call(this,t)}function Ir(t){return t=h(t),this.context.memoryLimit.use(t.length),t.replace(/&(amp|lt|gt|#34|#39);/g,e=>Dr[e])}function Ur(t){return mt.call(this,Ir.call(this,t))}function Wr(t){let e=h(t);return this.context.memoryLimit.use(e.length),e.replace(/\r?\n/gm,`<br />
`)}function Hr(t){let e=h(t);this.context.memoryLimit.use(e.length);let n=new Map([["<script","<\/script>"],["<style","</style>"],["<!--","-->"],["<",">"]]),i="",s=0;for(;s<e.length;){let r=e.indexOf("<",s);if(r<0)return i+e.slice(s);i+=e.slice(s,r);for(let[a,o]of n){if(!e.startsWith(a,r))continue;let l=e.indexOf(o,r+a.length);if(l>=0){s=l+o.length;break}n.delete(a)}if(s<=r)return i+e.slice(r)}return i}var Jr=Object.freeze({__proto__:null,escape:mt,xml_escape:Vr,escape_once:Ur,newline_to_br:Wr,strip_html:Hr}),rn=class{constructor(e){this.mapping=e,this.sep="/"}exists(e){return w(this,void 0,void 0,function*(){return this.existsSync(e)})}existsSync(e){return!x(this.mapping[e])}readFile(e){return w(this,void 0,void 0,function*(){return this.readFileSync(e)})}readFileSync(e){let n=this.mapping[e];if(x(n))throw new Error(`ENOENT: ${e}`);return n}dirname(e){let n=e.split(this.sep);return n.pop(),n.join(this.sep)}resolve(e,n,i){if(n+=i,e===".")return n;let s=e.split(/\/+/);for(let r of n.split(this.sep))r==="."||r===""||(r===".."?(s.length>1||s[0]!=="")&&s.pop():s.push(r));return s.join(this.sep)}},fe={root:["."],layouts:["."],partials:["."],relativeReference:!0,jekyllInclude:!1,keyValueSeparator:":",cache:void 0,extname:"",fs:Mr,dynamicPartials:!0,jsTruthy:!1,dateFormat:"%A, %B %-e, %Y at %-l:%M %P %z",locale:"",trimTagRight:!1,trimTagLeft:!1,trimOutputRight:!1,trimOutputLeft:!1,greedy:!0,tagDelimiterLeft:"{%",tagDelimiterRight:"%}",outputDelimiterLeft:"{{",outputDelimiterRight:"}}",preserveTimezones:!1,strictFilters:!1,strictVariables:!1,ownPropertyOnly:!0,lenientIf:!1,globals:{},keepOutputType:!1,operators:Or,groupedExpressions:!1,memoryLimit:1/0,parseLimit:1/0,renderLimit:1/0};function Gr(t){var e,n;if(t.hasOwnProperty("root")&&(t.hasOwnProperty("partials")||(t.partials=t.root),t.hasOwnProperty("layouts")||(t.layouts=t.root)),t.hasOwnProperty("cache")){let i;typeof t.cache=="number"?i=t.cache>0?new at(t.cache):void 0:typeof t.cache=="object"?i=t.cache:i=t.cache?new at(1024):void 0,t.cache=i}return t=Object.assign(Object.assign(Object.assign({},fe),t.jekyllInclude?{dynamicPartials:!1}:{}),t),(!t.fs.dirname||!t.fs.sep)&&t.relativeReference&&(console.warn("[LiquidJS] `fs.dirname` and `fs.sep` are required for relativeReference, set relativeReference to `false` to suppress this warning"),t.relativeReference=!1),t.root=Je(t.root),t.partials=Je(t.partials),t.layouts=Je(t.layouts),t.outputEscape=t.outputEscape&&Yr(t.outputEscape),t.locale||(t.locale=(n=(e=Ni())===null||e===void 0?void 0:e().resolvedOptions().locale)!==null&&n!==void 0?n:"en-US"),t.templates&&(t.fs=new rn(t.templates),t.relativeReference=!0,t.root=t.partials=t.layouts="."),t}function Yr(t){return t==="escape"?mt:t==="json"?Ii.json:(O(S(t),"`outputEscape` need to be of type string or function"),t)}function Je(t){let e=[];return T(t)&&(e=t),g(t)&&(e=[t]),e}function Kr(t,e){let n=!1;for(let i=0;i<t.length;i++){let s=t[i];na(s)&&(!n&&s.trimLeft&&Qr(t[i-1],e.greedy),ue(s)&&(s.name==="raw"?n=!0:s.name==="endraw"&&(n=!1)),!n&&s.trimRight&&Zr(t[i+1],e.greedy))}}function Qr(t,e){if(!t||!Mn(t))return;let n=e?ge:Mi;for(;_[t.input.charCodeAt(t.end-1-t.trimRight)]&n;)t.trimRight++}function Zr(t,e){if(!t||!Mn(t))return;let n=e?ge:Mi;for(;_[t.input.charCodeAt(t.begin+t.trimLeft)]&n;)t.trimLeft++;t.input.charAt(t.begin+t.trimLeft)===`
`&&t.trimLeft++}var R=class{constructor(e,n=fe.operators,i,s,r=!1){this.input=e,this.file=i,this.rawBeginAt=-1,this.p=s?s[0]:0,this.N=s?s[1]:e.length,this.opTrie=fi(n),this.literalTrie=fi(Bi),this.groupedExpressions=r}readExpression(){return new rt(this.readExpressionTokens())}*readExpressionTokens(){for(;this.p<this.N;){let e=this.readOperator();if(e){yield e;continue}let n=this.readValue();if(n){yield n;continue}return}}readOperator(){this.skipBlank();let e=this.matchTrie(this.opTrie);if(e!==-1)return new Yt(this.input,this.p,this.p=e,this.file)}matchTrie(e){let n=e,i=this.p,s;for(;n[this.input[i]]&&i<this.N;)n=n[this.input[i++]],n.end&&(s=n);return!s||s.needBoundary&&We(this.peek(i-this.p))?-1:i}readFilteredValue(){let e=this.p,n=this.readExpression();this.assert(n.valid(),`invalid value expression: ${this.snapshot()}`);let i=this.readFilters();return new st(n,i,this.input,e,this.p,this.file)}readFilters(){let e=[];for(;;){let n=this.readFilter();if(!n)return e;e.push(n)}}readFilter(){if(this.skipBlank(),this.end()||this.peek()===")")return null;this.assert(this.read()==="|",'expected "|" before filter');let e=this.readIdentifier();if(!e.size())return this.assert(this.end(),"expected filter name"),null;let n=[];if(this.skipBlank(),this.peek()===":")do{++this.p;let i=this.readFilterArg();i&&n.push(i),this.skipBlank(),this.assert(this.end()||this.peek()===","||this.peek()==="|"||this.peek()===")",()=>`unexpected character ${this.snapshot()}`)}while(this.peek()===",");else if(!(this.peek()==="|"||this.peek()===")"||this.end()))throw this.error('expected ":" after filter name');return new it(e.getText(),n,this.input,e.begin,this.p,this.file)}readFilterArg(){let e=this.readValue();if(!e)return;if(this.skipBlank(),this.peek()!==":")return e;++this.p;let n=this.readValue();return[e.getText(),n]}readTopLevelTokens(e=fe){let n=[];for(;this.p<this.N;){let i=this.readTopLevelToken(e);n.push(i)}return Kr(n,e),n}readTopLevelToken(e){let{tagDelimiterLeft:n,outputDelimiterLeft:i}=e;return this.rawBeginAt>-1?this.readEndrawOrRawContent(e):this.match(n)?this.readTagToken(e):this.match(i)?this.readOutputToken(e):this.readHTMLToken([n,i])}readHTMLToken(e){let n=this.p;for(;this.p<this.N&&!e.some(i=>this.match(i));)++this.p;return new tt(this.input,n,this.p,this.file)}readTagToken(e){let{file:n,input:i}=this,s=this.p;if(this.readToDelimiter(e.tagDelimiterRight)===-1)throw this.error(`tag ${this.snapshot(s)} not closed`,s);let r=new et(i,s,this.p,e,n);return r.name==="raw"&&(this.rawBeginAt=s),r}readToDelimiter(e,n=!1){for(this.skipBlank();this.p<this.N;){if(n&&this.peekType()&ui){this.readQuoted();continue}if(++this.p,this.rmatch(e))return this.p}return-1}readOutputToken(e=fe){let{file:n,input:i}=this,{outputDelimiterRight:s}=e,r=this.p;if(this.readToDelimiter(s,!0)===-1)throw this.error(`output ${this.snapshot(r)} not closed`,r);return new Ht(i,r,this.p,e,n)}readEndrawOrRawContent(e){let{tagDelimiterLeft:n,tagDelimiterRight:i}=e,s=this.p,r=this.readTo(n)-n.length;for(;this.p<this.N;){if(this.readIdentifier().getText()!=="endraw"){r=this.readTo(n)-n.length;continue}for(;this.p<=this.N;){if(this.rmatch(i)){let a=this.p;return s===r?(this.rawBeginAt=-1,new et(this.input,s,a,e,this.file)):(this.p=r,new tt(this.input,s,r,this.file))}if(this.rmatch(n))break;this.p++}}throw this.error(`raw ${this.snapshot(this.rawBeginAt)} not closed`,s)}readLiquidTagTokens(e=fe){let n=[];for(;this.p<this.N;){let i=this.readLiquidTagToken(e);i&&n.push(i)}return n}readLiquidTagToken(e){if(this.skipBlank(),this.end())return;let n=this.p;this.readToDelimiter(`
`);let i=this.p;return new Xt(this.input,n,i,e,this.file)}error(e,n=this.p){return new At(e,new Te(this.input,n,this.N,this.file))}assert(e,n,i){if(!e)throw this.error(typeof n=="function"?n():n,i)}snapshot(e=this.p){return JSON.stringify(Ks(this.input.slice(e,this.N),32))}readWord(){return this.readIdentifier()}readIdentifier(){this.skipBlank();let e=this.p;for(;!this.end()&&We(this.peek());)++this.p;return new Te(this.input,e,this.p,this.file)}readNonEmptyIdentifier(){let e=this.readIdentifier();return e.size()?e:void 0}readTagName(){return this.skipBlank(),this.input[this.p]==="#"?this.input.slice(this.p,++this.p):this.readIdentifier().getText()}readHashes(e){let n=[];for(;;){let i=this.readHash(e);if(!i)return n;n.push(i)}}readHash(e){this.skipBlank(),this.peek()===","&&++this.p;let n=this.p,i=this.readNonEmptyIdentifier();if(!i)return;let s;this.skipBlank();let r=g(e)?e:e?"=":":";return this.peek()===r&&(++this.p,s=this.readValue()),new Kt(this.input,n,this.p,i,s,this.file)}remaining(){return this.input.slice(this.p,this.N)}advance(e=1){this.p+=e}end(){return this.p>=this.N}read(){return this.input[this.p++]}readTo(e){for(;this.p<this.N;)if(++this.p,this.rmatch(e))return this.p;return-1}readValue(){this.skipBlank();let e=this.p,n=this.readLiteral()||this.readQuoted()||this.readNumber();!n&&this.peek()==="("&&(n=this.readGroupOrRange());let i=this.readProperties(!n);return i.length?new nt(n,i,this.input,e,this.p):n}readScopeValue(){this.skipBlank();let e=this.p,n=this.readProperties();if(n.length)return new nt(void 0,n,this.input,e,this.p)}readProperties(e=!0){let n=[];for(;;){if(this.peek()==="["){this.p++;let i=this.readValue()||new Te(this.input,this.p,this.p,this.file);this.assert(this.readTo("]")!==-1,"[ not closed"),n.push(i);continue}if(e&&!n.length){let i=this.readNonEmptyIdentifier();if(i){n.push(i);continue}}if(this.peek()==="."&&this.peek(1)!=="."){this.p++;let i=this.readNonEmptyIdentifier();if(!i)break;n.push(i);continue}break}return n}readNumber(){this.skipBlank();let e=!1,n=!1,i=0;for(this.peekType()&ir&&i++;this.p+i<=this.N;)if(this.peekType(i)&nr)n=!0,i++;else if(this.peek(i)==="."&&this.peek(i+1)!=="."){if(e||!n)return;e=!0,i++}else break;if(n&&!We(this.peek(i))){let s=new Jt(this.input,this.p,this.p+i,this.file);return this.advance(i),s}}readLiteral(){this.skipBlank();let e=this.matchTrie(this.literalTrie);if(e===-1)return;let n=new Gt(this.input,this.p,e,this.file);return this.p=e,n}readGroupOrRange(){this.skipBlank();let e=this.p;if(this.peek()!=="(")return;++this.p;let n=this.readValueOrThrow();if(this.skipBlank(),this.peek()==="."&&this.peek(1)==="."){this.p+=2;let i=this.readValueOrThrow();return this.skipBlank(),this.assert(this.read()===")","invalid range syntax"),new Zt(this.input,e,this.p,n,i,this.file)}if(this.groupedExpressions){let i=new rt([n,...this.readExpressionTokens()]);this.assert(i.valid(),()=>`invalid value expression: ${this.snapshot()}`);let s=this.readFilters();return this.skipBlank(),this.assert(this.read()===")","unbalanced parentheses"),new st(i,s,this.input,e,this.p,this.file)}throw this.error("invalid range syntax")}readValueOrThrow(){let e=this.readValue();return this.assert(e,()=>`unexpected token ${this.snapshot()}, value expected`),e}readQuoted(){this.skipBlank();let e=this.p;if(!(this.peekType()&ui))return;++this.p;let n=!1;for(;this.p<this.N&&(++this.p,!(this.input[this.p-1]===this.input[e]&&!n));)n?n=!1:this.input[this.p-1]==="\\"&&(n=!0);return new Qt(this.input,e,this.p,this.file)}*readFileNameTemplate(e){let{outputDelimiterLeft:n}=e,i=[","," ","\r",`
`,"	",n],s=new Set(i);for(;this.p<this.N&&!s.has(this.peek());)yield this.match(n)?this.readOutputToken(e):this.readHTMLToken(i)}match(e){for(let n=0;n<e.length;n++)if(e[n]!==this.input[this.p+n])return!1;return!0}rmatch(e){for(let n=0;n<e.length;n++)if(e[e.length-1-n]!==this.input[this.p-1-n])return!1;return!0}peekType(e=0){return this.p+e>=this.N?0:_[this.input.charCodeAt(this.p+e)]}peek(e=0){return this.p+e>=this.N?"":this.input[this.p+e]}skipBlank(){for(;this.peekType()&ge;)++this.p}},an=class{constructor(e,n){this.handlers={},this.stopRequested=!1,this.tokens=e,this.parseToken=n}on(e,n){return this.handlers[e]=n,this}trigger(e,n){let i=this.handlers[e];return i?(i.call(this,n),!0):!1}start(){this.trigger("start");let e;for(;!this.stopRequested&&(e=this.tokens.shift());){if(this.trigger("token",e)||ue(e)&&this.trigger(`tag:${e.name}`,e))continue;let n=this.parseToken(e,this.tokens);this.trigger("template",n)}return this.stopRequested||this.trigger("end"),this}stop(){return this.stopRequested=!0,this}},qe=class{constructor(e){this.token=e}},b=class extends qe{constructor(e,n,i){super(e),this.name=e.name,this.liquid=i,this.tokenizer=e.tokenizer}},D=class{constructor(e,n){this.hash={};let i=e instanceof R?e:new R(e,{});for(let s of i.readHashes(n))this.hash[s.name.content]=s.value}*render(e){let n={};for(let i of Object.keys(this.hash))n[i]=this.hash[i]===void 0?!0:yield $(this.hash[i],e);return n}};function Xr(t){return class extends b{constructor(e,n,i){super(e,n,i),S(t.parse)&&t.parse.call(this,e,n)}*render(e,n){let i=yield new D(this.token.args,e.opts.keyValueSeparator).render(e);return yield t.render.call(this,e,n,i)}}}var C=class{constructor(e,n){this.filters=[];let i=typeof e=="string"?new R(e,n.options.operators,void 0,void 0,n.options.groupedExpressions).readFilteredValue():e;this.initial=i.initial,this.filters=i.filters.map(s=>new Ce(s,this.getFilter(n,s.name),n))}*value(e,n){n=n||e.opts.lenientIf&&this.filters.length>0&&this.filters[0].name==="default";let i=yield this.initial.evaluate(e,n);for(let s of this.filters)i=yield s.render(i,e);return i}getFilter(e,n){let i=e.filters[n];return O(i||!e.options.strictFilters,()=>`undefined filter: ${n}`),i}},on=class extends qe{constructor(e,n){var i;super(e);let s=new R(e.input,n.options.operators,e.file,e.contentRange,n.options.groupedExpressions);this.value=new C(s.readFilteredValue(),n);let r=this.value.filters,a=n.options.outputEscape;if(!(!((i=r[r.length-1])===null||i===void 0)&&i.raw)&&a){let o=new it(toString.call(a),[],"",0,0);r.push(new Ce(o,a,n))}}*render(e,n){let i=yield m(yield this.value.value(e,!1));n.write(i)}*arguments(){yield this.value}},ln=class extends qe{constructor(e){super(e),this.str=e.getContent()}*render(e,n){n.write(this.str)}},de=class t{constructor(e,n){this.segments=e,this.location=n}toString(){return lt(this.segments,!0)}toArray(){function*e(...n){for(let i of n)i instanceof t?yield Array.from(e(...i.segments)):yield i}return Array.from(e(...this.segments))}},$e=class{constructor(){this.map=new Map}get(e){let n=lt([e.segments[0]]);return this.map.has(n)||this.map.set(n,[]),this.map.get(n)}has(e){return this.map.has(lt([e.segments[0]]))}push(e){this.get(e).push(e)}asObject(){return Object.fromEntries(this.map)}},Ui={partials:!0};function*Wi(t,e,n){let i=new $e,s=new $e,r=new $e,a=new ot(new Set),o=new Set;function l(d,u){i.push(d);let p=u.alias(d);if(p!==void 0){let f=p.segments[0];g(f)&&!a.has(f)&&s.push(p)}else{let f=d.segments[0];g(f)&&!u.has(f)&&s.push(d)}for(let f of d.segments)f instanceof de&&l(f,u)}function*c(d,u){if(d.arguments)for(let p of d.arguments())for(let f of vi(p))l(f,u);if(d.localScope)for(let p of d.localScope()){u.add(p.content),u.deleteAlias(p.content);let[f,v]=p.getPosition();r.push(new de([p.content],{row:f,col:v,file:p.file}))}if(d.children)if(d.partialScope){let p=d.partialScope();if(p===void 0){for(let y of yield d.children(e,n))yield c(y,u);return}if(o.has(p.name))return;let f=new Set,v=p.isolated?new ot(f):u.push(f);for(let y of p.scope)if(g(y))f.add(y);else{let[B,xe]=y;f.add(B);let si=Array.from(vi(xe));si.length&&v.setAlias(B,si[0].segments)}for(let y of yield d.children(e,n))yield c(y,v),o.add(p.name);v.pop()}else{d.blockScope&&u.push(new Set(d.blockScope()));for(let p of yield d.children(e,n))yield c(p,u);d.blockScope&&u.pop()}}for(let d of t)yield c(d,a);return{variables:i.asObject(),globals:s.asObject(),locals:r.asObject()}}function Q(t,e={}){let n=Object.assign(Object.assign({},Ui),e);return W(Wi(t,n.partials,!1))}function Z(t,e={}){let n=Object.assign(Object.assign({},Ui),e);return H(Wi(t,n.partials,!0))}var ot=class{constructor(e){this.stack=[{names:e,aliases:new Map}]}has(e){for(let n of this.stack)if(n.names.has(e))return!0;return!1}push(e){return this.stack.push({names:e,aliases:new Map}),this}pop(){var e;return(e=this.stack.pop())===null||e===void 0?void 0:e.names}add(e){this.stack[0].names.add(e)}alias(e){let n=e.segments[0];if(!g(n))return;let i=this.getAlias(n);if(i!==void 0)return new de([...i,...e.segments.slice(1)],e.location)}setAlias(e,n){this.stack[this.stack.length-1].aliases.set(e,n)}deleteAlias(e){this.stack[this.stack.length-1].aliases.delete(e)}getAlias(e){for(let n of this.stack){if(n.aliases.has(e))return n.aliases.get(e);if(n.names.has(e))return}}};function*vi(t){P(t)?yield*J(t):t instanceof C&&(yield*ea(t))}function*ea(t){for(let e of t.initial.postfix)P(e)&&(yield*J(e));for(let e of t.filters)for(let n of e.args)An(n)&&n[1]?yield*J(n[1]):P(n)&&(yield*J(n))}function*J(t){Ji(t)?(yield*J(t.lhs),yield*J(t.rhs)):Bn(t)?yield*ta(t):ct(t)&&(yield cn(t))}function*ta(t){if(Bn(t)){for(let e of t.initial.postfix)P(e)&&(yield*J(e));for(let e of t.filters)for(let n of e.args)An(n)&&n[1]?yield*J(n[1]):P(n)&&(yield*J(n))}}function cn(t){let e=[],n=t.file,i=t.props[0];n=n||i.file,un(i)||Si(i)||Ti(i)?e.push(i.content):ct(i)&&e.push(...cn(i).segments);for(let a of t.props.slice(1))n=n||a.file,un(a)||Si(a)||Ti(a)?e.push(a.content):ct(a)&&e.push(cn(a));let[s,r]=t.getPosition();return new de(e,{row:s,col:r,file:n})}var xi=/^[\u0080-\uFFFFa-zA-Z_][\u0080-\uFFFFa-zA-Z0-9_-]*$/;function lt(t,e=!1){let n=[],i=t[0];g(i)&&(!e||i.match(xi)?n.push(`${i}`):n.push(`['${i}']`));for(let s of t.slice(1))s instanceof de?n.push(`[${lt(s.segments)}]`):g(s)?s.match(xi)?n.push(`.${s}`):n.push(`['${s}']`):n.push(`[${s}]`);return n.join("")}var ye;(function(t){t.Partials="partials",t.Layouts="layouts",t.Root="root"})(ye||(ye={}));var dn=class{constructor(e){var n,i,s,r;if(this.options=e,e.relativeReference){let o=e.fs.sep;O(o,"`fs.sep` is required for relative reference");let l=["."+o,".."+o,"./","../"];this.shouldLoadRelative=c=>l.some(d=>c.startsWith(d))}else this.shouldLoadRelative=o=>!1;let a=e.fs;this.contains=Ut(((n=a.contains)===null||n===void 0?void 0:n.bind(a))||(()=>w(this,void 0,void 0,function*(){return!0})),((i=a.containsSync)===null||i===void 0?void 0:i.bind(a))||(()=>!0)),this.exists=Ut(((s=a.exists)===null||s===void 0?void 0:s.bind(a))||(()=>w(this,void 0,void 0,function*(){return!1})),(r=a.existsSync)===null||r===void 0?void 0:r.bind(a))}*lookup(e,n,i,s){let r=this.options[n];for(let a of this.candidates(e,r,s)){let o=!1;for(let l of r)if(yield this.contains(!!i,l,a)){o=!0;break}if(o&&(yield this.exists(!!i,a)))return a}throw this.lookupError(e,r)}*candidates(e,n,i){let{fs:s,extname:r}=this.options;this.shouldLoadRelative(e)&&i&&(yield s.resolve(this.dirname(i),e,r));for(let a of n)yield s.resolve(a,e,r);if(s.fallback!==void 0){let a=s.fallback(e);a!==void 0&&(yield a)}}dirname(e){let n=this.options.fs;return O(n.dirname,"`fs.dirname` is required for relative reference"),n.dirname(e)}lookupError(e,n){let i=new Error("ENOENT");return i.message=`ENOENT: Failed to lookup "${e}" in "${n}"`,i.code="ENOENT",i}},U=class{constructor(e){var n,i;this.liquid=e,this.cache=this.liquid.options.cache,this.fs=this.liquid.options.fs,this.parseFile=this.cache?this._parseFileCached:this._parseFile,this.loader=new dn(this.liquid.options),this.parseLimit=new Le("parse length",e.options.parseLimit),this.readFile=Ut(((n=this.fs.readFile)===null||n===void 0?void 0:n.bind(this.fs))||(()=>w(this,void 0,void 0,function*(){throw new Error("readFile not implemented")})),(i=this.fs.readFileSync)===null||i===void 0?void 0:i.bind(this.fs))}parse(e,n){e=String(e),this.parseLimit.use(e.length);let s=new R(e,this.liquid.options.operators,n,void 0,this.liquid.options.groupedExpressions).readTopLevelTokens(this.liquid.options);return this.parseTokens(s)}parseTokens(e){let n,i=[],s=[];for(;n=e.shift();)try{i.push(this.parseToken(n,e))}catch(r){if(this.liquid.options.catchAllErrors)s.push(r);else throw r}if(s.length)throw new Ye(s);return i}parseToken(e,n){try{if(ue(e)){let i=this.liquid.tags[e.name];return O(i,`tag "${e.name}" not found`),new i(e,n,this.liquid,this)}return ia(e)?new on(e,this.liquid):new ln(e)}catch(i){throw G.is(i)?i:new Mt(i,e)}}parseStream(e){return new an(e,(n,i)=>this.parseToken(n,i))}*_parseFileCached(e,n,i=ye.Root,s){let r=this.cache,a=this.loader.shouldLoadRelative(e)?s+","+e:i+":"+e,o=yield r.read(a);if(o)return o;let l=this._parseFile(e,n,i,s),c=n?yield l:W(l);r.write(a,c);try{return yield c}catch(d){throw r.remove(a),d}}*_parseFile(e,n,i=ye.Root,s){let r=yield this.loader.lookup(e,i,n,s);return this.parse(yield this.readFile(!!n,r),r)}},k;(function(t){t[t.Number=1]="Number",t[t.Literal=2]="Literal",t[t.Tag=4]="Tag",t[t.Output=8]="Output",t[t.HTML=16]="HTML",t[t.Filter=32]="Filter",t[t.Hash=64]="Hash",t[t.PropertyAccess=128]="PropertyAccess",t[t.Word=256]="Word",t[t.Range=512]="Range",t[t.Quoted=1024]="Quoted",t[t.Operator=2048]="Operator",t[t.FilteredValue=4096]="FilteredValue",t[t.GroupedExpression=8192]="GroupedExpression",t[t.Delimited=12]="Delimited"})(k||(k={}));function na(t){return!!(N(t)&k.Delimited)}function Hi(t){return N(t)===k.Operator}function Mn(t){return N(t)===k.HTML}function ia(t){return N(t)===k.Output}function ue(t){return N(t)===k.Tag}function un(t){return N(t)===k.Quoted}function Si(t){return N(t)===k.Number}function ct(t){return N(t)===k.PropertyAccess}function Ti(t){return N(t)===k.Word}function Ji(t){return N(t)===k.Range}function Bn(t){return N(t)===k.FilteredValue}function P(t){return(N(t)&5763)>0}function N(t){return t?t.kind:-1}function te(t){let e=Object.create(null);return t&&Object.assign(e,t),e}var oe=class t{constructor(e={},n=fe,i={},{memoryLimit:s,renderLimit:r,liquid:a}={}){var o,l,c,d,u;this.scopes=[te()],this.registers={},this.breakCalled=!1,this.continueCalled=!1,this.sync=!!i.sync,this.opts=n,this.globals=(o=i.globals)!==null&&o!==void 0?o:n.globals,this.environments=ht(e)?e:Object(e),this.strictVariables=(l=i.strictVariables)!==null&&l!==void 0?l:this.opts.strictVariables,this.ownPropertyOnly=(c=i.ownPropertyOnly)!==null&&c!==void 0?c:n.ownPropertyOnly,this.memoryLimit=s??new Le("memory alloc",(d=i.memoryLimit)!==null&&d!==void 0?d:n.memoryLimit),this.renderLimit=r??new Le("template render",en().now()+((u=i.renderLimit)!==null&&u!==void 0?u:n.renderLimit)),this.liquid=a}getRegister(e,n=void 0){return this.registers[e]=this.registers[e]||n}setRegister(e,n){return this.registers[e]=n}saveRegister(...e){return e.map(n=>[n,this.getRegister(n)])}restoreRegister(e){return e.forEach(([n,i])=>this.setRegister(n,i))}getAll(){return[this.globals,this.environments,...this.scopes].reduce((e,n)=>Xe(e,n),{})}get(e){return this.getSync(e)}getSync(e){return H(this._get(e))}*_get(e){let n=this.findScope(e[0]);return yield this._getFromScope(n,e)}getFromScope(e,n){return H(this._getFromScope(e,n))}*_getFromScope(e,n,i=this.strictVariables){g(n)&&(n=n.split("."));for(let s=0;s<n.length;s++)if(e=yield this.readProperty(e,n[s]),i&&Ws(e))throw new Nt(n.slice(0,s+1).join("."));return e}push(e){return this.scopes.push(e)}pop(){return this.scopes.pop()}bottom(){return this.scopes[0]}spawn(e={}){return new t(e,this.opts,{sync:this.sync,globals:this.globals,strictVariables:this.strictVariables,ownPropertyOnly:this.ownPropertyOnly},{renderLimit:this.renderLimit,memoryLimit:this.memoryLimit,liquid:this.liquid})}findScope(e){for(let n=this.scopes.length-1;n>=0;n--){let i=this.scopes[n];if(e in i)return i}return e in this.environments?this.environments:this.globals}readProperty(e,n){if(e=Li(e),n=m(n),x(e))return e;if(T(e)&&Be(n))return Ae(e,n,this.ownPropertyOnly);let i=Rn(e,n,this.ownPropertyOnly);return i===void 0&&e instanceof A?e.liquidMethodMissing(n,this):S(i)?i.call(e):n==="size"?aa(e):n==="first"?sa(e,this.ownPropertyOnly):n==="last"?ra(e,this.ownPropertyOnly):i}};function Rn(t,e,n){if(!(n&&!ut.call(t,e)&&!(t instanceof A)))return t[e]}function sa(t,e){return T(t)?Ae(t,0,e):Rn(t,"first",e)}function ra(t,e){return T(t)?Ae(t,-1,e):Rn(t,"last",e)}function aa(t){if(ut.call(t,"size")||t.size!==void 0)return t.size;if(T(t)||g(t))return t.length;if(typeof t=="object")return Object.keys(t).length}var ce;(function(t){t[t.OUTPUT=0]="OUTPUT",t[t.STORE=1]="STORE"})(ce||(ce={}));var oa=I(Math.abs),la=I(Math.max),ca=I(Math.min),da=I(Math.ceil),ua=I((t,e,n=!1)=>n?Math.floor(t/e):t/e),ha=I(Math.floor),pa=I((t,e)=>t-e),fa=I((t,e)=>t+e),ma=I((t,e)=>(t%e+e)%e),ga=I((t,e)=>t*e);function ya(t,e=0){t=qt(t),e=qt(e);let n=Math.pow(10,e),i=t*n*(1+Number.EPSILON);return Math.round(i)/n}var ba=Object.freeze({__proto__:null,abs:oa,at_least:la,at_most:ca,ceil:da,divided_by:ua,floor:ha,minus:pa,plus:fa,modulo:ma,times:ga,round:ya}),_a=t=>decodeURIComponent(h(t).replace(/\+/g," ")),ka=t=>encodeURIComponent(h(t)).replace(/%20/g,"+"),wa=t=>encodeURIComponent(h(t)).replace(/%20/g,"+").replace(/[!'()*]/g,e=>"%"+e.charCodeAt(0).toString(16).toUpperCase()),va=t=>encodeURI(h(t)).replace(/%5B/g,"[").replace(/%5D/g,"]"),Oi=/[^\p{M}\p{L}\p{Nd}]+/ug,xa={raw:/\s+/g,default:Oi,pretty:/[^\p{M}\p{L}\p{Nd}._~!$&'()+,;=@]+/ug,ascii:/[^A-Za-z0-9]+/g,latin:Oi,none:null};function Sa(t,e="default",n=!1){t=h(t);let i=xa[e];return i&&(e==="latin"&&(t=Ta(t)),t=t.replace(i,"-").replace(/^-|-$/g,"")),n?t:t.toLowerCase()}function Ta(t){return t.replace(/[àáâãäå]/g,"a").replace(/[æ]/g,"ae").replace(/[ç]/g,"c").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[ð]/g,"d").replace(/[ñ]/g,"n").replace(/[òóôõöø]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ýÿ]/g,"y").replace(/[ß]/g,"ss").replace(/[œ]/g,"oe").replace(/[þ]/g,"th").replace(/[ẞ]/g,"SS").replace(/[Œ]/g,"OE").replace(/[Þ]/g,"TH")}var Oa=Object.freeze({__proto__:null,url_decode:_a,url_encode:ka,cgi_escape:wa,uri_escape:va,slugify:Sa}),$a=pt(function(t,e){let n=F(t),i=x(e)?" ":h(e),s=i.length*Math.max(n.length-1,0);for(let r=0;r<n.length;r++)s+=String(n[r]).length;return this.context.memoryLimit.use(s),Array.prototype.join.call(n,i)}),ja=pt(function(t){return Pi(t)?Ae(t,-1,this.context.ownPropertyOnly):""}),Fa=pt(function(t){return Pi(t)?Ae(t,0,this.context.ownPropertyOnly):""}),La=pt(function(t){let e=F(t);return this.context.memoryLimit.use(e.length),[...e].reverse()});function*Gi(t,e,n){let i=[],s=F(t);this.context.memoryLimit.use(s.length);for(let r of s)i.push([r,e?yield this.context._getFromScope(r,h(e).split("."),!1):r]);return i.sort((r,a)=>n(r[1],a[1])).map(r=>r[0])}function*Pa(t,e){return yield*Gi.call(this,t,e,Qs)}function*Ca(t,e){return yield*Gi.call(this,t,e,Zs)}var qa=t=>t&&t.length||0;function*Aa(t,e){let n=[],i=F(t);this.context.memoryLimit.use(i.length);for(let s of i)n.push(yield this.context._getFromScope(s,h(e),!1));return n}function*Ma(t,e){let n=0,i=F(t);for(let s of i){let r=Number(e?yield this.context._getFromScope(s,h(e),!1):s);n+=Number.isNaN(r)?0:r}return n}function Ba(t){let e=F(t);return this.context.memoryLimit.use(e.length),Array.prototype.filter.call(e,n=>!x(m(n)))}function Yi(t,e=[]){let n=F(t),i=F(e);return this.context.memoryLimit.use(n.length+i.length),Array.prototype.concat.call(n,i)}function Ra(t,e){return Yi.call(this,t,[e])}function Na(t,e){let n=F(t);this.context.memoryLimit.use(n.length);let i=[...n];return i.unshift(e),i}function za(t){let e=F(t);this.context.memoryLimit.use(e.length);let n=[...e];return n.pop(),n}function Ea(t){let e=F(t);this.context.memoryLimit.use(e.length);let n=[...e];return n.shift(),n}function Da(t,e,n=1){return t=m(t),x(t)?[]:(T(t)||(t=h(t)),e=e<0?t.length+e:e,e<0||n<0?T(t)?[]:"":(this.context.memoryLimit.use(n),T(t)?Array.prototype.slice.call(t,e,e+n):String.prototype.slice.call(t,e,e+n)))}function*Ki(t,e){return this.context.opts.jekyllWhere?je.is(e)?yield ee(t,e):T(t)?yield Di(t,e):yield ee(t,e):e===void 0?le(t,this.context):yield ee(t,e)}function*Qi(t,e,n,i){e=F(e),this.context.memoryLimit.use(e.length);let s=new R(h(n)).readScopeValue(),r=[];for(let a of e){let o=yield $(s,this.context.spawn(a));(yield Ki.call(this,o,i))===t&&r.push(a)}return r}function*Zi(t,e,n,i){let s=[],r=new C(h(i),this.liquid),a=F(e);this.context.memoryLimit.use(a.length);for(let o of a){this.context.push({[n]:o});let l=yield r.value(this.context);this.context.pop(),l===t&&s.push(o)}return s}function*Va(t,e,n){return yield*Qi.call(this,!0,t,e,n)}function*Ia(t,e,n){return yield*Qi.call(this,!1,t,e,n)}function*Ua(t,e,n){return yield*Zi.call(this,!0,t,e,n)}function*Wa(t,e,n){return yield*Zi.call(this,!1,t,e,n)}function*Ha(t,e){let n=new Map;t=Me(t);let i=new R(h(e)).readScopeValue();this.context.memoryLimit.use(t.length);for(let s of t){let r=yield $(i,this.context.spawn(s));n.has(r)||n.set(r,[]),n.get(r).push(s)}return[...n.entries()].map(([s,r])=>({name:s,items:r}))}function*Ja(t,e,n){let i=new Map,s=new C(h(n),this.liquid);t=Me(t),this.context.memoryLimit.use(t.length);for(let r of t){this.context.push({[e]:r});let a=yield s.value(this.context);this.context.pop(),i.has(a)||i.set(a,[]),i.get(a).push(r)}return[...i.entries()].map(([r,a])=>({name:r,items:a}))}function*Nn(t,e,n){let i=new R(h(e)).readScopeValue(),s=F(t);for(let r=0;r<s.length;r++){let a=yield $(i,this.context.spawn(s[r]));if(yield Ki.call(this,a,n))return[r,s[r]]}}function*zn(t,e,n){let i=new C(h(n),this.liquid),s=F(t);for(let r=0;r<s.length;r++){this.context.push({[e]:s[r]});let a=yield i.value(this.context);if(this.context.pop(),a)return[r,s[r]]}}function*Ga(t,e,n){return!!(yield*Nn.call(this,t,e,n))}function*Ya(t,e,n){return!!(yield*zn.call(this,t,e,n))}function*Ka(t,e,n){let i=yield*Nn.call(this,t,e,n);return i?i[0]:void 0}function*Qa(t,e,n){let i=yield*zn.call(this,t,e,n);return i?i[0]:void 0}function*Za(t,e,n){let i=yield*Nn.call(this,t,e,n);return i?i[1]:void 0}function*Xa(t,e,n){let i=yield*zn.call(this,t,e,n);return i?i[1]:void 0}function eo(t){return t=F(t),this.context.memoryLimit.use(t.length),[...new Set(t)]}function to(t,e=1){if(t=m(t),x(t))return[];T(t)||(t=h(t)),this.context.memoryLimit.use(t.length);let n=[...t].sort(()=>Math.random()-.5);return e===1?n[0]:n.slice(0,e)}var no=Object.freeze({__proto__:null,join:$a,last:ja,first:Fa,reverse:La,sort:Pa,sort_natural:Ca,size:qa,map:Aa,sum:Ma,compact:Ba,concat:Yi,push:Ra,unshift:Na,pop:za,shift:Ea,slice:Da,where:Va,reject:Ia,where_exp:Ua,reject_exp:Wa,group_by:Ha,group_by_exp:Ja,has:Ga,has_exp:Ya,find_index:Ka,find_index_exp:Qa,find:Za,find_exp:Xa,uniq:eo,sample:to});function En(t,e,n){var i,s;let r=((i=t?.length)!==null&&i!==void 0?i:0)+((s=n?.length)!==null&&s!==void 0?s:0);this.context.memoryLimit.use(r);let a=es(t,this.context.opts,n);return a?(e=m(e),e=x(e)?this.context.opts.dateFormat:h(e),this.context.memoryLimit.use(e.length),He(a,e,this.context.memoryLimit)):t}function io(t){return En.call(this,t,"%Y-%m-%dT%H:%M:%S%:z")}function so(t){return En.call(this,t,"%a, %d %b %Y %H:%M:%S %z")}function ro(t,e,n){return Xi.call(this,t,"%b",e,n)}function ao(t,e,n){return Xi.call(this,t,"%B",e,n)}function Xi(t,e,n,i){let s=es(t,this.context.opts);if(!s)return t;let r=this.context.memoryLimit;if(n==="ordinal"){let a=s.getDate();return i==="US"?He(s,`${e} ${a}%q, %Y`,r):He(s,`${a}%q ${e} %Y`,r)}return He(s,`%d ${e} %Y`,r)}function es(t,e,n){let i,s=n??e.timezoneOffset,r=e.locale;if(t=m(t),!x(t))return t==="now"||t==="today"?i=new X(Date.now(),r,s):Be(t)?i=new X(t*1e3,r,s):g(t)?/^\d+$/.test(t)?i=new X(+t*1e3,r,s):e.preserveTimezones&&n===void 0?i=X.createDateFixedToTimezone(t,r):i=new X(t,r,s):i=new X(t,r,s),i.valid()?i:void 0}var oo=Object.freeze({__proto__:null,date:En,date_to_xmlschema:io,date_to_rfc822:so,date_to_string:ro,date_to_long_string:ao}),Ct=/[\u4E00-\u9FFF\uF900-\uFAFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/gu,$i=/[^\u4E00-\u9FFF\uF900-\uFAFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\s]+/gu;function lo(t,e){O(arguments.length===2,"append expect 2 arguments");let n=h(t),i=h(e);return this.context.memoryLimit.use(n.length+i.length),n+i}function co(t,e){O(arguments.length===2,"prepend expect 2 arguments");let n=h(t),i=h(e);return this.context.memoryLimit.use(n.length+i.length),i+n}function ts(t,e){let n=0;for(let i of t){if(!e.has(i))break;n+=i.length}return n}function ns(t,e,n=0){let i=t.length;for(;i>n;){let s=i-n>=2&&t.codePointAt(i-2)>65535?2:1;if(!e.has(t.slice(i-s,i)))break;i-=s}return i}function uo(t,e){let n=h(t);return this.context.memoryLimit.use(n.length),e?(e=h(e),this.context.memoryLimit.use(e.length),n.slice(ts(n,new Set(e)))):n.trimStart()}function ho(t){let e=h(t);return this.context.memoryLimit.use(e.length),e.toLowerCase()}function po(t){let e=h(t);return this.context.memoryLimit.use(e.length),h(e).toUpperCase()}function fo(t,e){let n=h(t);return e=h(e),this.context.memoryLimit.use(n.length+e.length),n.split(e).join("")}function mo(t,e){let n=h(t);return e=h(e),this.context.memoryLimit.use(n.length+e.length),n.replace(e,"")}function go(t,e){let n=h(t),i=h(e);this.context.memoryLimit.use(n.length+i.length);let s=n.lastIndexOf(i);return s===-1?n:n.substring(0,s)+n.substring(s+i.length)}function yo(t,e){return t=h(t),this.context.memoryLimit.use(t.length),e?(e=h(e),this.context.memoryLimit.use(e.length),t.slice(0,ns(t,new Set(e)))):t.trimEnd()}function bo(t,e){let n=h(t);this.context.memoryLimit.use(n.length);let i=n.split(h(e));for(;i.length&&i[i.length-1]==="";)i.pop();return i}function _o(t,e){let n=h(t);if(this.context.memoryLimit.use(n.length),e){let i=new Set(h(e));this.context.memoryLimit.use(i.size);let s=ts(n,i);return n.slice(s,ns(n,i,s))}return n.trim()}function ko(t){let e=h(t);return this.context.memoryLimit.use(e.length),e.replace(/\r?\n/gm,"")}function wo(t){let e=h(t);return this.context.memoryLimit.use(e.length),e.replace(/\s+/g," ").trim()}function vo(t){return t=h(t),this.context.memoryLimit.use(t.length),t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()}function xo(t,e,n){let i=h(t);e=h(e),n=h(n);let s=i.split(e),r=i.length+(s.length-1)*(n.length-e.length);return this.context.memoryLimit.use(r),s.join(n)}function So(t,e,n){let i=h(t);return e=h(e),n=h(n),this.context.memoryLimit.use(i.length+e.length+n.length),i.replace(e,()=>n)}function To(t,e,n){let i=h(t),s=h(e),r=h(n);this.context.memoryLimit.use(i.length+s.length+r.length);let a=i.lastIndexOf(s);return a===-1?i:i.substring(0,a)+r+i.substring(a+s.length)}function Oo(t,e=50,n="..."){let i=h(t);return n=h(n),this.context.memoryLimit.use(i.length+n.length),i.length<=e?t:i.substring(0,e-n.length)+n}function $o(t,e=15,n="..."){let i=h(t);n=h(n),this.context.memoryLimit.use(i.length+n.length);let s=i.trimStart().split(/\s+/);e<=0&&(e=1);let r=s.slice(0,e).join(" ");return s.length>=e&&(r+=n),r}function jo(t){let e=h(t);return this.context.memoryLimit.use(e.length),e.replace(/\s+/g," ")}function Fo(t,e){let n=h(t);if(this.context.memoryLimit.use(n.length),t=n.trim(),!t)return 0;switch(e){case"cjk":return(t.match(Ct)||[]).length+(t.match($i)||[]).length;case"auto":return Ct.test(t)?t.match(Ct).length+(t.match($i)||[]).length:t.split(/\s+/).length;default:return t.split(/\s+/).length}}function Lo(t,e="and"){e=h(e);let n=e.length+t.length*2;for(let i=0;i<t.length;i++)n+=h(t[i]).length;switch(this.context.memoryLimit.use(n),t.length){case 0:return"";case 1:return t[0];case 2:return`${t[0]} ${e} ${t[1]}`;default:return`${t.slice(0,-1).join(", ")}, ${e} ${t[t.length-1]}`}}var Po=Object.freeze({__proto__:null,append:lo,prepend:co,lstrip:uo,downcase:ho,upcase:po,remove:fo,remove_first:mo,remove_last:go,rstrip:yo,split:bo,strip:_o,strip_newlines:ko,squish:wo,capitalize:vo,replace:xo,replace_first:So,replace_last:To,truncate:Oo,truncatewords:$o,normalize_whitespace:jo,number_of_words:Fo,array_to_sentence_string:Lo});function Co(t){let e=new TextEncoder().encode(t),n="";for(let i=0;i<e.length;i+=32768)n+=String.fromCharCode(...e.subarray(i,i+32768));return btoa(n)}function qo(t){return new TextDecoder().decode(Uint8Array.from(atob(t),e=>e.charCodeAt(0)))}function Ao(t){if(typeof Buffer<"u"&&Buffer.isBuffer(t))return this.context.memoryLimit.use(t.byteLength),t.toString("base64");let e=h(t);return this.context.memoryLimit.use(e.length),Co(e)}function Mo(t){let e=h(t);return this.context.memoryLimit.use(e.length),qo(e)}var Bo=Object.freeze({__proto__:null,base64_encode:Ao,base64_decode:Mo});function is(t){let e=new Uint8Array(t),n="";for(let i=0;i<e.length;i++)n+=e[i].toString(16).padStart(2,"0");return n}function Ro(t){return w(this,void 0,void 0,function*(){let e=new TextEncoder().encode(t),n=yield crypto.subtle.digest("SHA-256",e);return is(n)})}function No(t,e){return w(this,void 0,void 0,function*(){let n=new TextEncoder,i=yield crypto.subtle.importKey("raw",n.encode(e),{name:"HMAC",hash:"SHA-256"},!1,["sign"]),s=yield crypto.subtle.sign("HMAC",i,n.encode(t));return is(s)})}function zo(t){let e=h(t);return this.context.memoryLimit.use(e.length),Ro(e)}function Eo(t,e){let n=h(t),i=h(e);return this.context.memoryLimit.use(n.length+i.length),No(n,i)}var Do=Object.freeze({__proto__:null,sha256:zo,hmac_sha256:Eo}),Vo=Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},Jr),ba),Oa),no),oo),Po),Bo),Do),Ii),hn=class extends b{constructor(e,n,i){super(e,n,i),this.identifier=this.tokenizer.readIdentifier(),this.key=this.identifier.content,this.tokenizer.assert(this.key,"expected variable name"),this.tokenizer.skipBlank(),this.tokenizer.assert(this.tokenizer.peek()==="=",'expected "="'),this.tokenizer.advance(),this.value=new C(this.tokenizer.readFilteredValue(),this.liquid)}*render(e){e.bottom()[this.key]=yield this.value.value(e,this.liquid.options.lenientIf)}*arguments(){yield this.value}*localScope(){yield this.identifier}},ji=["offset","limit","reversed"],pn=class extends b{constructor(e,n,i,s){super(e,n,i);let r=this.tokenizer.readIdentifier(),a=this.tokenizer.readIdentifier(),o=this.tokenizer.readValue();if(!r.size()||a.content!=="in"||!o)throw new Error(`illegal tag: ${e.getText()}`);this.variable=r.content,this.collection=o,this.hash=new D(this.tokenizer,i.options.keyValueSeparator),this.templates=[],this.elseTemplates=[];let l,c=s.parseStream(n).on("start",()=>l=this.templates).on("tag:else",d=>{Ke(d.args),l=this.elseTemplates}).on("tag:endfor",d=>{Ke(d.args),c.stop()}).on("template",d=>l.push(d)).on("end",()=>{throw new Error(`tag ${e.getText()} not closed`)});c.start()}*render(e,n){let i=this.liquid.renderer,s=Me(yield $(this.collection,e));if(!s.length){yield i.renderTemplates(this.elseTemplates,e,n);return}let r="continue-"+this.variable+"-"+this.collection.getText();e.push(te({continue:e.getRegister(r,{})}));let a=yield this.hash.render(e);e.pop(),s=(this.liquid.options.orderedFilterParameters?Object.keys(a).filter(c=>ji.includes(c)):ji.filter(c=>a[c]!==void 0)).reduce((c,d)=>d==="offset"?Uo(c,a.offset):d==="limit"?Wo(c,a.limit):Io(c),s),e.setRegister(r,(a.offset||0)+s.length);let l=te({forloop:new Fe(s.length,this.collection.getText(),this.variable)});e.push(l);for(let c of s){if(l[this.variable]=c,e.continueCalled=e.breakCalled=!1,yield i.renderTemplates(this.templates,e,n),e.breakCalled)break;l.forloop.next()}e.continueCalled=e.breakCalled=!1,e.pop()}*children(){let e=this.templates.slice();return this.elseTemplates&&e.push(...this.elseTemplates),e}*arguments(){yield this.collection;for(let e of Object.values(this.hash.hash))P(e)&&(yield e)}blockScope(){return[this.variable,"forloop"]}};function Io(t){return[...t].reverse()}function Uo(t,e){return t.slice(e)}function Wo(t,e){return t.slice(0,e)}var fn=class extends b{constructor(e,n,i,s){for(super(e,n,i),this.templates=[],this.identifier=this.readVariable(),this.variable=this.identifier.content;n.length;){let r=n.shift();if(ue(r)&&r.name==="endcapture")return;this.templates.push(s.parseToken(r,n))}throw new Error(`tag ${e.getText()} not closed`)}readVariable(){let e=this.tokenizer.readIdentifier();if(e.content||(e=this.tokenizer.readQuoted(),e))return e;throw this.tokenizer.error("invalid capture name")}*render(e){let i=yield this.liquid.renderer.renderTemplates(this.templates,e);e.bottom()[this.variable]=i}*children(){return this.templates}*localScope(){yield this.identifier}},mn=class extends b{constructor(e,n,i,s){super(e,n,i),this.branches=[],this.elseTemplates=[],this.value=new C(this.tokenizer.readFilteredValue(),this.liquid),this.elseTemplates=[];let r=[],a=0,o=s.parseStream(n).on("tag:when",l=>{if(a>0)return;r=[];let c=[];for(;!l.tokenizer.end();)c.push(l.tokenizer.readValueOrThrow()),l.tokenizer.skipBlank(),l.tokenizer.peek()===","?l.tokenizer.readTo(","):l.tokenizer.readTo("or");this.branches.push({values:c,templates:r})}).on("tag:else",()=>{a++,r=this.elseTemplates}).on("tag:endcase",()=>o.stop()).on("template",l=>{(r!==this.elseTemplates||a===1)&&r.push(l)}).on("end",()=>{throw new Error(`tag ${e.getText()} not closed`)});o.start()}*render(e,n){let i=this.liquid.renderer,s=yield m(yield this.value.value(e,e.opts.lenientIf)),r=!1;for(let a of this.branches)for(let o of a.values){let l=yield $(o,e,e.opts.lenientIf);if(yield ee(s,l)){yield i.renderTemplates(a.templates,e,n),r=!0;break}}r||(yield i.renderTemplates(this.elseTemplates,e,n))}*arguments(){yield this.value,yield*this.branches.flatMap(e=>e.values)}*children(){let e=this.branches.flatMap(n=>n.templates);return this.elseTemplates&&e.push(...this.elseTemplates),e}},gn=class extends b{constructor(e,n,i){for(super(e,n,i);n.length;){let s=n.shift();if(ue(s)&&s.name==="endcomment")return}throw new Error(`tag ${e.getText()} not closed`)}render(){}},yn=class extends b{constructor(e,n,i,s){super(e,n,i);let r=this.tokenizer;for(this.file=Dn(r,this.liquid,s),this.currentFile=e.file;!r.end();){r.skipBlank();let a=r.p,o=r.readIdentifier();if((o.content==="with"||o.content==="for")&&(r.skipBlank(),r.peek()!==":")){let l=r.readValue();if(l){let c=r.p,d=r.readIdentifier(),u;d.content==="as"?u=r.readIdentifier():r.p=c;let p={value:l,alias:u&&u.content};o.content==="with"?this.with=p:this.forBinding=p,r.skipBlank(),r.peek()===","&&r.advance();continue}}r.p=a;break}this.hash=new D(r,i.options.keyValueSeparator)}*render(e,n){let{liquid:i,hash:s}=this,r=yield Vn(this.file,e,i);O(r,()=>`illegal file path "${r}"`);let a=e.spawn(),o=a.bottom();if(Xe(o,yield s.render(e)),this.with){let{value:l,alias:c}=this.with;o[c||r]=yield $(l,e)}if(this.forBinding){let{value:l,alias:c}=this.forBinding,d=Me(yield $(l,e));o.forloop=new Fe(d.length,l.getText(),c);for(let u of d){o[c]=u;let p=yield i._parsePartialFile(r,a.sync,this.currentFile);yield i.renderer.renderTemplates(p,a,n),o.forloop.next()}}else{let l=yield i._parsePartialFile(r,a.sync,this.currentFile);yield i.renderer.renderTemplates(l,a,n)}}*children(e,n){return e&&g(this.file)?yield this.liquid._parsePartialFile(this.file,n,this.currentFile):[]}partialScope(){if(g(this.file)){let e=Object.keys(this.hash.hash);if(this.with){let{value:n,alias:i}=this.with;g(i)?e.push([i,n]):g(this.file)&&e.push([this.file,n])}if(this.forBinding){let{value:n,alias:i}=this.forBinding;g(i)?e.push([i,n]):g(this.file)&&e.push([this.file,n])}return{name:this.file,isolated:!0,scope:e}}}*arguments(){for(let e of Object.values(this.hash.hash))P(e)&&(yield e);if(this.with){let{value:e}=this.with;P(e)&&(yield e)}if(this.forBinding){let{value:e}=this.forBinding;P(e)&&(yield e)}}};function Dn(t,e,n){if(e.options.dynamicPartials){let r=t.readValue();if(t.assert(r,"illegal file path"),r.getText()==="none")return;if(un(r)){let a=n.parse(xr(r));return Fi(a)}return r}let i=[...t.readFileNameTemplate(e.options)],s=Fi(n.parseTokens(i));return s==="none"?void 0:s}function Fi(t){return t.length===1&&Mn(t[0].token)?t[0].token.getContent():t}function*Vn(t,e,n){return typeof t=="string"?t:Array.isArray(t)?n.renderer.renderTemplates(t,e):yield $(t,e)}var bn=class extends b{constructor(e,n,i,s){super(e,n,i);let{tokenizer:r}=e;this.file=Dn(r,this.liquid,s),this.currentFile=e.file;let a=r.p;r.readIdentifier().content==="with"?(r.skipBlank(),r.peek()!==":"?this.withVar=r.readValue():r.p=a):r.p=a,this.hash=new D(r,i.options.jekyllInclude||i.options.keyValueSeparator)}*render(e,n){let{liquid:i,hash:s,withVar:r}=this,{renderer:a}=i,o=yield Vn(this.file,e,i);O(o,()=>`illegal file path "${o}"`);let l=e.saveRegister("blocks","blockMode");e.setRegister("blocks",{}),e.setRegister("blockMode",ce.OUTPUT);let c=te(yield s.render(e));r&&(c[o]=yield $(r,e));let d=yield i._parsePartialFile(o,e.sync,this.currentFile);e.push(e.opts.jekyllInclude?te({include:c}):c),yield a.renderTemplates(d,e,n),e.pop(),e.restoreRegister(l)}*children(e,n){return e&&g(this.file)?yield this.liquid._parsePartialFile(this.file,n,this.currentFile):[]}partialScope(){if(g(this.file)){let e;return this.liquid.options.jekyllInclude?e=["include"]:(e=Object.keys(this.hash.hash),this.withVar&&e.push([this.file,this.withVar])),{name:this.file,isolated:!1,scope:e}}}*arguments(){yield*Object.values(this.hash.hash).filter(P),P(this.file)&&(yield this.file),P(this.withVar)&&(yield this.withVar)}},_n=class extends b{constructor(e,n,i){super(e,n,i),this.identifier=this.tokenizer.readIdentifier(),this.variable=this.identifier.content}render(e,n){let i=e.environments;Be(i[this.variable])||(i[this.variable]=0),n.write(h(--i[this.variable]))}*localScope(){yield this.identifier}},kn=class extends b{constructor(e,n,i){super(e,n,i),this.candidates=[];let s=this.tokenizer.readValue();for(this.tokenizer.skipBlank(),s&&(this.tokenizer.peek()===":"?(this.group=s,this.tokenizer.advance()):this.candidates.push(s));!this.tokenizer.end();){let r=this.tokenizer.readValue();r&&this.candidates.push(r),this.tokenizer.readTo(",")}this.tokenizer.assert(this.candidates.length,()=>`empty candidates: "${e.getText()}"`)}*render(e,n){let s=`cycle:${yield $(this.group,e)}:`+this.candidates.join(","),r=e.getRegister("cycle",{}),a=r[s];a===void 0&&(a=r[s]=0);let o=this.candidates[a];return a=(a+1)%this.candidates.length,r[s]=a,yield $(o,e)}*arguments(){yield*this.candidates,this.group&&(yield this.group)}},wn=class extends b{constructor(e,n,i,s){super(e,n,i),this.branches=[];let r=[];s.parseStream(n).on("start",()=>this.branches.push({value:new C(e.tokenizer.readFilteredValue(),this.liquid),templates:r=[]})).on("tag:elsif",a=>{O(!this.elseTemplates,"unexpected elsif after else"),this.branches.push({value:new C(a.tokenizer.readFilteredValue(),this.liquid),templates:r=[]})}).on("tag:else",a=>{Ke(a.args),O(!this.elseTemplates,"duplicated else"),r=this.elseTemplates=[]}).on("tag:endif",function(a){Ke(a.args),this.stop()}).on("template",a=>r.push(a)).on("end",()=>{throw new Error(`tag ${e.getText()} not closed`)}).start()}*render(e,n){let i=this.liquid.renderer;for(let{value:s,templates:r}of this.branches){let a=yield m(yield s.value(e,e.opts.lenientIf));if(le(a,e)){yield i.renderTemplates(r,e,n);return}}yield i.renderTemplates(this.elseTemplates||[],e,n)}*children(){let e=this.branches.flatMap(n=>n.templates);return this.elseTemplates&&e.push(...this.elseTemplates),e}arguments(){return this.branches.map(e=>e.value)}},vn=class extends b{constructor(e,n,i){super(e,n,i),this.identifier=this.tokenizer.readIdentifier(),this.variable=this.identifier.content}render(e,n){let i=e.environments;Be(i[this.variable])||(i[this.variable]=0);let s=i[this.variable];i[this.variable]++,n.write(h(s))}*localScope(){yield this.identifier}},xn=class extends b{constructor(e,n,i,s){super(e,n,i),this.file=Dn(this.tokenizer,this.liquid,s),this.currentFile=e.file,this.args=new D(this.tokenizer,i.options.keyValueSeparator),this.templates=s.parseTokens(n)}*render(e,n){let{liquid:i,args:s,file:r}=this,{renderer:a}=i;if(r===void 0){e.setRegister("blockMode",ce.OUTPUT),yield a.renderTemplates(this.templates,e,n);return}let o=yield Vn(this.file,e,i);O(o,()=>`illegal file path "${o}"`);let l=yield i._parseLayoutFile(o,e.sync,this.currentFile);e.setRegister("blockMode",ce.STORE);let c=yield a.renderTemplates(this.templates,e),d=e.getRegister("blocks",{});d[""]===void 0&&(d[""]=(u,p)=>p.write(c)),e.setRegister("blockMode",ce.OUTPUT),e.push(te(yield s.render(e))),yield a.renderTemplates(l,e,n),e.pop()}*children(e){let n=this.templates.slice();return e&&g(this.file)&&n.push(...yield this.liquid._parsePartialFile(this.file,!0,this.currentFile)),n}*arguments(){for(let e of Object.values(this.args.hash))P(e)&&(yield e);P(this.file)&&(yield this.file)}partialScope(){if(g(this.file))return{name:this.file,isolated:!1,scope:Object.keys(this.args.hash)}}},Sn=class extends b{constructor(e,n,i,s){super(e,n,i),this.templates=[];let r=/\w+/.exec(e.args);for(this.block=r?r[0]:"";n.length;){let a=n.shift();if(ue(a)&&a.name==="endblock")return;let o=s.parseToken(a,n);this.templates.push(o)}throw new Error(`tag ${e.getText()} not closed`)}*render(e,n){let i=this.getBlockRender(e);e.getRegister("blockMode")===ce.STORE?e.getRegister("blocks",{})[this.block]=i:yield i(new Ze,n)}getBlockRender(e){let n=this,{liquid:i,templates:s}=this,r=e.getRegister("blocks",{})[this.block],a=function*(o,l){let c=e.getRegister("blockStack",[]);if(c.includes(n))throw new Error("block tag cannot be nested");c.push(n),e.push(te({block:o})),yield i.renderer.renderTemplates(s,e,l),e.pop(),c.pop()};return r?(o,l)=>r(new Ze(c=>a(o,c)),l):a}*children(){return this.templates}blockScope(){return["block"]}},Tn=class extends b{constructor(e,n,i){for(super(e,n,i),this.tokens=[];n.length;){let s=n.shift();if(ue(s)&&s.name==="endraw")return;this.tokens.push(s)}throw new Error(`tag ${e.getText()} not closed`)}render(){return this.tokens.map(e=>e.getText()).join("")}},On=class extends Fe{constructor(e,n,i,s){super(e,i,s),this.length=e,this.cols=n}row(){return Math.floor(this.i/this.cols)+1}col0(){return this.i%this.cols}col(){return this.col0()+1}col_first(){return this.col0()===0}col_last(){return this.col()===this.cols}},$n=class extends b{constructor(e,n,i,s){super(e,n,i);let r=this.tokenizer.readIdentifier();this.tokenizer.skipBlank();let a=this.tokenizer.readIdentifier(),o=this.tokenizer.readValue();if(a.content!=="in"||!o)throw new Error(`illegal tag: ${e.getText()}`);this.variable=r.content,this.collection=o,this.args=new D(this.tokenizer,i.options.keyValueSeparator),this.templates=[];let l,c=s.parseStream(n).on("start",()=>l=this.templates).on("tag:endtablerow",()=>c.stop()).on("template",d=>l.push(d)).on("end",()=>{throw new Error(`tag ${e.getText()} not closed`)});c.start()}*render(e,n){let i=Me(yield $(this.collection,e)),s=yield this.args.render(e),r=s.offset||0,a=s.limit===void 0?i.length:s.limit;i=i.slice(r,r+a);let o=s.cols||i.length,l=this.liquid.renderer,c=new On(i.length,o,this.collection.getText(),this.variable),d=te({tablerowloop:c});e.push(d);for(let u=0;u<i.length;u++,c.next())d[this.variable]=i[u],c.col0()===0&&(c.row()!==1&&n.write("</tr>"),n.write(`<tr class="row${c.row()}">`)),n.write(`<td class="col${c.col()}">`),yield l.renderTemplates(this.templates,e,n),n.write("</td>");i.length&&n.write("</tr>"),e.pop()}*children(){return this.templates}*arguments(){yield this.collection;for(let e of Object.values(this.args.hash))P(e)&&(yield e)}blockScope(){return[this.variable,"tablerowloop"]}},jn=class extends b{constructor(e,n,i,s){super(e,n,i),this.branches=[],this.elseTemplates=[];let r=[],a=0;s.parseStream(n).on("start",()=>this.branches.push({value:new C(e.tokenizer.readFilteredValue(),this.liquid),test:ft,templates:r=[]})).on("tag:elsif",o=>{if(a>0){r=[];return}this.branches.push({value:new C(o.tokenizer.readFilteredValue(),this.liquid),test:le,templates:r=[]})}).on("tag:else",()=>{a++,r=this.elseTemplates}).on("tag:endunless",function(){this.stop()}).on("template",o=>{(r!==this.elseTemplates||a===1)&&r.push(o)}).on("end",()=>{throw new Error(`tag ${e.getText()} not closed`)}).start()}*render(e,n){let i=this.liquid.renderer;for(let{value:s,test:r,templates:a}of this.branches){let o=yield m(yield s.value(e,e.opts.lenientIf));if(r(o,e)){yield i.renderTemplates(a,e,n);return}}yield i.renderTemplates(this.elseTemplates,e,n)}*children(){let e=this.branches.flatMap(n=>n.templates);return this.elseTemplates&&e.push(...this.elseTemplates),e}arguments(){return this.branches.map(e=>e.value)}},Fn=class extends b{render(e,n){e.breakCalled=!0}},Ln=class extends b{render(e,n){e.continueCalled=!0}},Pn=class extends b{constructor(e,n,i){super(e,n,i),this.tokenizer.skipBlank(),this.tokenizer.end()||(this.value=new C(this.tokenizer.readFilteredValue(),this.liquid))}*render(e,n){if(!this.value)return;let i=yield m(yield this.value.value(e,!1));n.write(i)}*arguments(){this.value&&(yield this.value)}},Cn=class extends b{constructor(e,n,i,s){super(e,n,i);let r=this.tokenizer.readLiquidTagTokens(this.liquid.options);this.templates=s.parseTokens(r)}*render(e,n){yield this.liquid.renderer.renderTemplates(this.templates,e,n)}*children(){return this.templates}},qn=class extends b{constructor(e,n,i){if(super(e,n,i),e.args.search(/\n\s*[^#\s]/g)!==-1)throw new Error("every line of an inline comment must start with a '#' character")}render(){}},Ho={assign:hn,for:pn,capture:fn,case:mn,comment:gn,include:bn,render:yn,decrement:_n,increment:vn,cycle:kn,if:wn,layout:xn,block:Sn,raw:Tn,tablerow:$n,unless:jn,break:Fn,continue:Ln,echo:Pn,liquid:Cn,"#":qn},dt=class t{constructor(e={}){this.renderer=new tn,this.filters=Object.create(null),this.tags=Object.create(null),this.options=Gr(e),this.parser=new U(this),ci(Ho,(n,i)=>this.registerTag(i,n)),ci(Vo,(n,i)=>this.registerFilter(i,n))}parse(e,n){return new U(this).parse(e,n)}_render(e,n,i){let s=n instanceof oe?n:new oe(n,this.options,i,{liquid:this});return this.renderer.renderTemplates(e,s)}render(e,n,i){return w(this,void 0,void 0,function*(){return W(this._render(e,n,Object.assign(Object.assign({},i),{sync:!1})))})}renderSync(e,n,i){return H(this._render(e,n,Object.assign(Object.assign({},i),{sync:!0})))}renderToNodeStream(e,n,i={}){let s=new oe(n,this.options,i,{liquid:this});return this.renderer.renderTemplatesToNodeStream(e,s)}_parseAndRender(e,n,i){let s=this.parse(e);return this._render(s,n,i)}parseAndRender(e,n,i){return w(this,void 0,void 0,function*(){return W(this._parseAndRender(e,n,Object.assign(Object.assign({},i),{sync:!1})))})}parseAndRenderSync(e,n,i){return H(this._parseAndRender(e,n,Object.assign(Object.assign({},i),{sync:!0})))}_parsePartialFile(e,n,i){return new U(this).parseFile(e,n,ye.Partials,i)}_parseLayoutFile(e,n,i){return new U(this).parseFile(e,n,ye.Layouts,i)}_parseFile(e,n,i,s){return new U(this).parseFile(e,n,i,s)}parseFile(e,n){return w(this,void 0,void 0,function*(){return W(new U(this).parseFile(e,!1,n))})}parseFileSync(e,n){return H(new U(this).parseFile(e,!0,n))}*_renderFile(e,n,i){let s=yield this._parseFile(e,i.sync,i.lookupType);return yield this._render(s,n,i)}renderFile(e,n,i){return w(this,void 0,void 0,function*(){return W(this._renderFile(e,n,Object.assign(Object.assign({},i),{sync:!1})))})}renderFileSync(e,n,i){return H(this._renderFile(e,n,Object.assign(Object.assign({},i),{sync:!0})))}renderFileToNodeStream(e,n,i){return w(this,void 0,void 0,function*(){let s=yield this.parseFile(e);return this.renderToNodeStream(s,n,i)})}_evalValue(e,n){let i=new C(e,this),s=n instanceof oe?n:new oe(n,this.options,{},{liquid:this});return i.value(s)}evalValue(e,n){return w(this,void 0,void 0,function*(){return W(this._evalValue(e,n))})}evalValueSync(e,n){return H(this._evalValue(e,n))}registerFilter(e,n){this.filters[e]=n}unregisterFilter(e){delete this.filters[e]}registerTag(e,n){this.tags[e]=S(n)?n:Xr(n)}plugin(e){return e.call(this,t)}express(){let e=this,n=!0;return function(i,s,r){if(n){n=!1;let a=Je(this.root);e.options.root.unshift(...a),e.options.layouts.unshift(...a),e.options.partials.unshift(...a)}e.renderFile(i,s).then(a=>r(null,a),r)}}analyze(e,n={}){return w(this,void 0,void 0,function*(){return Q(e,n)})}analyzeSync(e,n={}){return Z(e,n)}parseAndAnalyze(e,n,i={}){return w(this,void 0,void 0,function*(){return Q(this.parse(e,n),i)})}parseAndAnalyzeSync(e,n,i={}){return Z(this.parse(e,n),i)}variables(e,n={}){return w(this,void 0,void 0,function*(){let i=yield Q(g(e)?this.parse(e):e,n);return Object.keys(i.variables)})}variablesSync(e,n={}){let i=Z(g(e)?this.parse(e):e,n);return Object.keys(i.variables)}fullVariables(e,n={}){return w(this,void 0,void 0,function*(){let i=yield Q(g(e)?this.parse(e):e,n);return Array.from(new Set(Object.values(i.variables).flatMap(s=>s.map(r=>String(r)))))})}fullVariablesSync(e,n={}){let i=Z(g(e)?this.parse(e):e,n);return Array.from(new Set(Object.values(i.variables).flatMap(s=>s.map(r=>String(r)))))}variableSegments(e,n={}){return w(this,void 0,void 0,function*(){let i=yield Q(g(e)?this.parse(e):e,n);return Array.from(Ue(Object.values(i.variables).flatMap(s=>s.map(r=>r.toArray()))))})}variableSegmentsSync(e,n={}){let i=Z(g(e)?this.parse(e):e,n);return Array.from(Ue(Object.values(i.variables).flatMap(s=>s.map(r=>r.toArray()))))}globalVariables(e,n={}){return w(this,void 0,void 0,function*(){let i=yield Q(g(e)?this.parse(e):e,n);return Object.keys(i.globals)})}globalVariablesSync(e,n={}){let i=Z(g(e)?this.parse(e):e,n);return Object.keys(i.globals)}globalFullVariables(e,n={}){return w(this,void 0,void 0,function*(){let i=yield Q(g(e)?this.parse(e):e,n);return Array.from(new Set(Object.values(i.globals).flatMap(s=>s.map(r=>String(r)))))})}globalFullVariablesSync(e,n={}){let i=Z(g(e)?this.parse(e):e,n);return Array.from(new Set(Object.values(i.globals).flatMap(s=>s.map(r=>String(r)))))}globalVariableSegments(e,n={}){return w(this,void 0,void 0,function*(){let i=yield Q(g(e)?this.parse(e):e,n);return Array.from(Ue(Object.values(i.globals).flatMap(s=>s.map(r=>r.toArray()))))})}globalVariableSegmentsSync(e,n={}){let i=Z(g(e)?this.parse(e):e,n);return Array.from(Ue(Object.values(i.globals).flatMap(s=>s.map(r=>r.toArray()))))}};var gt=class extends dt{constructor(e={}){super({...e,fs:oi})}};function yt(t){try{let e=JSON.parse(t?.value??"{}").groups;return Array.isArray(e)?e:[]}catch{return[]}}function bt(t){return String(t?.value??"").split(",").map(e=>e.trim()).filter(Boolean)}function _t(t,e){let n=new Map;for(let s of t)n.set(s,(n.get(s)??0)+1);if(!t.length)return{ok:!0,counts:n};let i=new Map;for(let[s,r]of n){let a=e.find(o=>o.addons?.includes(s));if(!a)return{ok:!1,counts:n,reason:"not_allowed"};i.set(a.key,(i.get(a.key)??0)+r)}for(let s of e)if((i.get(s.key)??0)>(s.max??1/0))return{ok:!1,counts:n,reason:"too_many"};return{ok:!0,counts:n}}function ss(t,e,n){let i=Object.fromEntries(e.addons.map(s=>[s.handle,s]));return{groups:t.groups.map(s=>{let r=e.groups[s],a=r.options.map(o=>o.addon?{label:i[o.addon].title,label_id:i[o.addon].title_id,price:i[o.addon].price,variant:n[o.addon]}:{label:o.label,label_id:o.label_id,price:0});return{key:s,title:r.title,title_id:r.title_id,min:r.min,max:r.max,options:a,addons:a.filter(o=>o.variant).map(o=>o.variant)}})}}var rs=new URL("..","file:///repo/preview/server.mjs"),M=JSON.parse(K(new URL("scripts/catalog.json",rs),"utf8")),Jo=new URL("design/out/",rs),kt=class extends A{constructor(e){super(),this.value=e}valueOf(){return typeof this.value=="object"?JSON.stringify(this.value):this.value}toString(){return String(this.valueOf())}},Go=(t,e)=>{if(!Ie(new URL(t,Jo)))return null;let n={id:t,src:`/img/${t}`,width:1200,height:900,aspect_ratio:4/3,alt:e,media_type:"image"};return n.preview_image=n,n},Un=t=>`gid://shopify/ProductVariant/${t}`,as=Un,ne=7e3,be=[],os={};for(let t of M.addons){let e=ne++;os[t.handle]=Un(e),be.push({id:ne++,handle:t.handle,type:"Add-on",title:t.title,title_id:t.title_id,art:null,variants:[{id:e,title:"Default Title",price:t.price}],hidden:!0})}for(let t of M.menu)be.push({id:ne++,handle:t.handle,type:"Menu",title:t.title,title_id:t.title_id,description:t.description,description_id:t.description_id,art:t.art,category:t.category,tags:[`category:${t.category}`,...t.diet.map(e=>`diet:${e}`)],variants:[{id:ne++,title:"Default Title",price:t.price}],meta:{modifiers:ss(t,M,os),diet:t.diet}});for(let t of M.beans)be.push({id:ne++,handle:t.handle,type:"Coffee beans",title:t.title,title_id:t.title_id,description:t.description,description_id:t.description_id,art:t.art,tags:["beans"],variants:t.variants.map(e=>({id:ne++,title:e.size,price:e.price}))});var Re=M.gift_card;be.push({id:ne++,handle:Re.handle,type:"Gift card",title:Re.title,title_id:Re.title_id,description:"Sent by email in a minute. Works online and at the counter.",description_id:"Dikirim lewat email dalam semenit. Bisa dipakai online dan di kasir.",art:Re.art,gift:!0,tags:["gift-card"],variants:Re.denominations.map(t=>({id:ne++,title:`Rp${t/1e3}k`,price:t}))});var ie=new Map;for(let t of be)for(let e of t.variants)ie.set(String(e.id),{p:t,v:e}),ie.set(Un(e.id),{p:t,v:e});var Wn={en:{prefix:""},id:{prefix:"/id"}},In=(t,e,n)=>n==="id"&&t[`${e}_id`]||t[e];function _e(t="en"){let e=Wn[t].prefix,n={};for(let a of be){let o=a.art?[Go(`${a.art}.png`,a.title)].filter(Boolean):[],l=a.variants.map(d=>({id:d.id,title:d.title,price:d.price*100,available:!0,compare_at_price:null})),c=In(a,"description",t);n[a.handle]={id:a.id,handle:a.handle,title:In(a,"title",t),type:a.type,url:`${e}/products/${a.handle}`,tags:a.tags??[],description:c?`<p>${c}</p>`:"",media:o,featured_media:o[0]??null,featured_image:o[0]??null,variants:l,selected_or_first_available_variant:l[0],price:l[0].price,available:!0,"gift_card?":!!a.gift,has_only_default_variant:l.length===1&&l[0].title==="Default Title",metafields:{pagi:a.meta?{modifiers:new kt(a.meta.modifiers),diet:new kt(a.meta.diet)}:{}},_category:a.category}}let i=Object.values(n).filter(a=>a.type==="Menu"),s={};for(let a of M.categories){let o=i.filter(l=>l._category===a.handle);s[a.handle]={handle:a.handle,title:In(a,"title",t),url:`${e}/collections/${a.handle}`,description:"",products:o,products_count:o.length}}let r=Object.values(n).filter(a=>a.type==="Coffee beans");return s.beans={handle:"beans",title:t==="id"?"Biji kopi":"Coffee beans",url:`${e}/collections/beans`,description:t==="id"?"<p>Disangrai setiap minggu di Canggu.</p>":"<p>Roasted weekly in Canggu.</p>",products:r,products_count:r.length},s.all={handle:"all",title:"All",url:`${e}/collections/all`,description:"",products:i,products_count:i.length},{products:n,collections:s,prefix:e}}function ls(t){let e=Wn[t].prefix,n=t==="id";return{"main-menu":{links:[{title:"Menu",url:`${e}/#menu`},{title:n?"Biji kopi":"Beans",url:`${e}/collections/beans`},{title:n?"Kartu hadiah":"Gift cards",url:`${e}/products/pagi-gift-card`},{title:n?"Katering":"Catering",url:`${e}/pages/catering`}]},footer:{links:[{title:n?"Katering":"Catering",url:`${e}/pages/catering`},{title:n?"Kartu hadiah":"Gift cards",url:`${e}/products/pagi-gift-card`},{title:n?"Papan dapur (demo)":"Kitchen board (demo)",url:"/kitchen"},{title:n?"Privasi":"Privacy",url:`${e}/policies/privacy-policy`}]}}}var Hn=t=>({catering:{handle:"catering",title:t==="id"?"Katering":"Catering",url:`${Wn[t].prefix}/pages/catering`,template_suffix:"catering",content:""}}),cs=Object.fromEntries(["hero-pagi","beans-kintamani","gift-card","platter"].map(t=>[`${t}.png`,{src:`/img/${t}.png`,width:t==="hero-pagi"?1600:1200,height:t==="hero-pagi"?1200:900,aspect_ratio:4/3,alt:""}]));var us=t=>({open:t.hours.open,kitchen_close:t.hours.kitchen_close,slot_minutes:t.slot_minutes,lead_minutes:t.lead_minutes,days_ahead:t.days_ahead,dishes_per_slot:t.dishes_per_slot}),ds=t=>String(t).padStart(2,"0"),Jn=t=>{let[e,n]=t.split(":").map(Number);return e*60+n},hs=t=>`${ds(Math.floor(t/60))}:${ds(t%60)}`;function ps(t,e=new Date){let n=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:t,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(e).map(i=>[i.type,i.value]));return`${n.year}-${n.month}-${n.day}T${n.hour}:${n.minute}`}function ke(t,e){let n=new Date(`${t}T00:00:00Z`);return n.setUTCDate(n.getUTCDate()+e),n.toISOString().slice(0,10)}function Ne(t){let e=[];for(let n=Jn(t.open);n<=Jn(t.kitchen_close);n+=t.slot_minutes)e.push(hs(n));return e}function Yo(t,e){let n=t.slice(0,10);return Array.from({length:e.days_ahead+1},(s,r)=>ke(n,r)).flatMap(s=>Ne(e).map(r=>`${s}T${r}`))}function Ko(t,e){let n=Jn(t.slice(11))+e.lead_minutes;return`${ke(t.slice(0,10),Math.floor(n/1440))}T${hs(n%1440)}`}function Gn({now:t,used:e={},paused:n=[],cfg:i}){let s=Ko(t,i),r=new Set(n),a=new Map;for(let o of Yo(t,i)){let l=Math.max(0,i.dishes_per_slot-Number(e[o]??0)),c=o<s?"passed":r.has(o)?"paused":l===0?"full":null,d=o.slice(0,10);a.has(d)||a.set(d,[]),a.get(d).push({slot:o,time:o.slice(11),left:c?0:l,open:!c,reason:c})}return[...a].map(([o,l])=>({date:o,slots:l}))}function fs(t){let e=[],n={};for(let i of Gn(t))for(let s of i.slots)s.open?t.used?.[s.slot]&&(n[s.slot]=Number(t.used[s.slot])):e.push(s.slot);return{closed:e,used:n}}var we=us(M.shop),se=()=>process.env.PREVIEW_NOW||ps(M.shop.timezone),ms=["Ana","Wayan","Lucas","Made","Sophie","Ketut","Noah","Putu","Mia","Komang","Jack","Dewi","Liam","Nyoman","Emma"],gs=M.menu.filter(t=>t.category!=="drinks");function ze(t){let e=2166136261;for(let n of t)e=Math.imul(e^n.charCodeAt(0),16777619);return e^=e>>>16,e=Math.imul(e,2246822507),e^=e>>>13,e=Math.imul(e,3266489909),e^=e>>>16,(e>>>0)/4294967296}function Qo(t){let e=[],n=t.slice(0,10);for(let i of[n,ke(n,1)])for(let s of Ne(we)){let r=`${i}T${s}`,a=ze(r),o=s>="08:45"&&s<="10:15",c=i!==n&&s==="09:00"||i!==n&&s==="09:15"?12:i!==n&&s==="09:30"?10:o?Math.floor(a*11):a>.55?Math.floor(a*6):0,d=0;for(;c>0;){let u=Math.min(c,1+Math.floor(ze(r+d)*3)),p=gs[Math.floor(ze(r+"d"+d)*gs.length)];e.push({slot:r,fulfilment:ze(r+"f"+d)>.7?"delivery":"pickup",dishes:u,customer:ms[Math.floor(ze(r+"n"+d)*ms.length)],items:[{title:p.title,quantity:u,notes:p.groups.includes("eggs")?["Eggs: Poached"]:[]}],status:r<t?"collected":"new",cancelled:0}),c-=u,d++}}return e.forEach((i,s)=>{let r=1e3-e.length+s+1;Object.assign(i,{id:String(r),name:`#${r}`})}),e}var z={orders:null,paused:new Set,number:1e3,day:null};function wt(){let t=se().slice(0,10);z.day!==t&&(z.orders=Qo(se()),z.day=t)}function vt(t){wt();let e={};for(let n of z.orders)!n.cancelled&&n.slot>=t&&(e[n.slot]=(e[n.slot]??0)+n.dishes);return e}var xt=()=>[...z.paused].sort(),ys=t=>z.paused.has(t)?z.paused.delete(t):z.paused.add(t);function bs(t){return wt(),z.orders.filter(e=>!e.cancelled&&e.slot.startsWith(t)).sort((e,n)=>e.slot.localeCompare(n.slot)||Number(e.id)-Number(n.id))}function _s(t,e){wt();let n=z.orders.find(i=>i.id===String(t));return n&&(n.status=e),n?.slot}function ks(t){wt();let e=++z.number;return z.orders.push({...t,id:String(e),name:`#${e}`,status:"new",cancelled:0}),`#${e}`}var ws=()=>{let t=se();return{now:t,earliest:null,days:Gn({now:t,used:vt(t.slice(0,10)),paused:xt(),cfg:we})}},vs=()=>{let t=se();return fs({now:t,used:vt(t.slice(0,10)),paused:xt(),cfg:we})};var he=(t="")=>String(t).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),xs=(t,e)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title><style>
body{margin:0;font:16px/1.5 system-ui,sans-serif;background:#f6f6f7;color:#1a1a1a}
.wrap{max-width:980px;margin:auto;padding:24px 16px;display:grid;gap:24px}
@media(min-width:860px){.wrap{grid-template-columns:1.2fr 1fr}}
.panel{background:#fff;border:1px solid #e3e3e3;border-radius:12px;padding:20px;display:grid;gap:14px;align-content:start}
h1{font-size:22px;margin:0}h2{font-size:17px;margin:0}
.note{font-size:13px;color:#616161;background:#fff8e6;border:1px solid #f1d7a0;border-radius:8px;padding:10px 12px}
.err{background:#fff1f0;border:1px solid #f3b7b1;color:#8e1f0b;border-radius:8px;padding:12px 14px}
.err li{margin:2px 0}
label{display:grid;gap:4px;font-size:14px}input{font:inherit;padding:12px;border:1px solid #c9c9c9;border-radius:8px}
button,.btn{font:inherit;font-weight:600;padding:14px 18px;border:0;border-radius:8px;background:#1a1a1a;color:#fff;cursor:pointer;text-align:center;text-decoration:none}
.btn--ghost{background:#fff;color:#1a1a1a;border:1px solid #c9c9c9}
.row{display:flex;justify-content:space-between;gap:12px}.muted{color:#616161;font-size:14px}.total{font-weight:700;font-size:18px}
</style></head><body><div class="wrap">${e}</div></body></html>`;function Ss({cart:t,money:e,errors:n,slotLabel:i,base:s=""}){let a=`<section class="panel"><h2>Order summary</h2>${t.items.map(l=>`<div class="row"><span>${l.quantity}\xD7 ${he(l.product.title)}<br><span class="muted">${Object.entries(l.properties).filter(([c,d])=>!c.startsWith("_")&&d).map(([c,d])=>`${he(c)}: ${he(d)}`).join(" \xB7 ")}</span></span><span>${e(l.final_line_price)}</span></div>`).join("")}<div class="row total"><span>Total</span><span>${e(t.total_price)}</span></div>
    <p class="muted">${i?he(i):"No pickup or delivery time"}</p></section>`,o=n.length?`<div class="err"><b>Your order can't be placed yet</b><ul>${n.map(l=>`<li>${he(l)}</li>`).join("")}</ul></div>
       <a class="btn btn--ghost" href="${s}/cart">Return to cart</a>`:`<form method="post" action="${s}/checkout/complete" style="display:grid;gap:14px">
         <label>Name for the order<input name="name" value="Demo guest" required></label>
         <label>WhatsApp<input name="phone" value="+62 812 0000 0000"></label>
         <button type="submit">Place order (demo, no payment)</button>
       </form>`;return xs("Checkout",`<section class="panel"><h1>Checkout</h1>
      <p class="note">Demo checkout. On Shopify this page is Shopify's own; the pickup-slot Validation Function runs here and gives these exact messages. This one ran the same Function code on your cart.</p>
      ${o}</section>${a}`)}var Ts=({name:t,slotLabel:e,date:n="",base:i=""})=>xs("Order placed",`<section class="panel"><h1>Order ${he(t)} placed</h1><p>${he(e)}</p>
      <p class="muted">Your order now counts against that slot's kitchen capacity, so the slot picker shows fewer dishes left.</p>
      <a class="btn" href="${i}/kitchen${n?`?date=${n}`:""}">See it on the kitchen board</a><a class="btn btn--ghost" href="${i}/">Back to the shop</a></section>`);function Os(t){let e=[];for(let n of t.cart.lines){let i=n.merchandise;if(i?.__typename!=="ProductVariant")continue;let s=bt(n.mods);if(!s.length)continue;let{ok:r,counts:a}=_t(s,yt(i.product?.modifiers));r&&e.push({lineExpand:{cartLineId:n.id,expandedCartItems:[{merchandiseId:i.id,quantity:1},...[...a].map(([o,l])=>({merchandiseId:o,quantity:l}))]}})}return{operations:e}}var $s={open:"08:00",kitchen_close:"15:30",slot_minutes:15,days_ahead:2,dishes_per_slot:12};function Xo(t){try{return{...$s,...JSON.parse(t?.value??"{}")}}catch{return $s}}function el(t){try{let e=JSON.parse(t?.value??"{}");return{closed:Array.isArray(e.closed)?e.closed:[],used:e.used&&typeof e.used=="object"?e.used:{}}}catch{return{closed:[],used:{}}}}var St=t=>{let[e,n]=t.split(":").map(Number);return e*60+n},js=t=>Math.floor(Date.UTC(...t.split("-").map((e,n)=>Number(e)-(n===1?1:0)))/864e5),Yn=t=>t.slice(11,16);function tl(t){let e=[],n=y=>e.push({message:y,target:"$.cart"}),i=Xo(t.validation?.config),s=el(t.shop?.slotState),r=t.cart.lines.filter(y=>y.merchandise?.__typename==="ProductVariant"&&y.merchandise.product?.productType==="Menu");for(let y of r){let{ok:B}=_t(bt(y.mods),yt(y.merchandise.product.modifiers));B||n(`One of the add-ons on ${y.merchandise.product.title} isn't available. Remove it and add it again.`)}if(!r.length)return e;let a=t.cart.fulfilment?.value;if(a!=="pickup"&&a!=="delivery")return n("Choose pickup or delivery for your food order."),e;let o=t.cart.slot?.value??"",l=/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(o);if(!l)return n(`Choose a ${a} time for your food order.`),e;let[,c,d]=l,u=t.shop?.localTime?.date;if(u){let y=js(c)-js(u);if(y<0)return n(`That ${a} time has passed. Choose another.`),e;if(y>i.days_ahead)return n(`We take orders up to ${i.days_ahead} days ahead.`),e}let p=St(d);if(p<St(i.open)||p>St(i.kitchen_close)||(p-St(i.open))%i.slot_minutes!==0)return n(`The kitchen takes orders for ${i.open}\u2013${i.kitchen_close}. Choose a time in those hours.`),e;if(s.closed.includes(o))return n(`${Yn(o)} is no longer available. Choose another time.`),e;let f=r.reduce((y,B)=>y+B.quantity,0),v=i.dishes_per_slot-Number(s.used[o]??0);return f>v&&n(v>0?`Only ${v} more dishes fit in the ${Yn(o)} slot. Choose a later time or split the order.`:`${Yn(o)} is full. Choose another time.`),e}function Kn(t){let e=tl(t);return{operations:e.length?[{validationAdd:{errors:e}}]:[]}}var Ee=(t="")=>String(t).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]);function Fs({date:t,orders:e,paused:n,cfg:i,used:s}){let r=Map.groupBy(e,l=>l.slot.slice(11)),a=new Set(n),o=Ne(i).map(l=>{let c=`${t}T${l}`,d=r.get(l)??[],u=s[c]??0,p=u>i.dishes_per_slot,f=d.map(v=>`<article class="card ${v.status}">
  <header><b>${Ee(v.name)}</b> <span class="tag ${v.fulfilment}">${v.fulfilment}</span> <span>${Ee(v.customer??"")}</span></header>
  <ul>${v.items.map(y=>`<li><b>${y.quantity}\xD7</b> ${Ee(y.title)}${y.notes.length?`<small>${y.notes.map(Ee).join(" \xB7 ")}</small>`:""}</li>`).join("")}</ul>
  <form method="post" action="kitchen/orders/${Ee(v.id)}/${v.status==="ready"?"collected":"ready"}?date=${t}">
    ${v.status==="collected"?"<em>Collected</em>":`<button>${v.status==="ready"?"Collected":"Ready"}</button>`}
  </form>
</article>`).join("");return`<section id="t${l.replace(":","")}" class="slot${p?" over":""}${a.has(c)?" paused":""}${d.length?"":" empty"}">
  <h2>${l} <span>${u}/${i.dishes_per_slot} dishes${p?" \xB7 over capacity":""}</span>
    <form method="post" action="kitchen/slots/${c}/pause?date=${t}"><button class="link">${a.has(c)?"Resume":"Pause"}</button></form></h2>
  ${f}
</section>`}).join("");return`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="30"><title>Kitchen \xB7 ${t}</title>
<style>
body{margin:0;font:15px/1.4 system-ui,sans-serif;background:#1d1a16;color:#f4ece0}
main{padding:16px;display:grid;gap:10px;max-width:1100px;margin:auto}
h1{font-size:20px;margin:0 0 4px}h2{font-size:16px;margin:0 0 8px;display:flex;gap:10px;align-items:center}h2 span{font-weight:400;opacity:.7}
.slot{background:#2a2520;border-radius:10px;padding:10px 12px;scroll-margin-top:120px}.slot.empty{opacity:.45}.slot.over{outline:2px solid #ff7a59}.slot.paused{background:repeating-linear-gradient(45deg,#2a2520 0 10px,#332c25 10px 20px)}
.card{background:#f4ece0;color:#1d1a16;border-radius:8px;padding:8px 10px;margin:6px 0;display:grid;grid-template-columns:1fr auto;gap:4px 12px}
.card header{grid-column:1/-1}.card ul{margin:0;padding-left:18px}.card small{display:block;color:#6b5d4d}.card.ready{background:#d5ecc2}.card.collected{opacity:.5}
.tag{font-size:12px;padding:1px 8px;border-radius:99px;background:#e9b44c}.tag.delivery{background:#8fc1e3}
button{font:inherit;padding:8px 16px;border:0;border-radius:6px;background:#1d1a16;color:#f4ece0;cursor:pointer}button.link{background:none;color:inherit;opacity:.7;padding:0;text-decoration:underline}
form{margin:0;align-self:end}h2 form{margin-left:auto}
</style></head><body><main>
<h1>Kitchen \xB7 ${t}</h1>
<form method="get" action="kitchen"><input type="date" name="date" value="${t}"> <button>Show</button></form>
${o}
</main></body></html>`}var nl=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;function Ls(t,{catering:e,today:n}){let i={},s=String(t.name??"").trim(),r=String(t.email??"").trim().toLowerCase(),a=String(t.phone??"").trim(),o=String(t.date??""),l=Number(t.guests),c=e.packages.find(u=>u.key===t.package);if((!s||s.length>120)&&(i.name="Tell us your name."),(!nl.test(r)||r.length>254)&&(i.email="Enter a valid email."),a&&!/^\+?[\d\s-]{7,20}$/.test(a)&&(i.phone="Enter a phone number with digits only."),(!/^\d{4}-\d{2}-\d{2}$/.test(o)||o<ke(n,e.min_days_ahead))&&(i.date=`Choose a date at least ${e.min_days_ahead} days from today.`),(!Number.isInteger(l)||l<e.min_guests||l>e.max_guests)&&(i.guests=`We cater for ${e.min_guests} to ${e.max_guests} guests.`),c||(i.package="Choose a package."),Object.keys(i).length)return{errors:i};let d=String(t.notes??"").trim().slice(0,1e3);return{request:{name:s,email:r,phone:a||null,date:o,guests:l,package:c.key,pkg:c,notes:d||null}}}var ii=new URL("..","file:///repo/preview/server.mjs"),re=new URL("theme/",ii),Qn=Number(process.env.PORT||9595),Ot=t=>Ft(new URL(t,re),"utf8"),Ps={en:JSON.parse(K(new URL("locales/en.default.json",re),"utf8")),id:JSON.parse(K(new URL("locales/id.json",re),"utf8"))},il=JSON.parse(K(new URL("preview/content.id.json",ii),"utf8")),Cs=[{iso_code:"en",name:"English",endonym_name:"English"},{iso_code:"id",name:"Indonesian",endonym_name:"Bahasa Indonesia"}],Tt=t=>`Rp${Math.round(Number(t||0)/100).toLocaleString("de-DE")}`,Xn=class extends A{constructor(e){super(),this.hex=e;let n=parseInt(e.slice(1),16);Object.assign(this,{red:n>>16&255,green:n>>8&255,blue:n&255})}valueOf(){return this.hex}toString(){return this.hex}};function sl(t,e,n){if(e==null||e==="")return null;let i=n.__data,s=r=>typeof r=="string"&&r.startsWith("/")&&!r.startsWith("/apps/")&&!r.startsWith("/kitchen")?i.prefix+r:r;switch(t){case"color":return new Xn(e);case"collection":return i.collections[e]??null;case"collection_list":return e.map(r=>i.collections[r]).filter(Boolean);case"product":return i.products[e]??null;case"image_picker":return cs[String(e).replace("shopify://shop_images/","")]??null;case"link_list":return ls(n.__locale)[e]??{links:[]};case"url":return s(e);case"text":case"textarea":return n.__locale==="id"?il[e]??e:e;default:return e}}function ei(t=[],e={},n){let i={};for(let s of t)s.id&&(i[s.id]=sl(s.type,e[s.id]??s.default,n));return i}var rl=JSON.parse(K(new URL("config/settings_schema.json",re),"utf8")).flatMap(t=>t.settings??[]),al=JSON.parse(K(new URL("config/settings_data.json",re),"utf8")).presets.Default,pe=new gt({root:Lt(re),partials:Lt(new URL("snippets/",re)),extname:".liquid",strictFilters:!0}),De=t=>Object.fromEntries(t.filter(Array.isArray)),ti=class{constructor(e,n){this.img=e,this.width=n}toString(){return`${this.img.src}${this.width?`?width=${this.width}`:""}`}toJSON(){return this.toString()}},ol={t(t,...e){let n=De(e),i=r=>t.split(".").reduce((a,o)=>a?.[o],r),s=i(Ps[this.context.globals.__locale??"en"])??i(Ps.en);return s&&typeof s=="object"&&(s=Number(n.count)===1?s.one:s.other),typeof s!="string"?`translation missing: ${t}`:s.replace(/\{\{\s*(\w+)\s*\}\}/g,(r,a)=>String(n[a]??""))},money:t=>Tt(t),money_with_currency:t=>`${Tt(t)} IDR`,money_without_trailing_zeros:t=>Tt(t),asset_url:t=>`/assets/${t}`,shopify_asset_url:t=>`https://cdn.shopify.com/s/shopify/${t}`,stylesheet_tag:t=>`<link href="${t}" rel="stylesheet">`,preload_tag:(t,...e)=>`<link href="${t}" rel="preload" as="${De(e).as}" type="${De(e).type}" crossorigin>`,image_url:(t,...e)=>t?new ti(t.preview_image??t,De(e).width):"",image_tag(t,...e){if(!t)return"";let n=De(e),i=t.img??{},s={src:String(t),alt:n.alt??i.alt??"",width:i.width,height:i.height};n.widths&&(s.srcset=String(n.widths).split(",").map(r=>`${i.src}?width=${r.trim()} ${r.trim()}w`).join(", "));for(let[r,a]of Object.entries(n))["widths","preload","alt","height"].includes(r)||(s[r]=a);return`<img ${Object.entries(s).filter(([,r])=>r!=null).map(([r,a])=>`${r}="${String(a).replace(/"/g,"&quot;")}"`).join(" ")}>`},default_pagination:()=>"",format_code:t=>String(t).replace(/(.{4})/g,"$1 ").trim(),handleize:t=>String(t).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),handle:t=>String(t).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")};for(let[t,e]of Object.entries(ol))pe.registerFilter(t,e);pe.registerTag("schema",class extends b{constructor(t,e,n){for(super(t,e,n);e.length&&e.shift().name!=="endschema";);}*render(){}});var ll={product:"/cart/add",localization:"/localization"};pe.registerTag("form",class extends b{constructor(t,e,n){super(t,e,n);let i=t.args.match(/^\s*'([^']+)'\s*(?:,\s*([a-z_.]+)(?=\s*(?:,|$)))?\s*,?(.*)$/s);this.type=i[1],this.hash=new D(i[3]??""),this.tpls=[];let s=n.parser.parseStream(e).on("tag:endform",()=>s.stop()).on("template",r=>this.tpls.push(r));s.start()}*render(t,e){let n=yield this.hash.render(t),i=t.globals.__data?.prefix??"";e.write(`<form method="post" action="${i}${ll[this.type]??"/"}" ${Object.entries(n).map(([s,r])=>`${s}="${r}"`).join(" ")}><input type="hidden" name="form_type" value="${this.type}">`),t.push({form:{errors:null,"posted_successfully?":!1}}),yield this.liquid.renderer.renderTemplates(this.tpls,t,e),t.pop(),e.write("</form>")}});pe.registerTag("paginate",class extends b{constructor(t,e,n){super(t,e,n),this.tpls=[];let i=n.parser.parseStream(e).on("tag:endpaginate",()=>i.stop()).on("template",s=>this.tpls.push(s));i.start()}*render(t,e){t.push({paginate:{pages:1,current_page:1}}),yield this.liquid.renderer.renderTemplates(this.tpls,t,e),t.pop()}});async function $t(t,e={},n=t,i,s=1){let r=await Ot(`sections/${t}.liquid`),a=r.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/),o=a?JSON.parse(a[1]):{},l=Object.fromEntries((o.blocks??[]).map(f=>[f.type,f])),c=(e.block_order??Object.keys(e.blocks??{})).map(f=>({id:f,type:e.blocks[f].type,settings:ei(l[e.blocks[f].type]?.settings,e.blocks[f].settings,i),shopify_attributes:""})),d={id:n,index:s,settings:ei(o.settings,e.settings,i),blocks:c},u=await pe.parseAndRender(r,{section:d},{globals:i}),p=o.tag??"div";return`<${p} id="shopify-section-${n}" class="shopify-section">${u}</${p}>`}for(let t of["section","sections"])pe.registerTag(t,class extends b{constructor(e,n,i){super(e,n,i),this.arg=e.args.trim().replace(/['"]/g,"")}*render(e,n){let i=e.getAll();if(t==="section")return n.write(yield $t(this.arg,{},this.arg,i));let s=JSON.parse(yield Ot(`sections/${this.arg}.json`));for(let r of s.order)n.write(yield $t(s.sections[r].type,s.sections[r],`sections--1__${r}`,i))}});var E=[],j={};function Ms(){return{cart:{lines:E.map((t,e)=>{let{p:n}=ie.get(String(t.id));return{id:`gid://shopify/CartLine/${e}`,quantity:t.quantity,mods:t.properties._mods?{value:t.properties._mods}:null,merchandise:{__typename:"ProductVariant",id:as(t.id),product:{title:n.title,productType:n.type,modifiers:n.meta?{value:JSON.stringify(n.meta.modifiers)}:null}}}})}}}function ni(t){let e=Ms(),n={};for(let s of Os(e).operations)n[s.lineExpand.cartLineId]=s.lineExpand.expandedCartItems;let i=E.map((s,r)=>{let{p:a,v:o}=ie.get(String(s.id)),l=t.products[a.handle],c=l.variants.find(p=>String(p.id)===String(s.id)),d=n[`gid://shopify/CartLine/${r}`],u=d?d.reduce((p,f)=>p+ie.get(f.merchandiseId).v.price*100*f.quantity,0):o.price*100;return{key:`${s.id}:${r}`,url:l.url,image:l.featured_media,product:l,variant:c,quantity:s.quantity,properties:s.properties,item_components:d?d.slice(1).map(p=>({title:ie.get(p.merchandiseId).p.title,quantity:p.quantity})):[],original_line_price:u*s.quantity,final_line_price:u*s.quantity}});return{items:i,item_count:i.reduce((s,r)=>s+r.quantity,0),total_price:i.reduce((s,r)=>s+r.final_line_price,0),attributes:j,currency:{iso_code:"IDR"}}}function qs(){return{cart:{fulfilment:j.fulfilment?{value:j.fulfilment}:null,slot:j.pickup_slot?{value:j.pickup_slot}:null,lines:Ms().cart.lines.map(({quantity:t,mods:e,merchandise:n})=>({quantity:t,mods:e,merchandise:n}))},shop:{localTime:{date:se().slice(0,10)},slotState:{value:JSON.stringify(vs())}},validation:{config:{value:JSON.stringify(we)}}}}function Bs(t,e,n={}){let i=_e(t),s={__data:i,__locale:t},r=i.prefix;return{...s,settings:ei(rl,al,s),shop:{name:"Pagi",description:M.shop.tagline,url:"https://pagi.example"},cart:ni(i),localization:{language:Cs.find(a=>a.iso_code===t),available_languages:Cs},request:{locale:{iso_code:t},page_type:n.template?.name??"index"},routes:{root_url:r||"/",cart_url:`${r}/cart`,cart_add_url:`${r}/cart/add`,cart_change_url:`${r}/cart/change`,cart_update_url:`${r}/cart/update`,all_products_collection_url:`${r}/collections/all`},canonical_url:e.href,page_title:"Pagi",page_description:t==="id"?"Brunch dan kopi di Pererenan. Pesan duluan, ambil tanpa antre.":"Brunch and specialty coffee in Pererenan, Bali. Order ahead and collect without the queue, or get it delivered within 5 km.",content_for_header:"<script>window.Shopify = { analytics: { publish(n, d) { console.log('[analytics]', n, JSON.stringify(d)); } } };<\/script>",...n}}async function Y(t,e,n,i={}){let s=JSON.parse(await Ot(`templates/${t}.json`)),r=Bs(e,n,{template:{name:t.split(".")[0]},...i}),a=n.searchParams.get("section_id"),o="",l=0;for(let c of s.order){let d=`template--1__${c}`;a&&a!==d||(o+=await $t(s.sections[c].type,s.sections[c],d,r,++l))}return a?o:pe.parseAndRender(await Ot("layout/theme.liquid"),{},{globals:{...r,content_for_layout:o}})}async function Zn(t,e,n){let i={};for(let s of t)s==="cart-drawer"?i[s]=await $t("cart-drawer",{},"cart-drawer",Bs(e,n)):s.startsWith("template--1__")&&(i[s]=await Y("cart",e,new URL(`/cart?section_id=${s}`,n)));return i}async function ve(t){let e=[];for await(let s of t)e.push(s);let n=Buffer.concat(e).toString(),i=t.headers["content-type"]||"";if(i.includes("application/json"))return JSON.parse(n||"{}");if(i.includes("multipart/form-data")){let s={};for(let r of n.split(/-{2,}\S+/)){let a=r.match(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/);a&&(s[a[1]]=a[2])}return s}return Object.fromEntries(new URLSearchParams(n))}function cl(t){if(t.items)return t.items.map(n=>({id:n.id,quantity:Number(n.quantity||1),properties:n.properties??{}}));let e={};for(let[n,i]of Object.entries(t)){let s=n.match(/^properties\[(.+)\]$/);s&&i!==""&&(e[s[1]]=i)}return[{id:t.id,quantity:Number(t.quantity||1),properties:e}]}var As=()=>j.pickup_slot?`${j.fulfilment==="delivery"?"Delivery":"Pickup"} at ${j.pickup_slot.slice(11)}, ${j.pickup_slot.slice(0,10)}`:"",dl={".css":"text/css",".js":"text/javascript",".png":"image/png",".woff2":"font/woff2"};ai(async(t,e)=>{let n=new URL(t.url,`http://localhost:${Qn}`),i=(o,l,c="text/html; charset=utf-8",d={})=>{e.writeHead(o,{"Content-Type":c,...d}),e.end(l)},s=(o,l)=>i(o,JSON.stringify(l),"application/json"),r=n.pathname,a="en";(r==="/id"||r.startsWith("/id/"))&&(a="id",r=r.slice(3)||"/");try{if(r==="/favicon.ico")return i(204,"");if(r.startsWith("/assets/")||r.startsWith("/img/")){let l=r.startsWith("/assets/")?new URL(`assets/${r.slice(8)}`,re):new URL(`design/out/${r.slice(5)}`,ii);return Ie(l)?i(200,await Ft(l),dl[ri(r)]):i(404,"not found")}if(t.method==="POST"&&r==="/localization"){let l=await ve(t),c=new URL(t.headers.referer||"/",n),d=c.pathname.replace(/^\/id(?=\/|$)/,"")||"/";return i(302,"","text/plain",{Location:(l.locale_code==="id"?`/id${d==="/"?"":d}`:d)+c.search})}if(t.method==="POST"&&r==="/cart/add.js"){let l=await ve(t),c=cl(l);for(let u of c){if(!ie.has(String(u.id)))return s(404,{status:404,message:"Cart Error",description:"Product not found"});let p=E.find(f=>String(f.id)===String(u.id)&&JSON.stringify(f.properties)===JSON.stringify(u.properties));p?p.quantity+=u.quantity:E.push({id:Number(u.id),quantity:u.quantity,properties:u.properties})}let d=Array.isArray(l.sections)?l.sections:String(l.sections||"").split(",").filter(Boolean);return s(200,{items:c,sections:await Zn(d,a,n)})}if(t.method==="POST"&&r==="/cart/change.js"){let l=await ve(t),c=Number(l.line)-1;return Number(l.quantity)===0?E.splice(c,1):E[c].quantity=Number(l.quantity),s(200,{sections:await Zn(l.sections??[],a,n)})}if(t.method==="POST"&&r==="/cart/update.js"){let l=await ve(t);for(let[d,u]of Object.entries(l.attributes??{}))u===""||u==null?delete j[d]:j[d]=String(u);let c=new Set(Object.entries(l.updates??{}).filter(([,d])=>Number(d)===0).map(([d])=>Number(d.split(":")[1])));return E=E.filter((d,u)=>!c.has(u)),s(200,{attributes:j,sections:await Zn(l.sections??[],a,n)})}if(r==="/cart.js")return s(200,{attributes:j,item_count:E.reduce((l,c)=>l+c.quantity,0)});if(r==="/apps/pagi/slots")return s(200,ws());if(t.method==="POST"&&r==="/apps/pagi/catering"){let{errors:l,request:c}=Ls(await ve(t),{catering:M.catering,today:se().slice(0,10)});return l?s(422,{errors:l}):s(201,{reference:"C-0001",message:`Thanks, ${c.name}. We'll email ${c.email} a quote within a day.`})}if(t.method==="POST"&&r==="/cart"||r==="/checkout"){let c=Kn(qs()).operations.flatMap(d=>d.validationAdd.errors.map(u=>u.message));return E.length||c.push("Your cart is empty."),i(200,Ss({cart:ni(_e(a)),money:Tt,errors:c,slotLabel:As()}))}if(t.method==="POST"&&r==="/checkout/complete"){let l=await ve(t);if(Kn(qs()).operations.length||!E.length)return i(303,"","text/plain",{Location:"/checkout"});let u=ni(_e("en")).items.filter(y=>y.product.type==="Menu"),p=As(),f=j.pickup_slot?.slice(0,10)??"",v=null;return u.length&&(v=ks({slot:j.pickup_slot,fulfilment:j.fulfilment==="delivery"?"delivery":"pickup",dishes:u.reduce((y,B)=>y+B.quantity,0),customer:String(l.name||"Guest").slice(0,60),items:u.map(y=>({title:y.product.title,quantity:y.quantity,notes:Object.entries(y.properties).filter(([B,xe])=>!B.startsWith("_")&&xe).map(([B,xe])=>`${B}: ${xe}`)}))})),E=[],j={},i(200,Ts({name:v??"#online",date:f,slotLabel:p||"Beans ship in 1\u20132 days; gift cards are on their way by email."}))}if(r==="/kitchen"){let l=se().slice(0,10),c=n.searchParams.get("date"),d=/^\d{4}-\d{2}-\d{2}$/.test(c??"")?c:l;return i(200,Fs({date:d,orders:bs(d),paused:xt(),cfg:we,used:vt(`${d}T00:00`)}))}let o;if(t.method==="POST"&&(o=r.match(/^\/kitchen\/orders\/(\d+)\/(ready|collected)$/))){let l=_s(o[1],o[2]);return i(303,"","text/plain",{Location:`/kitchen?date=${n.searchParams.get("date")??""}${l?`#t${l.slice(11).replace(":","")}`:""}`})}if(t.method==="POST"&&(o=r.match(/^\/kitchen\/slots\/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})\/pause$/)))return ys(o[1]),i(303,"","text/plain",{Location:`/kitchen?date=${n.searchParams.get("date")??""}#t${o[1].slice(11).replace(":","")}`});if(r==="/")return i(200,await Y("index",a,n));if(o=r.match(/^\/products\/([\w-]+)$/)){let c=_e(a).products[o[1]];return c?i(200,await Y("product",a,n,{product:c,page_title:c.title})):i(404,await Y("404",a,n))}if(o=r.match(/^\/collections\/([\w-]+)$/)){let l=_e(a).collections[o[1]];return l?i(200,await Y("collection",a,n,{collection:l,page_title:l.title})):i(404,await Y("404",a,n))}if((o=r.match(/^\/pages\/([\w-]+)$/))&&Hn(a)[o[1]]){let l=Hn(a)[o[1]];return i(200,await Y(`page.${l.template_suffix}`,a,n,{page:l,page_title:l.title}))}return r==="/cart"?i(200,await Y("cart",a,n)):i(404,await Y("404",a,n))}catch(o){console.error(o),i(500,`<pre>${String(o.stack).replace(/</g,"&lt;")}</pre>`)}}).listen(Qn,()=>console.log(`Pagi preview \u2192 http://localhost:${Qn}`));var ae=new URL("./",self.location.href).pathname.replace(/\/$/,""),ul=/^\/(assets|img)\//,hl=/(["'(\s=,])\/(?!\/)(assets|img|products|collections|cart|search|recommendations|apps|pages|password|account|localization|contact|policies|checkout|kitchen|id)\b/g,pl=/(\s(?:href|action)=["'])\/(?=["'#?])/g,fl=t=>t.replace(hl,`$1${ae}/$2`).replace(pl,`$1${ae}/`),ml=`<div style="position:fixed;left:12px;bottom:12px;z-index:2147483647;background:#111;color:#fff;font:600 12px/1.3 system-ui,sans-serif;padding:8px 12px;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.25)">Live demo \xB7 theme, Functions and kitchen board run in your browser \xB7 <a href="${ae}/../" style="color:#ffd27a">about</a></div>`,Ns="preview-cart-log",Rs=null;async function gl(){let e=await(await caches.open(Ns)).match("log");for(let n of e?await e.json():[])await Ds(n.method,n.path,n.type,n.body)}async function yl(t){let e=await caches.open(Ns),n=await e.match("log"),i=n?await n.json():[];i.push(t),await e.put("log",new Response(JSON.stringify(i)))}var zs="preview-cookies";async function Es(){let t=await(await caches.open(zs)).match("jar");return t?await t.json():{}}async function bl(){let t=await Es();if(self.cookieStore)for(let e of await self.cookieStore.getAll())t[e.name]=e.value;return Object.entries(t).map(([e,n])=>`${e}=${n}`).join("; ")}async function _l(t){if(!t)return;let e=await Es();for(let n of[].concat(t)){let[i]=String(n).split(";"),s=i.indexOf("=");e[i.slice(0,s).trim()]=i.slice(s+1).trim()}await(await caches.open(zs)).put("jar",new Response(JSON.stringify(e)))}async function Ds(t,e,n,i,s={}){let r=i?[new TextEncoder().encode(i)]:[],a={method:t,url:e,headers:{"content-type":n||"",cookie:await bl(),...s},async*[Symbol.asyncIterator](){yield*r}};return new Promise(o=>{let l=200,c={};Pt(a,{writeHead(u,p){l=u,c=p||{}},setHeader(u,p){c[u]=p},end(u){o({status:l,headers:c,content:u})}})})}self.addEventListener("install",()=>self.skipWaiting());self.addEventListener("activate",t=>t.waitUntil(self.clients.claim()));self.addEventListener("fetch",t=>{let e=new URL(t.request.url);if(e.origin!==self.location.origin||!e.pathname.startsWith(ae))return;let n=e.pathname.slice(ae.length)||"/";ul.test(n)||n==="/sw.js"||n==="/boot.html"||t.respondWith((async()=>{Rs??=gl(),await Rs;let i=t.request.method,s=t.request.headers.get("content-type")||"",r=i==="GET"?null:await t.request.text(),a=n+e.search,o=t.request.referrer?new URL(t.request.referrer):null,l=o&&o.pathname.startsWith(ae)?(o.pathname.slice(ae.length)||"/")+o.search:"",c=await Ds(i,a,s,r,{referer:l});await _l(c.headers["Set-Cookie"]||c.headers["set-cookie"]),i==="POST"&&/^(\/id)?\/(cart\/(add|change|update)|checkout\/complete|kitchen\/)/.test(n)&&c.status<400&&await yl({method:i,path:a,type:s,body:r});let d=c.headers["Content-Type"]||c.headers["content-type"]||"text/html; charset=utf-8",u=c.content??"";/html|json/.test(d)&&typeof u=="string"&&(u=fl(u)),d.includes("html")&&t.request.mode==="navigate"&&(u=u.replace("</body>",`${ml}</body>`));let p=c.headers.Location||c.headers.location;return c.status>=300&&c.status<400&&p?Response.redirect(/^https?:/.test(p)?p:ae+p,c.status):new Response(u,{status:c.status,headers:{"Content-Type":d}})})())});
