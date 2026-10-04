/* ==========================================================================
   EDEN — Shared Script
   ใช้ร่วมกันทุกหน้า: product.html (แสดง/กรองสินค้า) และ order.html (ฟอร์มสั่งซื้อ)
   ========================================================================== */

// TODO: แทนที่ด้วย URL Web App ของ Google Apps Script ที่คุณ Deploy ไว้
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzETC-N8FNtCfS5f5CsOF-M7l9e0mb7SelUjQs1d4wQXGkZ2xtQ6u_RUxwJs4Ua_lx3/exec';

// Supabase — ที่เก็บข้อมูลสินค้า (ตาราง products)
const SUPABASE_URL = 'https://qoyihktwnohupwwhusvt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cf7T1u9h5hWZbaqvwA1S5w_cwl6NoMa';

document.addEventListener('DOMContentLoaded', () => {
  initProductPage();
  initOrderPage();
  initPosPage();
});

/* --------------------------------------------------------------------------
   product.html — โหลดสินค้า + กรองตาม mood
   -------------------------------------------------------------------------- */
function initProductPage() {
  const grid = document.getElementById('product-list');
  if (!grid) return;

  const filterBar = document.getElementById('filter-bar');
  const moodOptions = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'streetwear', label: 'Streetwear' },
    { key: 'classic', label: 'Classic' },
  ];

  // อ่าน mood จาก URL (เช่น product.html?mood=streetwear) เพื่อกรองอัตโนมัติ
  const params = new URLSearchParams(window.location.search);
  const moodFromUrl = params.get('mood');
  let currentMood = moodOptions.some((m) => m.key === moodFromUrl) ? moodFromUrl : 'all';

  let products = [];

  if (filterBar) {
    filterBar.innerHTML = moodOptions
      .map(
        (m) =>
          `<button type="button" class="filter-btn${
            m.key === currentMood ? ' is-active' : ''
          }" data-mood-filter="${m.key}">${m.label}</button>`
      )
      .join('');

    filterBar.querySelectorAll('[data-mood-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentMood = btn.getAttribute('data-mood-filter');
        filterBar
          .querySelectorAll('[data-mood-filter]')
          .forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderProducts();
      });
    });
  }

  fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.asc`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      products = data;
      renderProducts();
    })
    .catch((err) => {
      console.error('โหลดสินค้าไม่สำเร็จ:', err);
      grid.innerHTML = '<p>ไม่สามารถโหลดข้อมูลสินค้าได้ในขณะนี้</p>';
    });

  function renderProducts() {
    const filtered =
      currentMood === 'all' ? products : products.filter((p) => p.mood === currentMood);
    grid.innerHTML = filtered.map(renderCard).join('');
  }

  function renderCard(product) {
    const sizesHTML = product.size.map((s) => `<span>${s}</span>`).join('');
    const moodLabel = product.mood === 'streetwear' ? 'Streetwear' : 'Classic';
    const orderUrl =
      'order.html?item=' +
      encodeURIComponent(product.name) +
      '&price=' +
      encodeURIComponent(product.price);

    return `
      <article class="product-card">
        <div class="product-media">
          <span class="product-tag">${moodLabel}</span>
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
          <div>
            <span class="product-name">${product.name}</span>
            <span class="product-type">${product.type}</span>
            <div class="product-sizes">${sizesHTML}</div>
          </div>
          <span class="product-price">฿${Number(product.price).toLocaleString('th-TH')}</span>
        </div>
        <p style="margin-top:0.75rem;">${product.description}</p>
        <a class="btn btn-primary" style="margin-top:1rem;" href="${orderUrl}">สั่งซื้อ</a>
      </article>
    `;
  }
}

/* --------------------------------------------------------------------------
   order.html — auto-fill จาก URL parameter + ส่งคำสั่งซื้อ
   -------------------------------------------------------------------------- */
function initOrderPage() {
  const form = document.getElementById('order-form');
  if (!form) return;

  // อ่านค่าจาก URL parameter และเติมลงฟอร์มทันทีที่โหลดหน้า
  const params = new URLSearchParams(window.location.search);
  const item = params.get('item');
  const price = params.get('price');

  const itemsField = document.getElementById('items');
  const totalField = document.getElementById('total');

  if (item && itemsField) {
    itemsField.value = item;
  }
  if (price && totalField) {
    totalField.value = price;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const payload = {
      customerName: document.getElementById('customerName').value,
      contact: document.getElementById('contact').value,
      items: document.getElementById('items').value,
      total: document.getElementById('total').value,
      note: document.getElementById('note').value,
    };

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
      .then(() => {
        window.location.href = 'thankyou.html';
      })
      .catch((err) => {
        console.error('ส่งคำสั่งซื้อไม่สำเร็จ:', err);
        alert('เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
      });
  });
}

/* --------------------------------------------------------------------------
   pos.html — บันทึกยอดขายหน้าร้าน (ไว้ดูสรุปใน Google Sheet แท็บ "POS")
   หมายเหตุ: ตัวเลข "คงเหลือ" ดึงมาจาก Supabase ตอนโหลดหน้าเฉยๆ ไม่ได้ตัดสต็อก
   อัตโนมัติ — ต้องไปอัปเดตคอลัมน์ stock ใน Supabase เองหลังนับของจริง
   -------------------------------------------------------------------------- */
function initPosPage() {
  const form = document.getElementById('pos-form');
  if (!form) return;

  const productSelect = document.getElementById('pos-product');
  const stockField = document.getElementById('pos-stock');
  const qtyField = document.getElementById('pos-qty');
  const priceField = document.getElementById('pos-price');
  const totalField = document.getElementById('pos-total');
  const statusEl = document.getElementById('pos-status');

  let products = [];

  fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=name.asc`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      products = data;
      productSelect.innerHTML = products
        .map((p) => `<option value="${p.id}">${p.name} (คงเหลือ ${p.stock ?? '-'})</option>`)
        .join('');
      fillFromSelection();
    })
    .catch((err) => {
      console.error('โหลดสินค้าไม่สำเร็จ:', err);
      productSelect.innerHTML = '<option value="">โหลดสินค้าไม่สำเร็จ</option>';
    });

  function fillFromSelection() {
    const selected = products.find((p) => p.id === productSelect.value);
    if (!selected) return;
    stockField.value = selected.stock ?? '-';
    priceField.value = selected.price;
    updateTotal();
  }

  function updateTotal() {
    const qty = Number(qtyField.value) || 0;
    const price = Number(priceField.value) || 0;
    totalField.value = (qty * price).toLocaleString('th-TH');
  }

  productSelect.addEventListener('change', fillFromSelection);
  qtyField.addEventListener('input', updateTotal);
  priceField.addEventListener('input', updateTotal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const selected = products.find((p) => p.id === productSelect.value);
    const qty = Number(qtyField.value) || 0;
    const price = Number(priceField.value) || 0;

    const payload = {
      type: 'pos_sale',
      productId: selected ? selected.id : productSelect.value,
      product: selected ? selected.name : productSelect.value,
      quantity: qty,
      unitPrice: price,
      total: qty * price,
      note: document.getElementById('pos-note').value,
    };

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((result) => {
        const newStock = result && typeof result.newStock === 'number' ? result.newStock : null;

        statusEl.textContent =
          newStock === null
            ? `บันทึกแล้ว: ${payload.product} x${payload.quantity}`
            : `บันทึกแล้ว: ${payload.product} x${payload.quantity} (คงเหลือ ${newStock})`;
        statusEl.style.display = 'block';

        // อัปเดตตัวเลขคงเหลือในหน้าให้ตรงกับของจริงทันที ไม่ต้องรีเฟรช
        if (newStock !== null && selected) {
          selected.stock = newStock;
          stockField.value = newStock;
          const opt = productSelect.querySelector(`option[value="${selected.id}"]`);
          if (opt) opt.textContent = `${selected.name} (คงเหลือ ${newStock})`;
        }

        qtyField.value = 1;
        document.getElementById('pos-note').value = '';
        updateTotal();
      })
      .catch((err) => {
        console.error('บันทึกยอดขายไม่สำเร็จ:', err);
        alert('บันทึกยอดขายไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      });
  });
}
