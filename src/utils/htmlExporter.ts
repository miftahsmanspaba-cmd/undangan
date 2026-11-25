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

function escapeJsString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Resize & compress image via HTML5 Canvas so exported standalone index.html
 * stays compact (~300-500KB total), loads instantaneously on mobile, and uploads cleanly to GitHub.
 */
async function imageUrlToCompressedDataUri(src: string): Promise<string> {
  if (!src) return '';
  if (src.startsWith('data:')) return src;

  try {
    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const maxDim = 960;
          let width = img.naturalWidth || 800;
          let height = img.naturalHeight || 800;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(src);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } catch {
          resolve(src);
        }
      };
      img.onerror = async () => {
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : src);
          reader.onerror = () => resolve(src);
          reader.readAsDataURL(blob);
        } catch {
          resolve(src);
        }
      };
      img.src = src;
    });
  } catch {
    return src;
  }
}

export async function generateStandaloneHtml(config: WeddingConfig): Promise<string> {
  const [coverData, brideData, groomData, ...galleryData] = await Promise.all([
    imageUrlToCompressedDataUri(config.coverPhoto),
    imageUrlToCompressedDataUri(config.bride.photo),
    imageUrlToCompressedDataUri(config.groom.photo),
    ...config.gallery.map((g) => imageUrlToCompressedDataUri(g.src)),
  ]);

  const galleryItemsHtml = config.gallery
    .map((photo, idx) => {
      const imgSrc = galleryData[idx] || photo.src;
      return `
        <button type="button" class="gal-card reveal" style="transition-delay: ${(idx % 3) * 90}ms;" onclick="openLightbox(${idx})">
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
  )
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  const embedQuery = encodeURIComponent(config.googleMapsEmbedQuery || config.venueName);
  const webhookUrlJs = escapeJsString(config.googleSheetWebhookUrl || '');
  const audioUrlJs = escapeJsString(config.audioUrl || '');
  const targetIsoJs = escapeJsString(config.targetDateIso);

  const gununganSvg = `<svg viewBox="0 0 80 112" width="38" height="52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="color:#DFB963;margin:0 auto 12px;display:block;"><path d="M40 4C34 18 22 30 14 48C8 62 8 80 16 94H64C72 80 72 62 66 48C58 30 46 18 40 4Z" stroke="currentColor" stroke-width="1.35"/><path d="M40 14C35.5 26 27 37 21 51C16.5 62 16.5 76 23 88H57C63.5 76 63.5 62 59 51C53 37 44.5 26 40 14Z" stroke="currentColor" stroke-width="0.95" stroke-opacity="0.72"/><path d="M40 24V88M28 58C34 52 46 52 52 58M23 72C31 64 49 64 57 72" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/><circle cx="40" cy="50" r="4" stroke="currentColor" stroke-width="1.15"/></svg>`;

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
    html { scroll-behavior: smooth; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; background: var(--ivory); color: var(--espresso); }
    body.locked { overflow: hidden; }
    h1, h2, h3, .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
    img { display: block; max-width: 100%; }
    button, input, select, textarea { font-family: inherit; }

    /* Cover Envelope */
    #cover {
      position: fixed; inset: 0; z-index: 50;
      background-color: #180E09;
      background-image: linear-gradient(to bottom, rgba(22,12,7,0.85), rgba(18,9,5,0.95)), url("${coverData}");
      background-size: cover;
      background-position: center;
      color: var(--ivory);
      display: flex; align-items: center; justify-content: center;
      padding: 20px; text-align: center;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s ease;
    }
    #cover.opened { transform: translateY(-100%); opacity: 0; pointer-events: none; }
    .cover-outer { max-width: 780px; width: 100%; max-height: 92vh; overflow-y: auto; padding: 10px; border: 1px solid rgba(223,185,99,0.4); background: rgba(36,22,15,0.88); backdrop-filter: blur(8px); border-radius: 26px; box-shadow: 0 25px 60px rgba(0,0,0,0.5); }
    .cover-box { display: grid; grid-template-columns: 1fr; gap: 22px; align-items: center; padding: 26px 20px; border: 1px solid rgba(223,185,99,0.22); border-radius: 18px; text-align: center; }
    @media (min-width: 720px) { .cover-box { grid-template-columns: 5fr 7fr; gap: 32px; padding: 34px 32px; text-align: left; } }
    .cover-portrait-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .cover-heading-top { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.15rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-light); margin-bottom: 12px; text-align: center; }
    .cover-portrait { width: 170px; height: 220px; border-radius: 999px 999px 20px 20px; object-fit: cover; object-position: top; border: 2px solid rgba(223,185,99,0.75); padding: 4px; background: #180E09; box-shadow: 0 14px 35px rgba(0,0,0,0.45); }
    @media (min-width: 720px) { .cover-portrait { width: 100%; height: 360px; } }
    .cover-title { font-size: clamp(2.25rem, 5vw, 3.6rem); font-weight: 600; line-height: 1.05; margin-bottom: 8px; }
    .cover-date { font-size: 13px; color: rgba(250,246,238,0.78); margin-bottom: 18px; }
    .guest-card { border-top: 1px solid rgba(223,185,99,0.25); border-bottom: 1px solid rgba(223,185,99,0.25); padding: 14px 10px; margin-bottom: 22px; }
    .guest-label { font-size: 12.5px; color: rgba(250,246,238,0.75); margin-bottom: 4px; }
    .guest-name { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.75rem; font-weight: 600; color: var(--gold-light); }

    /* Buttons */
    .btn-gold {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--gold); color: #fff; border: none; border-radius: 999px;
      padding: 14px 28px; font-size: 14px; font-weight: 600; cursor: pointer;
      text-decoration: none; min-height: 46px; transition: background 0.2s, transform 0.15s;
    }
    .btn-gold:hover { background: #9C7022; }
    .btn-gold:active { transform: scale(0.98); }
    .btn-outline {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: #fff; color: var(--espresso); border: 1px solid var(--border);
      border-radius: 999px; padding: 11px 22px; font-size: 13px; font-weight: 600;
      cursor: pointer; text-decoration: none; min-height: 44px; transition: background 0.2s;
    }
    .btn-outline:hover { background: var(--sand); }

    /* Sections */
    .section { padding: 72px 20px; }
    .section-dark { background: var(--espresso); color: var(--ivory); }
    .section-sand { background: var(--sand); }
    .container { max-width: 1040px; margin: 0 auto; }
    .center { text-align: center; }
    .kicker { font-size: 11.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #8A5E14; font-weight: 700; margin-bottom: 10px; }
    .section-dark .kicker { color: var(--gold-light); }
    .heading { font-size: clamp(2rem, 4vw, 3.1rem); font-weight: 600; line-height: 1.12; margin-bottom: 16px; }
    .lead { font-size: 15px; line-height: 1.75; color: #574439; max-width: 64ch; margin: 0 auto; }
    .section-dark .lead { color: rgba(250,246,238,0.8); }

    /* Hero */
    .hero { display: grid; grid-template-columns: 1fr; gap: 36px; align-items: center; }
    @media (min-width: 860px) { .hero { grid-template-columns: 1.05fr 0.95fr; gap: 56px; } }
    .hero-arch { border-radius: 999px 999px 24px 24px; border: 1px solid rgba(184,134,45,0.4); padding: 10px; background: #fff; box-shadow: 0 20px 45px rgba(36,22,15,0.12); }
    .hero-photo { border-radius: 999px 999px 18px 18px; aspect-ratio: 3/4; max-height: 580px; width: 100%; object-fit: cover; object-position: top; }
    .hero-meta-outer { margin-top: 42px; border: 1px solid rgba(184,134,45,0.35); border-radius: 24px; padding: 8px; background: rgba(255,255,255,0.9); box-shadow: 0 8px 24px rgba(36,22,15,0.05); }
    .hero-meta-grid { display: grid; grid-template-columns: 1fr; border: 1px solid rgba(184,134,45,0.2); border-radius: 18px; }
    @media (min-width: 760px) { .hero-meta-grid { grid-template-columns: repeat(3, 1fr); } }
    .hero-meta-cell { padding: 20px 18px; text-align: center; border-bottom: 1px solid rgba(184,134,45,0.2); }
    .hero-meta-cell:last-child { border-bottom: none; }
    @media (min-width: 760px) { .hero-meta-cell { border-bottom: none; border-right: 1px solid rgba(184,134,45,0.2); } .hero-meta-cell:last-child { border-right: none; } }
    .hero-meta-kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #8A5E14; }
    .hero-meta-val { margin-top: 6px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.55rem; font-weight: 600; color: var(--espresso); line-height: 1.15; }
    .hero-meta-sub { margin-top: 4px; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 1rem; color: #6E594C; }

    /* Countdown */
    .countdown-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-width: 560px; margin: 28px auto; }
    .count-box { background: var(--teak); border: 1px solid rgba(223,185,99,0.28); border-radius: 16px; padding: 18px 8px; }
    .count-num { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2rem, 4vw, 2.75rem); font-weight: 600; color: var(--gold-light); font-variant-numeric: tabular-nums; line-height: 1; }
    .count-label { font-size: 12px; color: rgba(250,246,238,0.75); margin-top: 6px; }

    /* Couple & Events Grid */
    .grid-2 { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 36px; }
    @media (min-width: 768px) { .grid-2 { grid-template-columns: 1fr 1fr; gap: 32px; } }
    .card-outer { background: #fff; border: 1px solid var(--border); border-radius: 24px; padding: 10px; box-shadow: 0 8px 24px rgba(36,22,15,0.04); }
    .card-ivory { border: 1px solid rgba(184,134,45,0.16); border-radius: 16px; padding: 28px 22px; height: 100%; }
    .portrait { width: 172px; height: 216px; border-radius: 999px 999px 20px 20px; object-fit: cover; object-position: top; margin: 0 auto 20px; border: 2px solid var(--gold); padding: 4px; background: var(--ivory); }
    .muted { font-size: 14px; color: #634F43; line-height: 1.65; }

    /* Story */
    .story-list { max-width: 760px; margin: 36px auto 0; border-top: 1px solid var(--border); }
    .story-row { display: grid; grid-template-columns: 100px 1fr; gap: 20px; padding: 26px 0; border-bottom: 1px solid var(--border); text-align: left; }
    @media (max-width: 560px) { .story-row { grid-template-columns: 1fr; gap: 8px; } }
    .story-bab { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8A5E14; font-weight: 700; }
    .story-year { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.85rem; font-weight: 700; color: var(--gold); font-variant-numeric: tabular-nums; }
    .story-body h3 { font-size: 1.5rem; margin-bottom: 6px; }
    .story-body p { font-size: 14.5px; color: #574439; line-height: 1.7; }

    /* Gallery */
    .gal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-top: 32px; }
    .gal-card { position: relative; border-radius: 16px; overflow: hidden; border: 1px solid var(--border); cursor: pointer; background: var(--teak); padding: 0; text-align: left; aspect-ratio: 3/4; }
    .gal-card img { width: 100%; height: 100%; object-fit: cover; object-position: top; transition: transform 0.35s ease; }
    .gal-card:hover img { transform: scale(1.04); }
    .gal-caption { position: absolute; inset: auto 0 0 0; padding: 28px 14px 12px; background: linear-gradient(to top, rgba(20,11,7,0.88), transparent); color: var(--ivory); }
    .gal-caption span { display: block; font-size: 11px; color: var(--gold-light); margin-bottom: 2px; }
    .gal-caption strong { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.15rem; font-weight: 600; }

    /* Map */
    .map-frame { width: 100%; height: 340px; border: 1px solid var(--border); border-radius: 18px; margin-top: 24px; background: var(--sand); }

    /* RSVP */
    .form-box { max-width: 640px; margin: 32px auto 0; background: #fff; border: 1px solid var(--border); border-radius: 22px; padding: 28px; text-align: left; }
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
      box-shadow: 0 8px 24px rgba(0,0,0,0.25); font-size: 18px;
    }

    /* Lightbox */
    #lightbox {
      position: fixed; inset: 0; z-index: 60; background: rgba(15,9,6,0.94);
      display: none; align-items: center; justify-content: center; padding: 20px; color: var(--ivory);
    }
    #lightbox.open { display: flex; }
    #lightbox img { max-height: 74vh; border-radius: 14px; object-fit: contain; }

    /* Scroll Progress Bar & Scroll Reveal Animations */
    #scroll-bar {
      position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 45;
      background: linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold));
      transform-origin: left; transform: scaleX(0); pointer-events: none;
    }
    .reveal {
      opacity: 0;
      transform: translateY(28px) scale(0.98);
      transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: opacity, transform;
    }
    .reveal.in-view {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    @media (prefers-reduced-motion: reduce) {
      .reveal { opacity: 1; transform: none; transition: none; }
    }
  </style>
</head>
<body class="locked">
  <div id="scroll-bar" aria-hidden="true"></div>
  <!-- Cover Curtain -->
  <div id="cover">
    <div class="cover-outer">
      <div class="cover-box">
        <div class="cover-portrait-wrap">
          <p class="cover-heading-top">Undangan Pernikahan</p>
          <img src="${coverData}" alt="Foto Pengantin ${escapeHtml(config.coupleTitle)}" class="cover-portrait" />
        </div>
        <div>
          ${gununganSvg}
          <h1 class="cover-title">${escapeHtml(config.coupleTitle)}</h1>
          <p class="cover-date">${escapeHtml(config.resepsi.dateLabel)}</p>
          <div class="guest-card">
            <p class="guest-label">Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <p class="guest-name" id="guest-name-cover">Tamu Undangan</p>
          </div>
          <button type="button" class="btn-gold" onclick="openInvitation()">Buka Undangan</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Hero -->
  <section class="section">
    <div class="container hero">
      <div class="reveal">
        <p class="kicker">Undangan Pernikahan · ${escapeHtml(config.resepsi.dateLabel)}</p>
        <h2 class="heading" style="font-size: clamp(2.6rem, 5vw, 4.2rem);">${escapeHtml(config.coupleTitle)}</h2>
        <p class="lead" style="margin: 0 0 14px; font-style: italic; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.35rem;">“${escapeHtml(config.greetingQuote)}”</p>
        <p class="kicker" style="margin-bottom: 26px;">${escapeHtml(config.greetingSource)}</p>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <a href="#rsvp" class="btn-gold">Konfirmasi Kehadiran</a>
          <a href="#lokasi" class="btn-outline">Lihat Lokasi Acara</a>
        </div>
      </div>
      <div class="hero-arch reveal" style="transition-delay: 120ms;">
        <img src="${coverData}" alt="${escapeHtml(config.coupleTitle)}" class="hero-photo" />
      </div>
    </div>
    <div class="container hero-meta-outer reveal" style="transition-delay: 150ms;">
      <div class="hero-meta-grid">
        <div class="hero-meta-cell">
          <p class="hero-meta-kicker">${escapeHtml(config.akad.title)}</p>
          <p class="hero-meta-val">${escapeHtml(config.akad.dateLabel)}</p>
          <p class="hero-meta-sub">Pukul ${escapeHtml(config.akad.timeLabel)}</p>
        </div>
        <div class="hero-meta-cell">
          <p class="hero-meta-kicker">${escapeHtml(config.resepsi.title)}</p>
          <p class="hero-meta-val">${escapeHtml(config.resepsi.dateLabel)}</p>
          <p class="hero-meta-sub">Pukul ${escapeHtml(config.resepsi.timeLabel)}</p>
        </div>
        <div class="hero-meta-cell">
          <p class="hero-meta-kicker">Lokasi Acara</p>
          <p class="hero-meta-val">${escapeHtml(config.venueName)}</p>
          <p class="hero-meta-sub">${escapeHtml(config.resepsi.venue)}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Countdown -->
  <section class="section section-dark center">
    <div class="container reveal">
      <p class="kicker">Menuju Hari Bahagia</p>
      <h2 class="heading">Hitung Mundur Menuju Resepsi</h2>
      <div class="countdown-grid">
        <div class="count-box reveal" style="transition-delay: 60ms;"><div class="count-num" id="cd-days">00</div><div class="count-label">Hari</div></div>
        <div class="count-box reveal" style="transition-delay: 140ms;"><div class="count-num" id="cd-hours">00</div><div class="count-label">Jam</div></div>
        <div class="count-box reveal" style="transition-delay: 220ms;"><div class="count-num" id="cd-mins">00</div><div class="count-label">Menit</div></div>
        <div class="count-box reveal" style="transition-delay: 300ms;"><div class="count-num" id="cd-secs">00</div><div class="count-label">Detik</div></div>
      </div>
    </div>
  </section>

  <!-- Mempelai -->
  <section class="section center" id="mempelai">
    <div class="container">
      <div class="reveal">
        <p class="kicker">${escapeHtml(config.greetingTitle)}</p>
        <h2 class="heading">Mempelai Berbahagia</h2>
      </div>
      <div class="grid-2">
        <div class="card-outer reveal">
          <div class="card-ivory">
            <img src="${brideData}" alt="${escapeHtml(config.bride.fullName)}" class="portrait" />
            <p class="kicker">Mempelai Wanita</p>
            <h3 style="font-size: 1.75rem; margin-bottom: 8px;">${escapeHtml(config.bride.fullName)}</h3>
            <p class="muted">${escapeHtml(config.bride.childOrder)}<br/>${escapeHtml(config.bride.parents)}</p>
          </div>
        </div>
        <div class="card-outer reveal" style="transition-delay: 120ms;">
          <div class="card-ivory">
            <img src="${groomData}" alt="${escapeHtml(config.groom.fullName)}" class="portrait" />
            <p class="kicker">Mempelai Pria</p>
            <h3 style="font-size: 1.75rem; margin-bottom: 8px;">${escapeHtml(config.groom.fullName)}</h3>
            <p class="muted">${escapeHtml(config.groom.childOrder)}<br/>${escapeHtml(config.groom.parents)}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Acara & Google Maps -->
  <section class="section section-sand center" id="acara">
    <div class="container">
      <div class="reveal">
        <p class="kicker">Rangkaian Acara</p>
        <h2 class="heading">Waktu &amp; Tempat</h2>
      </div>
      <div class="grid-2">
        <div class="card-outer reveal">
          <div class="card-ivory">
            <p class="kicker">${escapeHtml(config.akad.title)}</p>
            <h3 style="font-size: 1.65rem; margin-bottom: 10px;">${escapeHtml(config.akad.dateLabel)}</h3>
            <p class="muted"><strong>${escapeHtml(config.akad.timeLabel)}</strong></p>
            <p class="muted" style="margin-top: 8px;">${escapeHtml(config.akad.venue)}<br/>${escapeHtml(config.akad.address)}</p>
          </div>
        </div>
        <div class="card-outer reveal" style="transition-delay: 120ms;">
          <div class="card-ivory">
            <p class="kicker">${escapeHtml(config.resepsi.title)}</p>
            <h3 style="font-size: 1.65rem; margin-bottom: 10px;">${escapeHtml(config.resepsi.dateLabel)}</h3>
            <p class="muted"><strong>${escapeHtml(config.resepsi.timeLabel)}</strong></p>
            <p class="muted" style="margin-top: 8px;">${escapeHtml(config.resepsi.venue)}<br/>${escapeHtml(config.resepsi.address)}</p>
          </div>
        </div>
      </div>

      <div id="lokasi" class="reveal" style="margin-top: 32px;">
        <iframe class="map-frame" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${embedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed" title="Peta Lokasi Pernikahan"></iframe>
        <div style="margin-top: 18px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <a href="${escapeHtml(config.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn-gold">Buka di Google Maps</a>
          <button type="button" class="btn-outline" onclick="copyText('${escapeJsString(config.venueAddress)}', this)">Salin Alamat</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Galeri -->
  <section class="section center" id="galeri">
    <div class="container">
      <div class="reveal">
        <p class="kicker">Momen Bahagia</p>
        <h2 class="heading">Galeri Foto</h2>
      </div>
      <div class="gal-grid">${galleryItemsHtml}</div>
    </div>
  </section>

  <!-- RSVP -->
  <section class="section section-sand center" id="rsvp">
    <div class="container">
      <div class="reveal">
        <p class="kicker">Konfirmasi Kehadiran</p>
        <h2 class="heading">RSVP &amp; Ucapan Doa</h2>
        <p class="lead">Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p>
      </div>
      <form class="form-box reveal" onsubmit="submitRsvp(event)">
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
            <option value="Hadir">InsyaAllah Hadir</option>
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
    <div class="container reveal">
      ${gununganSvg}
      <p class="kicker">Matur Nuwun</p>
      <h2 class="heading">${escapeHtml(config.coupleTitle)}</h2>
      <p class="lead">Kami yang berbahagia: Kel. ${escapeHtml(config.bride.parents)} &amp; Kel. ${escapeHtml(config.groom.parents)}</p>
    </div>
  </footer>

  <button type="button" id="music-btn" onclick="toggleMusic()" aria-label="Putar atau jeda musik">♫</button>

  <div id="lightbox" onclick="closeLightbox(event)">
    <div style="max-width: 820px; width: 100%; text-align: center;">
      <img id="lb-img" src="" alt="" style="margin: 0 auto;" />
      <p id="lb-title" style="margin-top: 14px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.5rem;"></p>
      <p id="lb-caption" style="margin-top: 4px; font-size: 13px; opacity: 0.8;"></p>
      <button type="button" class="btn-gold" style="margin-top: 16px;" onclick="document.getElementById('lightbox').classList.remove('open')">Tutup</button>
    </div>
  </div>

  <script>
    var SHEET_WEBHOOK = "${webhookUrlJs}";
    var CUSTOM_AUDIO = "${audioUrlJs}";
    var TARGET_ISO = "${targetIsoJs}";
    var GALLERY = ${galleryJson};

    // Parse ?to=Nama+Tamu
    (function() {
      try {
        var params = new URLSearchParams(window.location.search);
        var guest = params.get('to');
        if (guest && guest.trim()) {
          document.getElementById('guest-name-cover').textContent = guest.trim();
          document.getElementById('rsvp-nama').value = guest.trim();
        }
      } catch(e) {}
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
      if (isNaN(diff) || diff <= 0) diff = 0;
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

    // Copy helper (works even inside Canva Embed iframe)
    function copyText(text, btn) {
      var copied = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
          copied = true;
        }
      } catch(e) {}
      if (!copied) {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        } catch(e) {}
      }
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
      statusEl.textContent = 'Matur nuwun! Konfirmasi & ucapan Anda telah tersimpan.';
    }

    // Scroll Reveal Animations & Top Progress Bar
    (function() {
      var bar = document.getElementById('scroll-bar');
      window.addEventListener('scroll', function() {
        if (!bar) return;
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
        bar.style.transform = 'scaleX(' + pct + ')';
      }, { passive: true });

      var els = document.querySelectorAll('.reveal');
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
            } else {
              entry.target.classList.remove('in-view');
            }
          });
        }, { threshold: 0.14 });
        els.forEach(function(el) { obs.observe(el); });
      } else {
        els.forEach(function(el) { el.classList.add('in-view'); });
      }
    })();
  </script>
</body>
</html>`;
}
