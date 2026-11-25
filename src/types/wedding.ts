export type AttendanceStatus = 'Hadir' | 'Berhalangan';

export interface GalleryPhoto {
  id: string;
  src: string;
  title: string;
  caption: string;
  category: 'Prewedding' | 'Detail' | 'Pendopo' | 'Busana';
  aspect: 'portrait' | 'landscape' | 'square';
}

export interface LoveStoryItem {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface BankAccount {
  id: string;
  bank: string;
  accountNumber: string;
  accountHolder: string;
}

export interface WeddingEvent {
  title: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  address: string;
  note?: string;
}

export interface WeddingConfig {
  coupleTitle: string;
  greetingTitle: string;
  greetingQuote: string;
  greetingSource: string;
  bride: {
    shortName: string;
    fullName: string;
    parents: string;
    childOrder: string;
    instagram: string;
    photo: string;
  };
  groom: {
    shortName: string;
    fullName: string;
    parents: string;
    childOrder: string;
    instagram: string;
    photo: string;
  };
  coverPhoto: string;
  targetDateIso: string;
  akad: WeddingEvent;
  resepsi: WeddingEvent;
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  googleMapsEmbedQuery: string;
  audioUrl: string;
  audioTitle: string;
  googleSheetWebhookUrl: string;
  loveStory: LoveStoryItem[];
  gallery: GalleryPhoto[];
  bankAccounts: BankAccount[];
}

export interface RsvpEntry {
  id: string;
  nama: string;
  hubungan: string;
  kehadiran: AttendanceStatus;
  jumlahTamu: number;
  ucapan: string;
  createdAt: string;
  syncedToSheet?: boolean;
}

export interface RsvpSummary {
  totalEntries: number;
  hadirCount: number;
  berhalanganCount: number;
  totalGuests: number;
}
