import type { RsvpEntry, WeddingConfig } from '../types/wedding';

const PHOTO_COVER = '/assets/aistudio/2_189173bc.jpeg';
const PHOTO_BRIDE = '/assets/aistudio/1_b2ef2998.jpeg';
const PHOTO_GROOM = '/assets/aistudio/foto_mempelai_pria_f49441b6.jpg';
const PHOTO_GROOM_COUPLE = '/assets/aistudio/3_bde0a069.jpeg';
const PHOTO_STANDING = '/assets/aistudio/4_99cfcbd1.jpg';
const PHOTO_HANDS = '/assets/aistudio/17c6e6c9-7895-48f9-917e-2c48e45402b6_7b7c4827.jpg';
const PHOTO_SHOULDER = '/assets/aistudio/dbea5894-b3c4-47cf-a8ae-311352537e7d_faa8b159.jpg';

const LEGACY_IMAGE_MAP: Record<string, string> = {
  '/src/assets/images/java_hero_couple_1795573727320.jpg': PHOTO_COVER,
  '/src/assets/images/java_bride_portrait_1795573727099.jpg': PHOTO_BRIDE,
  '/src/assets/images/java_groom_portrait_1795573727185.jpg': PHOTO_GROOM,
  '/src/assets/images/java_gallery_pendopo_1795573728399.jpg': PHOTO_STANDING,
  '/src/assets/images/java_gallery_rings_1795573728331.jpg': PHOTO_HANDS,
};

export function resolveBundledConfigImages(cfg: WeddingConfig): WeddingConfig {
  const mapUrl = (u: string) => LEGACY_IMAGE_MAP[u] || u;
  return {
    ...cfg,
    coverPhoto: mapUrl(cfg.coverPhoto),
    bride: { ...cfg.bride, photo: mapUrl(cfg.bride.photo) },
    groom: { ...cfg.groom, photo: mapUrl(cfg.groom.photo) },
    gallery: cfg.gallery.map((g) => ({ ...g, src: mapUrl(g.src) })),
  };
}

export const DEFAULT_WEDDING_CONFIG: WeddingConfig = {
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
    photo: PHOTO_BRIDE,
  },
  groom: {
    shortName: 'Rendi',
    fullName: 'Rendi Candra Maulana, A.Md.Komp.',
    parents: 'Bapak Tobari & Ibu Sutriah (Selapura)',
    childOrder: 'Putra dari',
    instagram: '',
    photo: PHOTO_GROOM,
  },
  coverPhoto: PHOTO_COVER,
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
      src: PHOTO_COVER,
      title: 'Harmoni Gunungan Keraton',
      caption: 'Potret kebersamaan dalam balutan busana Jawa hitam sulam emas di hadapan ukiran gunungan.',
      category: 'Prewedding',
      aspect: 'portrait',
    },
    {
      id: 'gal-2',
      src: PHOTO_GROOM_COUPLE,
      title: 'Langkah Seiring Adat Jawa',
      caption: 'Bersanding serasi dalam busana adat Jawa klasik penuh kewibawaan dan kehangatan.',
      category: 'Prewedding',
      aspect: 'portrait',
    },
    {
      id: 'gal-3',
      src: PHOTO_BRIDE,
      title: 'Anggun Kebaya Bludru',
      caption: 'Kebaya bludru hitam bersulam benang emas dipadukan cunduk mentul Jawa.',
      category: 'Prewedding',
      aspect: 'portrait',
    },
    {
      id: 'gal-4',
      src: PHOTO_STANDING,
      title: 'Sanding Adat Sogan',
      caption: 'Potret penuh dalam balutan jarik parang klasik dan beskap Jawa.',
      category: 'Prewedding',
      aspect: 'portrait',
    },
    {
      id: 'gal-5',
      src: PHOTO_HANDS,
      title: 'Genggaman Janji Suci',
      caption: 'Berpegangan tangan meneguhkan niat melangkah bersama menuju mahligai pernikahan.',
      category: 'Detail',
      aspect: 'portrait',
    },
    {
      id: 'gal-6',
      src: PHOTO_SHOULDER,
      title: 'Restu & Kasih Abadi',
      caption: 'Kebersamaan yang tulus di bawah naungan gunungan lambang keseimbangan hidup.',
      category: 'Detail',
      aspect: 'portrait',
    },
  ],
  bankAccounts: [],
};

export const INITIAL_RSVPS: RsvpEntry[] = [
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
