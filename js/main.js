(() => {
  const W = window.WEDDING;
  if (!W) { console.error('Không tải được js/wedding.js — thiếu dữ liệu thiệp.'); return; }
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Dữ liệu ngày tháng ---------- */
  const [Y, M, D] = W.date.split('-').map(Number);
  const wedding = new Date(Y, M - 1, D);
  const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const weekday = WEEKDAYS[wedding.getDay()].toUpperCase();
  const params = new URLSearchParams(location.search);
  const guest = (params.get('to') || '').trim().slice(0, 60);

  const bind = {
    brideShort: W.bride.shortName,
    groomShort: W.groom.shortName,
    brideShortUpper: W.bride.shortName.toUpperCase(),
    groomShortUpper: W.groom.shortName.toUpperCase(),
    dateLong: `${D} tháng ${M}, ${Y}`,
    guest: guest || W.defaultGuest,
    inviteMsg: W.inviteMessage,
    brideParentTitle: W.bride.parentTitle,
    groomParentTitle: W.groom.parentTitle,
    brideFather: W.bride.father,
    brideMother: W.bride.mother,
    groomFather: W.groom.father,
    groomMother: W.groom.mother,
    brideAddress: W.bride.address,
    groomAddress: W.groom.address,
    ceremonyHead: W.ceremonyHeader || 'LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA',
    brideFull: W.bride.fullName,
    groomFull: W.groom.fullName,
    brideOrder: W.bride.birthOrder,
    groomOrder: W.groom.birthOrder,
    ceremonyTime: W.ceremonyTime,
    weekday,
    day: pad(D),
    monthLabel: `THÁNG ${pad(M)}`,
    year: String(Y),
    lunar: `(${W.lunar})`,
    banquetTime: W.banquetTime,
    receptionTime: W.receptionTime,
    address: W.venue.address,
    thankYou: W.thankYou,
  };
  $$('[data-bind]').forEach((el) => {
    const k = el.dataset.bind;
    if (k in bind) el.textContent = bind[k];
  });
  if (guest) $('#gb-name').value = guest;
  // Tên dài: co chữ cho vừa bề rộng (không xuống dòng)
  const fitNames = () => $$('.couple__name').forEach((h) => {
    h.style.fontSize = '';
    const max = parseFloat(getComputedStyle(h).fontSize);
    const r = document.createRange(); r.selectNodeContents(h);
    const w = r.getBoundingClientRect().width, box = h.clientWidth;
    if (w > box) h.style.fontSize = `${Math.floor(max * box / w)}px`;
  });
  document.fonts?.ready.then(fitNames);
  addEventListener('resize', fitNames);
  document.title = `${W.bride.shortName} & ${W.groom.shortName} · Thiệp cưới`;

  /* ---------- Toast ---------- */
  let toastTimer;
  const toast = (msg) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-show'), 2600);
  };

  /* ---------- Nhạc nền ---------- */
  const audio = $('#audio');
  const musicBtn = $('#music');
  if (W.music) {
    audio.src = W.music;
    audio.addEventListener('canplay', () => (musicBtn.hidden = false), { once: true });
    audio.addEventListener('error', () => (musicBtn.hidden = true));
  }
  const setPlaying = (on) => musicBtn.setAttribute('aria-pressed', String(on));
  musicBtn.addEventListener('click', () => {
    if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => {});
    else { audio.pause(); setPlaying(false); }
  });

  /* ---------- 1. Mở thiệp ---------- */
  const cover = $('#cover');
  if (!reduceMotion) {
    const rnd = (a, b) => a + Math.random() * (b - a);
    const colors = ['#A52A2A', '#FFF0E7', '#8B0000', '#710001'];
    $('#cover-float').innerHTML = Array.from({ length: 12 }, () => {
      const dur = rnd(18, 26);
      return `<span style="left:${rnd(5, 95).toFixed(1)}%;color:${colors[Math.floor(Math.random() * colors.length)]};font-size:${rnd(10, 24).toFixed(1)}px;--sway:${rnd(-30, 30).toFixed(1)}px;--dur:${dur.toFixed(1)}s;--delay:${(-rnd(0, dur)).toFixed(1)}s">囍</span>`;
    }).join('');
  }
  const openInvite = () => {
    cover.classList.add('is-open');
    document.body.classList.remove('is-locked');
    if (W.music) {
      audio.load();
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
    setTimeout(() => cover.remove(), 950);
  };
  $('#open-btn').addEventListener('click', openInvite);
  if (params.has('open')) openInvite(); // tiện cho chụp screenshot / chia sẻ thẳng nội dung

  /* ---------- 4. Album: carousel 3D (lệch 60%/ô, xoay 45°, lùi 150px) ---------- */
  const stage = $('#album-stage');
  const N = W.album.length;
  stage.innerHTML = W.album
    .map(([src, pos], i) => `<div class="slide" data-i="${i}"><img src="${esc(src)}" alt="Ảnh cưới ${i + 1} của ${esc(W.bride.shortName)} và ${esc(W.groom.shortName)}" style="object-position:${esc(pos)}" loading="${i < 3 || i === N - 1 ? 'eager' : 'lazy'}" decoding="async" draggable="false"></div>`)
    .join('');
  const slides = $$('.slide', stage);
  const dots = $('#album-dots');
  dots.innerHTML = W.album.map((_, i) => `<button type="button" aria-label="Ảnh ${i + 1}"></button>`).join('');
  const OPACITY = [1, .75, .5, .3];
  let cur = 0, timer;
  const render = () => {
    slides.forEach((el, i) => {
      let d = ((i - cur) % N + N) % N;
      if (d > N / 2) d -= N;
      const a = Math.abs(d);
      el.style.transform = `translateX(${60 * d}%) translateZ(${-150 * a}px) rotateY(${45 * d}deg) scale(${Math.max(.7, 1 - .15 * a)})`;
      el.style.opacity = OPACITY[Math.min(a, 3)];
      el.style.zIndex = 100 - a;
      el.classList.toggle('is-active', a === 0);
    });
    $$('button', dots).forEach((b, j) => b.setAttribute('aria-current', String(j === cur)));
  };
  const go = (i) => { cur = (i + N) % N; render(); restart(); };
  const restart = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => { cur = (cur + 1) % N; render(); }, 4000); };
  $$('button', dots).forEach((b, i) => b.addEventListener('click', () => go(i)));
  $('#album-prev').addEventListener('click', () => go(cur - 1));
  $('#album-next').addEventListener('click', () => go(cur + 1));
  let downX = null;
  stage.addEventListener('pointerdown', (e) => (downX = e.clientX));
  stage.addEventListener('pointerup', (e) => {
    if (downX === null) return;
    const dx = e.clientX - downX; downX = null;
    if (Math.abs(dx) > 40) return go(cur + (dx < 0 ? 1 : -1));
    const s = e.target.closest('.slide');
    if (!s) return;
    const i = +s.dataset.i;
    if (i !== cur) return go(i);
    $('#lightbox-img').src = s.querySelector('img').src;
    $('#lightbox-img').alt = s.querySelector('img').alt;
    lightbox.showModal();
  });
  const lightbox = $('#lightbox');
  lightbox.addEventListener('click', () => lightbox.close());
  render(); restart();

  /* ---------- 5. Lịch ---------- */
  const cal = $('#calendar');
  const offset = (new Date(Y, M - 1, 1).getDay() + 6) % 7; // Thứ 2 là cột đầu
  const days = new Date(Y, M, 0).getDate();
  let cells = '<div></div>'.repeat(offset);
  for (let d = 1; d <= days; d++) {
    cells += d === D
      ? `<div aria-label="Ngày cưới ${d}"><span class="calendar__heart"><svg viewBox="0 0 24 22" aria-hidden="true"><use href="#ico-heart"/></svg><span>${d}</span></span></div>`
      : `<div>${d}</div>`;
  }
  cal.innerHTML = `<div class="calendar__head">Tháng ${M} / ${Y}</div><div class="calendar__dows">${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => `<div>${d}</div>`).join('')}</div><div class="calendar__days">${cells}</div>`;

  // Thêm vào lịch: mở Google Calendar (giờ VN = UTC+7)
  const utc = (hm) => { const [h, m] = hm.split(':').map(Number); return new Date(Date.UTC(Y, M - 1, D, h - 7, m)).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; };
  $('#add-cal').href = 'https://www.google.com/calendar/render?action=TEMPLATE'
    + `&text=${encodeURIComponent(`Đám cưới ${W.groom.fullName} & ${W.bride.fullName}`)}`
    + `&dates=${utc(W.receptionTime)}/${utc(W.partyEndTime)}&ctz=Asia/Ho_Chi_Minh`
    + `&details=${encodeURIComponent(`Tiệc cưới lúc ${W.banquetTime}`)}&location=${encodeURIComponent(W.venue.address)}`;

  /* ---------- RSVP (lưu tạm trên máy khách, chưa có backend) ---------- */
  const store = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const rsvp = $('#rsvp');
  $('#rsvp-btn').addEventListener('click', () => {
    $('#rsvp-name').value = $('#rsvp-name').value || guest;
    rsvp.showModal();
  });
  $('#rsvp-form').addEventListener('submit', (e) => {
    if (e.submitter?.value !== 'ok') return;
    const name = $('#rsvp-name').value.trim();
    if (!name) { e.preventDefault(); $('#rsvp-name').focus(); return; }
    const attend = $('input[name="attend"]:checked').value;
    store.set('rsvp', { name, attend, count: $('#rsvp-count').value, at: new Date().toISOString() });
    toast(attend === 'yes' ? 'Cảm ơn bạn! Hẹn gặp bạn tại tiệc cưới.' : 'Cảm ơn bạn đã phản hồi!');
  });
  rsvp.addEventListener('click', (e) => { if (e.target === rsvp) rsvp.close(); });

  /* ---------- 6. Bản đồ ---------- */
  const q = encodeURIComponent(W.venue.address);
  $('#map').src = `https://maps.google.com/maps?q=${q}&z=16&hl=vi&output=embed`;
  $('#dir-link').href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;

  /* ---------- 7. Dress code ---------- */
  const isLight = (hex) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 170; };
  $('#dress-dots').innerHTML = W.dresscode.map((c) => `<span style="background:${esc(c)}${isLight(c) ? ';border:1.5px solid rgba(113,0,1,.19)' : ''}" title="${esc(c)}"></span>`).join('');

  /* ---------- 8. Lịch trình ---------- */
  $('#tl').innerHTML = W.timeline.map(([t, l]) => `<li><time>${esc(t)}</time><span class="mid" aria-hidden="true"><span class="line"></span><span class="dot"></span></span><span class="label">${esc(l)}</span></li>`).join('');

  /* ---------- 9. Sổ lưu bút ---------- */
  const fmt = (iso) => {
    const d = new Date(iso);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };
  const wishHTML = (w, isNew) => `<li class="wish${isNew ? ' is-new' : ''}"><div class="wish__top"><span class="wish__name">${esc(w.name)}</span><span class="wish__time">${fmt(w.at)}</span></div><p class="wish__msg">${esc(w.msg)}</p></li>`;
  // Lưu chung qua W.guestbookApi (Vercel Function + Turso). Không gọi được API
  // (chạy `npm run dev`, chưa cấu hình) thì quay về localStorage trên máy khách.
  let online = false;
  const renderWishes = (list) => { $('#wishes').innerHTML = [...list, ...W.sampleWishes].map((w) => wishHTML(w)).join(''); };
  renderWishes(store.get('wishes', []));
  if (W.guestbookApi) {
    fetch(W.guestbookApi, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(({ wishes }) => { online = true; renderWishes(wishes); })
      .catch(() => {});
  }

  let sIdx = Math.floor(Math.random() * W.wishSuggestions.length);
  $('#gb-suggest').addEventListener('click', () => {
    $('#gb-msg').value = W.wishSuggestions[sIdx++ % W.wishSuggestions.length];
    $('#gb-msg').focus();
  });
  const showWish = (w) => {
    $('#wishes').insertAdjacentHTML('afterbegin', wishHTML(w, true));
    $('#wishes').scrollTop = 0;
    $('#gb-msg').value = '';
    toast('Cảm ơn lời chúc của bạn!');
  };
  $('#gb-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#gb-name').value.trim();
    const msg = $('#gb-msg').value.trim();
    if (!name) { $('#gb-name').focus(); toast('Vui lòng nhập tên của bạn'); return; }
    if (!msg) { $('#gb-msg').focus(); toast('Vui lòng nhập lời chúc'); return; }
    if (!online) {
      const w = { name, msg, at: new Date().toISOString() };
      store.set('wishes', [w, ...store.get('wishes', [])].slice(0, 50));
      showWish(w);
      return;
    }
    const btn = $('#gb-form .gb-send');
    btn.disabled = true;
    try {
      const r = await fetch(W.guestbookApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, msg, website: $('#gb-hp').value }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { toast(data.error || 'Không gửi được lời chúc, vui lòng thử lại'); return; }
      showWish(data.wish || { name, msg, at: new Date().toISOString() });
    } catch {
      toast('Mất kết nối, vui lòng thử lại');
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------- 10. Hộp quà ---------- */
  const PLACEHOLDER = /^0+$/;
  $('#gift-cards').innerHTML = W.gifts.map((g) => {
    const ready = !PLACEHOLDER.test(g.accountNumber);
    const qr = ready
      ? `<img src="https://img.vietqr.io/image/${esc(g.bin)}-${esc(g.accountNumber)}-qr_only.png?accountName=${encodeURIComponent(g.accountName)}" alt="Mã QR chuyển khoản ${esc(g.side)}" loading="lazy">`
      : 'Thông tin tài khoản đang được cập nhật';
    return `<div class="gcard"><h3>${esc(g.side)}</h3><div class="gcard__qr">${qr}</div><p>${esc(g.bankName)}</p>${ready ? `<p class="mono">${esc(g.accountNumber)}</p>` : ''}<p><b>${esc(g.accountName)}</b></p>${ready ? `<button class="copy" type="button" data-copy="${esc(g.accountNumber)}"><svg><use href="#ico-copy"/></svg>Sao chép STK</button>` : ''}</div>`;
  }).join('');
  $('#gift-cards').addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    navigator.clipboard?.writeText(b.dataset.copy).then(() => toast('Đã sao chép số tài khoản'));
  });
  $('#giftbox').addEventListener('click', (e) => {
    const box = e.currentTarget;
    const open = !box.classList.contains('is-open');
    box.classList.toggle('is-open', open);
    box.setAttribute('aria-expanded', String(open));
    $('#gift-cards').hidden = !open;
    $('#gift-hint').textContent = open ? 'Nhấn để đóng' : 'Nhấn để mở';
  });

  /* ---------- Animation khi scroll (Quy tắc 3) ---------- */
  $$('[data-stagger]').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));

  // Parallax giống bản gốc: translateY = hệ số × scrollY (có thể giới hạn bằng data-parallax-max)
  const px = $$('[data-parallax]');
  if (!reduceMotion && px.length) {
    let ticking = false;
    const apply = () => {
      const y = scrollY;
      px.forEach((el) => {
        let v = y * Number(el.dataset.parallax);
        if (el.dataset.parallaxMax) v = Math.min(v, Number(el.dataset.parallaxMax));
        el.style.translate = `0 ${v.toFixed(1)}px`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
  }
})();
