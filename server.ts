import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'wedding-config.json');
const RSVP_FILE = path.join(DATA_DIR, 'rsvps.json');

interface RsvpRecord {
  id: string;
  nama: string;
  hubungan: string;
  kehadiran: 'Hadir' | 'Berhalangan';
  jumlahTamu: number;
  ucapan: string;
  createdAt: string;
  syncedToSheet?: boolean;
}

const DEFAULT_SERVER_CONFIG = {
  coupleTitle: 'Bismi & Rendi',
  greetingTitle: 'Assalamu’alaikum Warahmatullahi Wabarakatuh',
  greetingQuote:
    'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.',
  greetingSource: 'QS. Ar-Rum : 21',
  bride: {
    shortName: 'Bismi',
    fullName: 'Bismi Gaviar Putri, A.Md.Komp.',
    parents: 'Bapak Gatot Prianggodo, S.Pd & Ibu Defi Apriyanti (Pakembaran)',
    childOrder: 'Putri dari',
    instagram: '',
    photo: '/assets/aistudio/1_b2ef2998.jpeg',
  },
  groom: {
    shortName: 'Rendi',
    fullName: 'Rendi Candra Maulana, A.Md.Komp.',
    parents: 'Bapak Tobari & Ibu Sutriah (Selapura)',
    childOrder: 'Putra dari',
    instagram: '',
    photo: '/assets/aistudio/foto_mempelai_pria_f49441b6.jpg',
  },
  coverPhoto: '/assets/aistudio/2_189173bc.jpeg',
  targetDateIso: '2026-12-22T11:00:00+07:00',
  akad: {
    title: 'Akad Nikah',
    dateLabel: 'Senin, 21 Desember 2026',
    timeLabel: '09.00 WIB s/d selesai',
    venue: 'Kediaman Mempelai Wanita',
    address: 'Gg. Semboja 12 RT. 02/06 Cergomas, Pakembaran, Kec. Slawi, Kab. Tegal',
    note: 'Prosesi akad nikah berlangsung khidmat bersama keluarga besar.',
  },
  resepsi: {
    title: 'Resepsi',
    dateLabel: 'Selasa, 22 Desember 2026',
    timeLabel: '11.00 WIB s/d selesai',
    venue: 'Kediaman Mempelai Wanita',
    address: 'Gg. Semboja 12 RT. 02/06 Cergomas, Pakembaran, Kec. Slawi, Kab. Tegal',
    note: 'Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
  },
  venueName: 'Gg. Semboja 12, Cergomas, Pakembaran',
  venueAddress:
    'Gg. Semboja 12 RT. 02/06 Cergomas - Pakembaran, Kec. Slawi, Kab. Tegal, Jawa Tengah',
  googleMapsUrl:
    "https://www.google.com/maps/place/6%C2%B058'27.6%22S+109%C2%B007'45.6%22E/@-6.97434,109.1267589,750m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d-6.97434!4d109.1293338?hl=id",
  googleMapsEmbedQuery: '-6.97434,109.1293338',
  audioUrl: '',
  audioTitle: 'Ladrang Asmarandana — Instrumen Jawa Klasik',
  googleSheetWebhookUrl: '',
  loveStory: [
    {
      id: 'story-1',
      year: '2023',
      title: 'Awal Pertemuan & Kebersamaan',
      description:
        'Dari pertemuan sederhana dan persamaan visi di bidang teknologi informatika, langkah kami perlahan dipersatukan dalam doa dan saling percaya.',
    },
    {
      id: 'story-2',
      year: '2025',
      title: 'Silaturahmi & Restu Dua Keluarga',
      description:
        'Keluarga besar dari Pakembaran, Slawi dan Selapura bersilaturahmi dalam suasana hangat penuh kekeluargaan untuk merestui niat baik kami.',
    },
    {
      id: 'story-3',
      year: '2026',
      title: 'Menuju Hari Bahagia',
      description:
        'Dengan memohon rahmat dan ridho Allah SWT, kami meneguhkan janji suci untuk membangun rumah tangga yang sakinah, mawaddah, warahmah.',
    },
  ],
  gallery: [
    {
      id: 'gal-1',
      src: '/assets/aistudio/2_189173bc.jpeg',
      title: 'Harmoni Gunungan Keraton',
      caption: 'Potret kebersamaan dalam balutan busana Jawa hitam sulam emas di hadapan ukiran gunungan.',
      category: 'Prewedding',
      aspect: 'portrait',
    },
    {
      id: 'gal-2',
      src: '/assets/aistudio/3_bde0a069.jpeg',
      title: 'Langkah Seiring Adat Jawa',
      caption: 'Bersanding serasi dalam busana adat Jawa klasik penuh kewibawaan dan kehangatan.',
      category: 'Prewedding',
      aspect: 'portrait',
    },
    {
      id: 'gal-3',
      src: '/assets/aistudio/1_b2ef2998.jpeg',
      title: 'Anggun Kebaya Bludru',
      caption: 'Kebaya bludru hitam bersulam benang emas dipadukan cunduk mentul Jawa.',
      category: 'Prewedding',
      aspect: 'portrait',
    },
    {
      id: 'gal-4',
      src: '/assets/aistudio/4_99cfcbd1.jpg',
      title: 'Sanding Adat Sogan',
      caption: 'Potret penuh dalam balutan jarik parang klasik dan beskap Jawa.',
      category: 'Prewedding',
      aspect: 'portrait',
    },
    {
      id: 'gal-5',
      src: '/assets/aistudio/17c6e6c9-7895-48f9-917e-2c48e45402b6_7b7c4827.jpg',
      title: 'Genggaman Janji Suci',
      caption: 'Berpegangan tangan meneguhkan niat melangkah bersama menuju mahligai pernikahan.',
      category: 'Detail',
      aspect: 'portrait',
    },
    {
      id: 'gal-6',
      src: '/assets/aistudio/dbea5894-b3c4-47cf-a8ae-311352537e7d_faa8b159.jpg',
      title: 'Restu & Kasih Abadi',
      caption: 'Kebersamaan yang tulus di bawah naungan gunungan lambang keseimbangan hidup.',
      category: 'Detail',
      aspect: 'portrait',
    },
  ],
  bankAccounts: [],
};

const DEFAULT_SERVER_RSVPS: RsvpRecord[] = [
  {
    id: 'rsvp-1',
    nama: 'Keluarga Besar Pakembaran',
    hubungan: 'Keluarga Mempelai Wanita',
    kehadiran: 'Hadir',
    jumlahTamu: 3,
    ucapan:
      'Semoga akad nikah dan resepsi Bismi & Rendi berjalan lancar serta menjadi keluarga yang sakinah, mawaddah, warahmah.',
    createdAt: '2026-11-20T09:15:00+07:00',
  },
  {
    id: 'rsvp-2',
    nama: 'Rekan Alumni Teknik Komputer',
    hubungan: 'Sahabat Kuliah',
    kehadiran: 'Hadir',
    jumlahTamu: 2,
    ucapan:
      'Selamat menempuh hidup baru Bismi & Rendi! InsyaAllah hadir meramaikan acara di Pakembaran, Slawi.',
    createdAt: '2026-11-22T14:40:00+07:00',
  },
  {
    id: 'rsvp-3',
    nama: 'Keluarga Selapura',
    hubungan: 'Kerabat Mempelai Pria',
    kehadiran: 'Hadir',
    jumlahTamu: 2,
    ucapan:
      'Barakallahu lakuma wa baraka ‘alaikuma. Doa terbaik selalu menyertai Rendi dan Bismi.',
    createdAt: '2026-11-23T19:05:00+07:00',
  },
];

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_SERVER_CONFIG, null, 2), 'utf-8');
  }
  if (!fs.existsSync(RSVP_FILE)) {
    fs.writeFileSync(RSVP_FILE, JSON.stringify(DEFAULT_SERVER_RSVPS, null, 2), 'utf-8');
  }
}

function readConfig() {
  ensureStorage();
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_SERVER_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SERVER_CONFIG;
  }
}

function writeConfig(nextConfig: Record<string, unknown>) {
  ensureStorage();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(nextConfig, null, 2), 'utf-8');
}

function readRsvps(): RsvpRecord[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(RSVP_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SERVER_RSVPS;
  } catch {
    return DEFAULT_SERVER_RSVPS;
  }
}

function writeRsvps(entries: RsvpRecord[]) {
  ensureStorage();
  fs.writeFileSync(RSVP_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  const sanitized = str.replace(/"/g, '""');
  return `"${sanitized}"`;
}

async function startServer() {
  ensureStorage();
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/config', (_req, res) => {
    res.json(readConfig());
  });

  app.put('/api/config', (req, res) => {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      res.status(400).json({ error: 'Konfigurasi tidak valid.' });
      return;
    }
    const current = readConfig();
    const merged = {
      ...current,
      ...incoming,
      bride: { ...current.bride, ...(incoming.bride || {}) },
      groom: { ...current.groom, ...(incoming.groom || {}) },
      akad: { ...current.akad, ...(incoming.akad || {}) },
      resepsi: { ...current.resepsi, ...(incoming.resepsi || {}) },
    };
    writeConfig(merged);
    res.json(merged);
  });

  app.get('/api/rsvp', (_req, res) => {
    const entries = readRsvps().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const hadirEntries = entries.filter((e) => e.kehadiran === 'Hadir');
    const summary = {
      totalEntries: entries.length,
      hadirCount: hadirEntries.length,
      berhalanganCount: entries.filter((e) => e.kehadiran === 'Berhalangan').length,
      totalGuests: hadirEntries.reduce((acc, item) => acc + (Number(item.jumlahTamu) || 1), 0),
    };
    res.json({ entries, summary });
  });

  app.post('/api/rsvp', async (req, res) => {
    const { nama, hubungan, kehadiran, jumlahTamu, ucapan } = req.body || {};
    const cleanNama = typeof nama === 'string' ? nama.trim().slice(0, 120) : '';
    const cleanHubungan = typeof hubungan === 'string' ? hubungan.trim().slice(0, 100) : 'Tamu Undangan';
    const cleanUcapan = typeof ucapan === 'string' ? ucapan.trim().slice(0, 600) : '';
    const cleanKehadiran: 'Hadir' | 'Berhalangan' =
      kehadiran === 'Berhalangan' ? 'Berhalangan' : 'Hadir';
    const cleanJumlah =
      cleanKehadiran === 'Berhalangan'
        ? 0
        : Math.min(10, Math.max(1, Number.parseInt(String(jumlahTamu || 1), 10) || 1));

    if (!cleanNama || !cleanUcapan) {
      res.status(400).json({ error: 'Mohon isi nama lengkap dan ucapan doa Anda.' });
      return;
    }

    const record: RsvpRecord = {
      id: `rsvp-${Date.now()}`,
      nama: cleanNama,
      hubungan: cleanHubungan || 'Tamu Undangan',
      kehadiran: cleanKehadiran,
      jumlahTamu: cleanJumlah,
      ucapan: cleanUcapan,
      createdAt: new Date().toISOString(),
      syncedToSheet: false,
    };

    const config = readConfig();
    const webhookUrl =
      typeof config.googleSheetWebhookUrl === 'string' ? config.googleSheetWebhookUrl.trim() : '';

    if (webhookUrl && /^https:\/\/script\.google\.com\//i.test(webhookUrl)) {
      try {
        const sheetRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
        if (sheetRes.ok) {
          record.syncedToSheet = true;
        }
      } catch (err) {
        console.warn('Google Sheets webhook forwarding warning:', err);
      }
    }

    const entries = readRsvps();
    entries.unshift(record);
    writeRsvps(entries);

    res.status(201).json({ entry: record });
  });

  app.get('/api/rsvp/csv', (_req, res) => {
    const entries = readRsvps().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const header = ['Waktu', 'Nama Tamu', 'Relasi', 'Kehadiran', 'Jumlah Tamu', 'Ucapan & Doa'];
    const rows = entries.map((item) => [
      escapeCsvCell(new Date(item.createdAt).toLocaleString('id-ID')),
      escapeCsvCell(item.nama),
      escapeCsvCell(item.hubungan),
      escapeCsvCell(item.kehadiran),
      escapeCsvCell(item.jumlahTamu),
      escapeCsvCell(item.ucapan),
    ]);
    const csvContent = '\uFEFF' + [header.map(escapeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="rsvp-java-heritage.csv"');
    res.send(csvContent);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Java Heritage invitation server running on http://localhost:${PORT}`);
  });
}

startServer();
