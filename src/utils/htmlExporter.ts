import type { WeddingConfig } from '../types/wedding';

export const GOOGLE_APPS_SCRIPT_CODE = `// Tempelkan kode ini di Google Sheets -> Ekstensi -> Apps Script
// Lalu klik Deploy -> New deployment -> Web app (Who has access: Anyone)

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Waktu', 'Nama Tamu', 'Relasi', 'Kehadiran', 'Jumlah Tamu', 'Ucapan & Doa']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#24160F').setFontColor('#FAF6EE');
    }

    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.nama || '-',
      data.hubungan || '-',
      data.kehadiran || 'Hadir',
      data.jumlahTamu || 1,
      data.ucapan || '-'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function imageUrlToDataUri(src: string): Promise<string> {
  if (!src) return '';
  if (src.startsWith('data:')) return src;
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : src);
      reader.onerror = () => resolve(src);
      reader.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
}

export async function generateStandaloneHtml(config: WeddingConfig): Promise<string> {
  const [coverData, brideData, groomData, ...galleryData] = await Promise.all([
    imageUrlToDataUri(config.coverPhoto),
    imageUrlToDataUri(config.bride.photo),
    imageUrlToDataUri(config.groom.photo),
    ...config.gallery.map((g) => imageUrlToDataUri(g.src)),
  ]);

  const galleryItemsHtml = config.gallery
    .map((photo, idx) => {
      const imgSrc = galleryData[idx] || photo.src;
      return `
        <button type="button" class="gal-card" onclick="openLightbox(${idx})">
          <img src="${imgSrc}" alt="${escapeHtml(photo.title)}" loading="lazy" />
          <div class="gal-caption">
            <span>${escapeHtml(photo.category)}</span>
            <strong>${escapeHtml(photo.title)}</strong>
          </div>
        </button>`;
    })
    .join('\n');

  const galleryJson = JSON.stringify(
    config.gallery.map((photo, idx) => ({
      src: galleryData[idx] || photo.src,
      title: photo.title,
      caption: photo.caption,
    }))
  ).replace(/</g, '\\u003c');


  const storiesHtml = config.loveStory
    .map(
      (s) => `
      <div class="story-row">
        <div class="story-year">${escapeHtml(s.year)}</div>
        <div class="story-body">
          <h3>${escapeHtml(s.title)}</h3>
          <p>${escapeHtml(s.description)}</p>
        </div>
      </div>`
    )
    .join('\n');

  const embedQuery = encodeURIComponent(config.googleMapsEmbedQuery || config.venueName);
  const webhookUrlEscaped = escapeHtml(config.googleSheetWebhookUrl || '');
  const audioUrlEscaped = escapeHtml(config.audioUrl || '');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(config.coupleTitle)} — Undangan Pernikahan Digital Java Heritage</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --espresso: #24160F;
      --teak: #311F15;
      --ivory: #FAF6EE;
      --sand: #F2EAD9;
      --gold: #B8862D;
      --gold-light: #DFB963;
      --border: rgba(184, 134, 45, 0.28);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: var(--ivory); color: var(--espresso); }
    body.locked { overflow: hidden; }
    h1, h2, h3, .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
    img { display: block; max-width: 100%; }
    button, input, select, textarea { font-family: inherit; }

    /* Cover Envelope */
    #cover {
      position: fixed; inset: 0; z-index: 50;
      background: linear-gradient(to bottom, rgba(36,22,15,0.82), rgba(24,14,9,0.94)), url('${coverData}') center/cover no-repeat;
      color: var(--ivory);
      display: flex; align-items: center; justify-content: center;
      padding: 24px; text-align: center;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s ease;
    }
    #cover.opened { transform: translateY(-100%); opacity: 0; pointer-events: none; }
    .cover-box { max-width: 480px; width: 100%; padding: 40px 28px; border: 1px solid rgba(223,185,99,0.35); background: rgba(36,22,15,0.72); backdrop-filter: blur(8px); border-radius: 20px; }
    .cover-kicker { font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold-light); margin-bottom: 12px; }
    .cover-title { font-size: clamp(2.5rem, 6vw, 3.75rem); font-weight: 600; line-height: 1.05; margin-bottom: 24px; }
    .guest-card { border-top: 1px solid rgba(223,185,99,0.25); border-bottom: 1px solid rgba(223,185,99,0.25); padding: 16px 12px; margin-bottom: 28px; }
    .guest-label { font-size: 13px; color: rgba(250,246,238,0.75); margin-bottom: 6px; }
    .guest-name { font-family: 'Cormorant Garamond', serif; font-size: 1.75rem; font-weight: 600; color: var(--gold-light); }

    /* Buttons */
    .btn-gold {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--gold); color: #fff; border: none; border-radius: 999px;
      padding: 14px 28px; font-size: 14px; font-weight: 600; cursor: pointer;
      text-decoration: none; min-height: 44px; transition: background 0.2s, transform 0.15s;
    }
    .btn-gold:hover { background: #9C7022; }
    .btn-gold:active { transform: scale(0.98); }
    .btn-outline {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: transparent; color: var(--espresso); border: 1px solid var(--border);
      border-radius: 999px; padding: 10px 20px; font-size: 13px; font-weight: 600;
      cursor: pointer; text-decoration: none; min-height: 44px; transition: background 0.2s;
    }
    .btn-outline:hover { background: rgba(184,134,45,0.1); }

    /* Sections */
    .section { padding: 72px 20px; }
    .section-dark { background: var(--espresso); color: var(--ivory); }
    .section-sand { background: var(--sand); }
    .container { max-width: 1040px; margin: 0 auto; }
    .center { text-align: center; }
    .kicker { font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 10px; }
    .section-dark .kicker { color: var(--gold-light); }
    .heading { font-size: clamp(2rem, 4vw, 3rem); font-weight: 600; line-height: 1.15; margin-bottom: 16px; }
    .lead { font-size: 15px; line-height: 1.75; color: #574439; max-width: 64ch; margin: 0 auto; }
    .section-dark .lead { color: rgba(250,246,238,0.8); }

    /* Hero */
    .hero { display: grid; grid-template-columns: 1fr; gap: 36px; align-items: center; padding-top: 56px; }
    @media (min-width: 860px) { .hero { grid-template-columns: 1.05fr 0.95fr; gap: 56px; } }
    .hero-photo { border-radius: 999px 999px 24px 24px; overflow: hidden; border: 2px solid rgba(184,134,45,0.45); padding: 8px; background: #fff; aspect-ratio: 3/4; max-height: 620px; width: 100%; object-fit: cover; box-shadow: 0 20px 45px rgba(36,22,15,0.12); }

    /* Countdown */
    .countdown-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-width: 560px; margin: 28px auto; }
    .count-box { background: var(--teak); border: 1px solid rgba(223,185,99,0.28); border-radius: 16px; padding: 18px 8px; }
    .count-num { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 4vw, 2.75rem); font-weight: 600; color: var(--gold-light); font-variant-numeric: tabular-nums; line-height: 1; }
    .count-label { font-size: 12px; color: rgba(250,246,238,0.72); margin-top: 6px; }

    /* Couple & Events Grid */
    .grid-2 { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 36px; }
    @media (min-width: 768px) { .grid-2 { grid-template-columns: 1fr 1fr; gap: 32px; } }
    .card-ivory { background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: 28px; box-shadow: 0 8px 24px rgba(36,22,15,0.04); }
    .portrait { width: 170px; height: 210px; border-radius: 999px 999px 20px 20px; object-fit: cover; margin: 0 auto 20px; border: 2px solid var(--gold); padding: 4px; background: var(--ivory); }
    .muted { font-size: 14px; color: #634F43; line-height: 1.65; }

    /* Story */
    .story-list { max-width: 760px; margin: 36px auto 0; }
    .story-row { display: grid; grid-template-columns: 80px 1fr; gap: 20px; padding: 24px 0; border-bottom: 1px solid var(--border); }
    .story-year { font-family: 'Cormorant Garamond', serif; font-size: 1.65rem; font-weight: 700; color: var(--gold); font-variant-numeric: tabular-nums; }
    .story-body h3 { font-size: 1.45rem; margin-bottom: 6px; }
    .story-body p { font-size: 14.5px; color: #574439; line-height: 1.7; }

    /* Gallery */
    .gal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-top: 32px; }
    .gal-card { position: relative; border-radius: 16px; overflow: hidden; border: 1px solid var(--border); cursor: pointer; background: var(--teak); padding: 0; text-align: left; aspect-ratio: 4/3; }
    .gal-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
    .gal-card:hover img { transform: scale(1.04); }
    .gal-caption { position: absolute; inset: auto 0 0 0; padding: 28px 14px 12px; background: linear-gradient(to top, rgba(20,11,7,0.88), transparent); color: var(--ivory); }
    .gal-caption span { display: block; font-size: 11px; color: var(--gold-light); margin-bottom: 2px; }
    .gal-caption strong { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-weight: 600; }

    /* Map */
    .map-frame { width: 100%; height: 340px; border: 1px solid var(--border); border-radius: 18px; margin-top: 24px; background: var(--sand); }

    /* RSVP */
    .form-box { max-width: 640px; margin: 32px auto 0; background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: 28px; text-align: left; }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .field input, .field select, .field textarea { width: 100%; padding: 12px 14px; border: 1px solid rgba(36,22,15,0.18); border-radius: 12px; font-size: 14px; background: var(--ivory); color: var(--espresso); }
    .wish-list { max-width: 640px; margin: 24px auto 0; display: grid; gap: 12px; text-align: left; }
    .wish-item { background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 16px; }
    .wish-head { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; margin-bottom: 6px; }


    /* Floating Music Button */
    #music-btn {
      position: fixed; right: 16px; bottom: 16px; z-index: 40;
      width: 48px; height: 48px; border-radius: 999px;
      background: var(--espresso); color: var(--gold-light); border: 1px solid var(--gold-light);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.22); font-size: 18px;
    }

    /* Lightbox */
    #lightbox {
      position: fixed; inset: 0; z-index: 60; background: rgba(15,9,6,0.94);
      display: none; align-items: center; justify-content: center; padding: 20px; color: var(--ivory);
    }
    #lightbox.open { display: flex; }
    #lightbox img { max-height: 75vh; border-radius: 14px; object-fit: contain; }
  </style>
</head>
<body class="locked">
  <!-- Cover Curtain -->
  <div id="cover">
    <div class="cover-box">
      <p class="cover-kicker">Undangan Pernikahan</p>
      <h1 class="cover-title">${escapeHtml(config.coupleTitle)}</h1>
      <div class="guest-card">
        <p class="guest-label">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p class="guest-name" id="guest-name-cover">Tamu Undangan</p>
      </div>
      <button type="button" class="btn-gold" onclick="openInvitation()">Buka Undangan</button>
    </div>
  </div>

  <!-- Hero -->
  <section class="section">
    <div class="container hero">
      <div>
        <p class="kicker">Pawiwahan Ageng Jawa</p>
        <h2 class="heading">${escapeHtml(config.coupleTitle)}</h2>
        <p class="lead" style="margin: 0 0 18px;">${escapeHtml(config.akad.dateLabel)} · ${escapeHtml(config.venueName)}</p>
        <p class="lead" style="margin: 0 0 28px; font-style: italic;">“${escapeHtml(config.greetingQuote)}” — ${escapeHtml(config.greetingSource)}</p>
        <a href="#rsvp" class="btn-gold">Konfirmasi Kehadiran (RSVP)</a>
      </div>
      <div>
        <img src="${coverData}" alt="${escapeHtml(config.coupleTitle)}" class="hero-photo" />
      </div>
    </div>
  </section>

  <!-- Countdown -->
  <section class="section section-dark center">
    <div class="container">
      <p class="kicker">Menuju Hari Bahagia</p>
      <h2 class="heading">Hitung Mundur Akad Nikah</h2>
      <div class="countdown-grid">
        <div class="count-box"><div class="count-num" id="cd-days">00</div><div class="count-label">Hari</div></div>
        <div class="count-box"><div class="count-num" id="cd-hours">00</div><div class="count-label">Jam</div></div>
        <div class="count-box"><div class="count-num" id="cd-mins">00</div><div class="count-label">Menit</div></div>
        <div class="count-box"><div class="count-num" id="cd-secs">00</div><div class="count-label">Detik</div></div>
      </div>
    </div>
  </section>

  <!-- Mempelai -->
  <section class="section center" id="mempelai">
    <div class="container">
      <p class="kicker">${escapeHtml(config.greetingTitle)}</p>
      <h2 class="heading">Mempelai Berbahagia</h2>
      <div class="grid-2">
        <div class="card-ivory">
          <img src="${brideData}" alt="${escapeHtml(config.bride.fullName)}" class="portrait" />
          <p class="kicker">Mempelai Wanita</p>
          <h3 style="font-size: 1.75rem; margin-bottom: 8px;">${escapeHtml(config.bride.fullName)}</h3>
          <p class="muted">${escapeHtml(config.bride.childOrder)}<br/>${escapeHtml(config.bride.parents)}</p>
        </div>
        <div class="card-ivory">
          <img src="${groomData}" alt="${escapeHtml(config.groom.fullName)}" class="portrait" />
          <p class="kicker">Mempelai Pria</p>
          <h3 style="font-size: 1.75rem; margin-bottom: 8px;">${escapeHtml(config.groom.fullName)}</h3>
          <p class="muted">${escapeHtml(config.groom.childOrder)}<br/>${escapeHtml(config.groom.parents)}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Acara & Google Maps -->
  <section class="section section-sand center" id="acara">
    <div class="container">
      <p class="kicker">Rangkaian Acara</p>
      <h2 class="heading">Waktu &amp; Lokasi</h2>
      <div class="grid-2">
        <div class="card-ivory">
          <p class="kicker">${escapeHtml(config.akad.title)}</p>
          <h3 style="font-size: 1.65rem; margin-bottom: 10px;">${escapeHtml(config.akad.dateLabel)}</h3>
          <p class="muted"><strong>${escapeHtml(config.akad.timeLabel)}</strong></p>
          <p class="muted" style="margin-top: 8px;">${escapeHtml(config.akad.venue)}<br/>${escapeHtml(config.akad.address)}</p>
        </div>
        <div class="card-ivory">
          <p class="kicker">${escapeHtml(config.resepsi.title)}</p>
          <h3 style="font-size: 1.65rem; margin-bottom: 10px;">${escapeHtml(config.resepsi.dateLabel)}</h3>
          <p class="muted"><strong>${escapeHtml(config.resepsi.timeLabel)}</strong></p>
          <p class="muted" style="margin-top: 8px;">${escapeHtml(config.resepsi.venue)}<br/>${escapeHtml(config.resepsi.address)}</p>
        </div>
      </div>

      <div style="margin-top: 32px;">
        <iframe class="map-frame" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${embedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed" title="Peta Lokasi Pernikahan"></iframe>
        <div style="margin-top: 18px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <a href="${escapeHtml(config.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn-gold">Buka di Google Maps</a>
          <button type="button" class="btn-outline" onclick="copyText('${escapeHtml(config.venueAddress)}', this)">Salin Alamat</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Kisah Cinta -->
  <section class="section center">
    <div class="container">
      <p class="kicker">Perjalanan Kasih</p>
      <h2 class="heading">Kisah Kami</h2>
      <div class="story-list">${storiesHtml}</div>
    </div>
  </section>

  <!-- Galeri -->
  <section class="section section-sand center" id="galeri">
    <div class="container">
      <p class="kicker">Momen Bahagia</p>
      <h2 class="heading">Galeri Foto</h2>
      <div class="gal-grid">${galleryItemsHtml}</div>
    </div>
  </section>

  <!-- RSVP -->
  <section class="section center" id="rsvp">
    <div class="container">
      <p class="kicker">Konfirmasi Kehadiran</p>
      <h2 class="heading">RSVP &amp; Ucapan Doa</h2>
      <p class="lead">Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p>
      <form class="form-box" onsubmit="submitRsvp(event)">
        <div class="field">
          <label for="rsvp-nama">Nama Lengkap</label>
          <input id="rsvp-nama" required placeholder="Nama Anda" />
        </div>
        <div class="field">
          <label for="rsvp-hubungan">Relasi / Asal</label>
          <input id="rsvp-hubungan" placeholder="Sahabat, Keluarga, Rekan Kerja..." />
        </div>
        <div class="field">
          <label for="rsvp-hadir">Konfirmasi Kehadiran</label>
          <select id="rsvp-hadir">
            <option value="Hadir">Hadir</option>
            <option value="Berhalangan">Berhalangan Hadir</option>
          </select>
        </div>
        <div class="field">
          <label for="rsvp-jumlah">Jumlah Tamu</label>
          <select id="rsvp-jumlah">
            <option value="1">1 Orang</option>
            <option value="2">2 Orang</option>
            <option value="3">3 Orang</option>
            <option value="4">4 Orang</option>
          </select>
        </div>
        <div class="field">
          <label for="rsvp-ucapan">Ucapan &amp; Doa</label>
          <textarea id="rsvp-ucapan" rows="3" required placeholder="Tuliskan doa restu Anda..."></textarea>
        </div>
        <button type="submit" class="btn-gold" style="width: 100%;" id="rsvp-submit-btn">Kirim Ucapan &amp; Konfirmasi</button>
        <p id="rsvp-status" class="muted" style="margin-top: 10px; text-align: center;"></p>
      </form>
      <div class="wish-list" id="wish-list"></div>
    </div>
  </section>


  <footer class="section section-dark center" style="padding: 48px 20px;">
    <div class="container">
      <p class="kicker">Matur Nuwun</p>
      <h2 class="heading">${escapeHtml(config.coupleTitle)}</h2>
      <p class="lead">${escapeHtml(config.akad.dateLabel)}</p>
    </div>
  </footer>

  <button type="button" id="music-btn" onclick="toggleMusic()" aria-label="Putar atau jeda musik">♫</button>

  <div id="lightbox" onclick="closeLightbox(event)">
    <div style="max-width: 820px; width: 100%; text-align: center;">
      <img id="lb-img" src="" alt="" style="margin: 0 auto;" />
      <p id="lb-title" style="margin-top: 14px; font-family: 'Cormorant Garamond', serif; font-size: 1.5rem;"></p>
      <p id="lb-caption" style="margin-top: 4px; font-size: 13px; opacity: 0.8;"></p>
      <button type="button" class="btn-gold" style="margin-top: 16px;" onclick="document.getElementById('lightbox').classList.remove('open')">Tutup</button>
    </div>
  </div>

  <script>
    var SHEET_WEBHOOK = "${webhookUrlEscaped}";
    var CUSTOM_AUDIO = "${audioUrlEscaped}";
    var TARGET_ISO = "${escapeHtml(config.targetDateIso)}";
    var GALLERY = ${galleryJson};

    // Parse ?to=Nama+Tamu
    (function() {
      var params = new URLSearchParams(window.location.search);
      var guest = params.get('to');
      if (guest && guest.trim()) {
        document.getElementById('guest-name-cover').textContent = guest.trim();
        document.getElementById('rsvp-nama').value = guest.trim();
      }
    })();

    // Audio Engine
    var audioPlaying = false;
    var audioCtx = null;
    var audioTimer = null;
    var audioEl = null;
    var step = 0;
    var notes = [293.66, 349.23, 440, 466.16, 440, 349.23, 311.13, 293.66];

    function startMusic() {
      if (audioPlaying) return;
      if (CUSTOM_AUDIO) {
        try {
          audioEl = new Audio(CUSTOM_AUDIO);
          audioEl.loop = true;
          audioEl.play();
          audioPlaying = true;
          document.getElementById('music-btn').textContent = '❚❚';
          return;
        } catch(e) {}
      }
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx) audioCtx = new Ctx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        audioPlaying = true;
        document.getElementById('music-btn').textContent = '❚❚';
        audioTimer = setInterval(function() {
          if (!audioPlaying) return;
          var o = audioCtx.createOscillator();
          var g = audioCtx.createGain();
          o.type = 'triangle';
          o.frequency.value = notes[step % notes.length];
          g.gain.setValueAtTime(0.001, audioCtx.currentTime);
          g.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.4);
          o.connect(g); g.connect(audioCtx.destination);
          o.start(); o.stop(audioCtx.currentTime + 1.5);
          step++;
        }, 900);
      } catch(e) {}
    }

    function toggleMusic() {
      if (audioPlaying) {
        audioPlaying = false;
        if (audioEl) audioEl.pause();
        if (audioTimer) clearInterval(audioTimer);
        document.getElementById('music-btn').textContent = '♫';
      } else {
        startMusic();
      }
    }

    function openInvitation() {
      document.getElementById('cover').classList.add('opened');
      document.body.classList.remove('locked');
      startMusic();
    }

    // Countdown
    function updateCountdown() {
      var diff = new Date(TARGET_ISO).getTime() - Date.now();
      if (diff <= 0) diff = 0;
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
      document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
      document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
      document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Lightbox
    function openLightbox(idx) {
      var item = GALLERY[idx];
      if (!item) return;
      document.getElementById('lb-img').src = item.src;
      document.getElementById('lb-title').textContent = item.title;
      document.getElementById('lb-caption').textContent = item.caption;
      document.getElementById('lightbox').classList.add('open');
    }
    function closeLightbox(e) {
      if (e.target.id === 'lightbox') e.target.classList.remove('open');
    }

    // Copy helper
    function copyText(text, btn) {
      navigator.clipboard.writeText(text);
      var old = btn.textContent;
      btn.textContent = 'Tersalin ✓';
      setTimeout(function() { btn.textContent = old; }, 1800);
    }

    // RSVP
    function renderWish(item) {
      var list = document.getElementById('wish-list');
      var div = document.createElement('div');
      div.className = 'wish-item';
      div.innerHTML = '<div class="wish-head"><strong></strong><span></span></div><p class="muted"></p>';
      div.querySelector('strong').textContent = item.nama + ' (' + item.hubungan + ')';
      div.querySelector('span').textContent = item.kehadiran + (item.kehadiran === 'Hadir' ? ' · ' + item.jumlahTamu + ' Tamu' : '');
      div.querySelector('p').textContent = item.ucapan;
      list.prepend(div);
    }

    async function submitRsvp(e) {
      e.preventDefault();
      var payload = {
        nama: document.getElementById('rsvp-nama').value.trim(),
        hubungan: document.getElementById('rsvp-hubungan').value.trim() || 'Tamu Undangan',
        kehadiran: document.getElementById('rsvp-hadir').value,
        jumlahTamu: Number(document.getElementById('rsvp-jumlah').value || 1),
        ucapan: document.getElementById('rsvp-ucapan').value.trim()
      };
      var statusEl = document.getElementById('rsvp-status');
      statusEl.textContent = 'Mengirim konfirmasi...';
      if (SHEET_WEBHOOK) {
        try {
          await fetch(SHEET_WEBHOOK, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
          });
        } catch(err) {}
      }
      renderWish(payload);
      e.target.reset();
      statusEl.textContent = 'Terima kasih! Konfirmasi & ucapan Anda telah tersimpan.';
    }
  </script>
</body>
</html>`;
}
