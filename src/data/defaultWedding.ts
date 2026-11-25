import type { RsvpEntry, WeddingConfig } from '../types/wedding';

export const DEFAULT_WEDDING_CONFIG: WeddingConfig = {
  coupleTitle: 'Bagus & Sekar',
  greetingTitle: 'Assalamu’alaikum Warahmatullahi Wabarakatuh',
  greetingQuote:
    'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.',
  greetingSource: 'QS. Ar-Rum : 21',
  bride: {
    shortName: 'Sekar',
    fullName: 'Raden Ajeng Sekar Arum Ningrum, S.Ars.',
    parents: 'Bapak K.R.T. Hadiwijaya & Ibu R.Ay. Kusuma Wardhani',
    childOrder: 'Putri Bungsu dari',
    instagram: '@sekararum.id',
    photo: '/src/assets/images/java_bride_portrait_1795573727099.jpg',
  },
  groom: {
    shortName: 'Bagus',
    fullName: 'Raden Mas Bagus Pradipta Wijaya, S.T.',
    parents: 'Bapak Ir. H. Suryo Atmojo & Ibu Hj. Ratna Dewi Lestari',
    childOrder: 'Putra Pertama dari',
    instagram: '@baguspradipta',
    photo: '/src/assets/images/java_groom_portrait_1795573727185.jpg',
  },
  coverPhoto: '/src/assets/images/java_hero_couple_1795573727320.jpg',
  targetDateIso: '2026-12-19T08:00:00+07:00',
  akad: {
    title: 'Akad Nikah',
    dateLabel: 'Sabtu, 19 Desember 2026',
    timeLabel: '08.00 – 10.00 WIB',
    venue: 'Pendopo Ageng Royal Heritage',
    address: 'Jl. Rotowijayan No. 18, Kraton, Kota Yogyakarta 55132',
    note: 'Prosesi ijab kabul berlangsung khidmat bersama keluarga inti.',
  },
  resepsi: {
    title: 'Resepsi Pawiwahan',
    dateLabel: 'Sabtu, 19 Desember 2026',
    timeLabel: '11.00 – 14.30 WIB',
    venue: 'Pendopo Ageng Royal Heritage',
    address: 'Jl. Rotowijayan No. 18, Kraton, Kota Yogyakarta 55132',
    note: 'Busana adat Jawa, batik, atau formal bernuansa sogan & gading.',
  },
  venueName: 'Pendopo Ageng Royal Heritage Yogyakarta',
  venueAddress: 'Jl. Rotowijayan No. 18, Panembahan, Kecamatan Kraton, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55132',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kraton+Yogyakarta+Jl+Rotowijayan+Yogyakarta',
  googleMapsEmbedQuery: 'Kraton Yogyakarta Jl Rotowijayan Yogyakarta',
  audioUrl: '',
  audioTitle: 'Ladrang Asmarandana — Instrumen Jawa Klasik',
  googleSheetWebhookUrl: '',
  loveStory: [
    {
      id: 'story-1',
      year: '2022',
      title: 'Pertemuan Pertama di Yogyakarta',
      description:
        'Berawal dari kolaborasi pelestarian arsitektur cagar budaya di kawasan Kotagede, percakapan sederhana tentang ukiran kayu jati tumbuh menjadi rasa saling memahami.',
    },
    {
      id: 'story-2',
      year: '2024',
      title: 'Menyatukan Langkah & Restu Keluarga',
      description:
        'Dua tahun berjalan beriringan, kami memperkenalkan dua keluarga besar dalam suasana hangat penuh tata krama Jawa dan doa restu orang tua.',
    },
    {
      id: 'story-3',
      year: '2026',
      title: 'Lamaran & Menuju Pelaminan',
      description:
        'Dengan niat tulus membangun rumah tangga yang sakinah, mawaddah, warahmah, kami mengikat janji suci untuk melangkah bersama selamanya.',
    },
  ],
  gallery: [
    {
      id: 'gal-1',
      src: '/src/assets/images/java_hero_couple_1795573727320.jpg',
      title: 'Cahaya di Pendopo Soko Guru',
      caption: 'Potret klasik dalam balutan bludru hitam sulam emas di antara tiang jati keraton.',
      category: 'Pendopo',
      aspect: 'portrait',
    },
    {
      id: 'gal-2',
      src: '/src/assets/images/java_gallery_pendopo_1795573728399.jpg',
      title: 'Senja di Pelataran Keraton',
      caption: 'Melangkah beriringan menyusuri pelataran batu di bawah hangatnya cahaya senja.',
      category: 'Pendopo',
      aspect: 'landscape',
    },
    {
      id: 'gal-3',
      src: '/src/assets/images/java_bride_portrait_1795573727099.jpg',
      title: 'Anggun Ronce Melati',
      caption: 'Kebaya kutubaru bludru dengan untaian melati segar dan cunduk mentul Jawa.',
      category: 'Busana',
      aspect: 'square',
    },
    {
      id: 'gal-4',
      src: '/src/assets/images/java_groom_portrait_1795573727185.jpg',
      title: 'Wibawa Beskap Sogan',
      caption: 'Beskap hitam berpadu kain batik parang serta keris pusaka keluarga.',
      category: 'Busana',
      aspect: 'square',
    },
    {
      id: 'gal-5',
      src: '/src/assets/images/java_gallery_rings_1795573728331.jpg',
      title: 'Janji Suci & Parang Kusumo',
      caption: 'Cincin ikatan suci berpadu keharuman melati di atas lembaran batik tulis sogan.',
      category: 'Detail',
      aspect: 'landscape',
    },
  ],
  bankAccounts: [
    {
      id: 'bank-1',
      bank: 'Bank Central Asia (BCA)',
      accountNumber: '0378 2910 44',
      accountHolder: 'a.n. Bagus Pradipta Wijaya',
    },
    {
      id: 'bank-2',
      bank: 'Bank Mandiri',
      accountNumber: '137 0019 8842 1',
      accountHolder: 'a.n. Sekar Arum Ningrum',
    },
  ],
};

export const INITIAL_RSVPS: RsvpEntry[] = [
  {
    id: 'rsvp-1',
    nama: 'K.P.H. Prawirodiningrat & Keluarga',
    hubungan: 'Keluarga Besar Keraton',
    kehadiran: 'Hadir',
    jumlahTamu: 2,
    ucapan: 'Sugeng manghayubagyo Mas Bagus dan Mbak Sekar. Mugia dados keluarga ingkang sakinah, mawaddah, warahmah dumugi kaken-kaken ninen-ninen.',
    createdAt: '2026-11-20T09:15:00+07:00',
  },
  {
    id: 'rsvp-2',
    nama: 'dr. Aditya Mahendra',
    hubungan: 'Sahabat Kuliah UGM',
    kehadiran: 'Hadir',
    jumlahTamu: 2,
    ucapan: 'Selamat menempuh hidup baru Bagus & Sekar! Semoga lancar seluruh rangkaian prosesi adat dan akad nikahnya di Yogyakarta.',
    createdAt: '2026-11-22T14:40:00+07:00',
  },
  {
    id: 'rsvp-3',
    nama: 'Nadia Larasati, M.Arch.',
    hubungan: 'Rekan Studio Arsitektur',
    kehadiran: 'Berhalangan',
    jumlahTamu: 1,
    ucapan: 'Mohon maaf belum bisa hadir langsung karena tugas di luar kota, namun doa terbaik selalu menyertai Sekar dan Mas Bagus.',
    createdAt: '2026-11-23T19:05:00+07:00',
  },
];
