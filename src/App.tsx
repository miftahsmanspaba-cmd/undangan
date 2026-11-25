/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { MotionConfig, motion, useScroll, useSpring } from 'motion/react';
import { CalendarHeart, Instagram, MapPin } from 'lucide-react';
import { CountdownSection } from './components/CountdownSection';
import { CoverEnvelope } from './components/CoverEnvelope';
import { GallerySection } from './components/GallerySection';
import {
  BatikKawungPattern,
  CoupleMonogramCrest,
  GununganMotif,
  KawungDivider,
  UkiranCorner,
} from './components/JavaneseOrnaments';
import { NavigationBar } from './components/NavigationBar';
import { PublishStudioModal } from './components/PublishStudioModal';
import { RsvpSection } from './components/RsvpSection';
import { VenueMapSection } from './components/VenueMapSection';
import { DEFAULT_WEDDING_CONFIG, INITIAL_RSVPS, resolveBundledConfigImages } from './data/defaultWedding';
import type { AttendanceStatus, RsvpEntry, RsvpSummary, WeddingConfig } from './types/wedding';
import { weddingAudio } from './utils/audioEngine';

function getGuestFromQuery(): string {
  if (typeof window === 'undefined') return 'Tamu Undangan';
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('to');
  return raw && raw.trim() ? raw.trim() : 'Tamu Undangan';
}

function computeSummary(entries: RsvpEntry[]): RsvpSummary {
  const hadir = entries.filter((e) => e.kehadiran === 'Hadir');
  return {
    totalEntries: entries.length,
    hadirCount: hadir.length,
    berhalanganCount: entries.filter((e) => e.kehadiran === 'Berhalangan').length,
    totalGuests: hadir.reduce((sum, item) => sum + (Number(item.jumlahTamu) || 1), 0),
  };
}

export default function App() {
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_WEDDING_CONFIG);
  const [rsvps, setRsvps] = useState<RsvpEntry[]>(INITIAL_RSVPS);
  const [summary, setSummary] = useState<RsvpSummary>(() => computeSummary(INITIAL_RSVPS));
  const [guestName, setGuestName] = useState<string>(getGuestFromQuery);
  const [isOpened, setIsOpened] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('studio')
  );
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  const loadBackendData = useCallback(async () => {
    try {
      const [cfgRes, rsvpRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/rsvp'),
      ]);
      if (cfgRes.ok) {
        const cfgData = resolveBundledConfigImages((await cfgRes.json()) as WeddingConfig);
        setConfig(cfgData);
        weddingAudio.setCustomUrl(cfgData.audioUrl || '');
      }
      if (rsvpRes.ok) {
        const rsvpData = (await rsvpRes.json()) as {
          entries: RsvpEntry[];
          summary: RsvpSummary;
        };
        if (Array.isArray(rsvpData.entries)) {
          setRsvps(rsvpData.entries);
          setSummary(rsvpData.summary || computeSummary(rsvpData.entries));
        }
      }
    } catch {
      // Keep default state gracefully if offline
    }
  }, []);

  useEffect(() => {
    void loadBackendData();
  }, [loadBackendData]);

  useEffect(() => {
    document.title = `${config.coupleTitle} — Undangan Pernikahan Digital Java Heritage`;
  }, [config.coupleTitle]);

  useEffect(() => {
    if (!isOpened) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpened]);

  const handleOpenInvitation = async () => {
    setIsOpened(true);
    weddingAudio.setCustomUrl(config.audioUrl || '');
    const started = await weddingAudio.play();
    setIsPlayingMusic(started);
  };

  const handleToggleMusic = async () => {
    const playing = await weddingAudio.toggle();
    setIsPlayingMusic(playing);
  };

  const handleSubmitRsvp = async (payload: {
    nama: string;
    hubungan: string;
    kehadiran: AttendanceStatus;
    jumlahTamu: number;
    ucapan: string;
  }) => {
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data?.error || 'Gagal mengirim konfirmasi.' };
      }
      const nextEntries = [data.entry as RsvpEntry, ...rsvps];
      setRsvps(nextEntries);
      setSummary(computeSummary(nextEntries));
      return { ok: true, syncedToSheet: Boolean(data.entry?.syncedToSheet) };
    } catch {
      return { ok: false, error: 'Koneksi bermasalah. Silakan coba kembali.' };
    }
  };

  const handleSaveConfig = async (nextConfig: WeddingConfig): Promise<boolean> => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      });
      if (!res.ok) return false;
      const saved = resolveBundledConfigImages((await res.json()) as WeddingConfig);
      setConfig(saved);
      weddingAudio.setCustomUrl(saved.audioUrl || '');
      return true;
    } catch {
      return false;
    }
  };

  const groomInitial = config.groom.shortName.trim().charAt(0).toUpperCase() || 'B';
  const brideInitial = config.bride.shortName.trim().charAt(0).toUpperCase() || 'S';

  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className="min-h-screen bg-[#FAF6EE] pb-16 text-[#24160F] md:pb-0">
        {/* Cover Envelope Curtain */}
        <CoverEnvelope
          config={config}
          guestName={guestName}
          isOpen={isOpened}
          onOpenInvitation={handleOpenInvitation}
        />

        {/* Sticky Top Bar (Desktop) & Bottom Thumb Nav (Mobile) + Music Toggle */}
        <NavigationBar
          coupleTitle={config.coupleTitle}
          isOpened={isOpened}
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={handleToggleMusic}
        />

        {/* Gold Scroll Progress Bar */}
        {isOpened && (
          <motion.div
            aria-hidden="true"
            style={{ scaleX: smoothProgress }}
            className="fixed top-0 right-0 left-0 z-40 h-[3px] origin-left bg-gradient-to-r from-[#B8862D] via-[#DFB963] to-[#B8862D]"
          />
        )}

        {/* Main Content */}
        <main>
          {/* Hero Editorial Split with Keraton Arch Frame & Kawung Motif */}
          <section className="relative overflow-hidden px-5 py-12 sm:py-20">
            <BatikKawungPattern id="hero-kawung" className="text-[#B8862D] opacity-[0.04]" />

            <div className="relative z-10 mx-auto max-w-6xl">
              <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-14">
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.18 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col justify-center lg:col-span-6"
                >
                  <div className="mb-5 flex items-center gap-4 text-[#B8862D]">
                    <GununganMotif className="h-12 w-9" />
                    <CoupleMonogramCrest
                      groomInitial={groomInitial}
                      brideInitial={brideInitial}
                      className="h-12 w-12"
                    />
                  </div>

                  <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#8A5E14]">
                    Undangan Pernikahan · {config.resepsi.dateLabel}
                  </p>

                  <h1 className="mt-3 font-serif text-5xl font-semibold tracking-tight text-[#24160F] sm:text-6xl lg:text-7xl">
                    {config.coupleTitle}
                  </h1>

                  <p className="mt-6 max-w-xl font-serif text-xl italic leading-relaxed text-[#4A362A] sm:text-2xl">
                    “{config.greetingQuote}”
                  </p>
                  <p className="mt-2 text-xs font-semibold tracking-wider uppercase text-[#8A5E14]">
                    {config.greetingSource}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a
                      href="#rsvp"
                      className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#24160F] px-7 py-3 text-sm font-semibold text-[#FAF6EE] transition-colors hover:bg-[#3A2419] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862D]"
                    >
                      Konfirmasi Kehadiran
                    </a>
                    <a
                      href="#lokasi"
                      className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#B8862D]/45 bg-white px-6 py-3 text-sm font-semibold text-[#24160F] transition-colors hover:bg-[#F2EAD9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862D]"
                    >
                      Lihat Lokasi Acara
                    </a>
                  </div>
                </motion.div>

                {/* Signature Keraton Archway Frame */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 24 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.18 }}
                  transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-6"
                >
                  <div className="keraton-arch relative h-full min-h-[400px] border border-[#B8862D]/40 bg-white p-2.5 shadow-xl lg:min-h-[580px]">
                    <div className="keraton-arch relative h-full w-full overflow-hidden bg-[#24160F]">
                      <img
                        src={config.coverPhoto}
                        alt={config.coupleTitle}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-top"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1D110B]/60 via-transparent to-transparent" />
                      <UkiranCorner className="pointer-events-none absolute right-4 bottom-4 h-9 w-9 rotate-180 text-[#DFB963]/85" />
                      <UkiranCorner className="pointer-events-none absolute bottom-4 left-4 h-9 w-9 -rotate-90 text-[#DFB963]/85" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Elevated Java Heritage Schedule & Venue Showcase Bar */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="mt-12 rounded-3xl border border-[#B8862D]/35 bg-white/90 p-2 shadow-sm backdrop-blur-sm"
              >
                <div className="grid grid-cols-1 divide-y divide-[#B8862D]/20 rounded-[20px] border border-[#B8862D]/20 md:grid-cols-3 md:divide-x md:divide-y-0">
                  <div className="flex flex-col items-center px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] uppercase text-[#8A5E14]">
                      <CalendarHeart className="h-3.5 w-3.5 text-[#B8862D]" />
                      <span>{config.akad.title}</span>
                    </div>
                    <p className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[#24160F] sm:text-[26px]">
                      {config.akad.dateLabel}
                    </p>
                    <p className="mt-1 font-serif text-base italic text-[#6E594C] tabular-nums">
                      Pukul {config.akad.timeLabel}
                    </p>
                  </div>

                  <div className="flex flex-col items-center px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] uppercase text-[#8A5E14]">
                      <CalendarHeart className="h-3.5 w-3.5 text-[#B8862D]" />
                      <span>{config.resepsi.title}</span>
                    </div>
                    <p className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[#24160F] sm:text-[26px]">
                      {config.resepsi.dateLabel}
                    </p>
                    <p className="mt-1 font-serif text-base italic text-[#6E594C] tabular-nums">
                      Pukul {config.resepsi.timeLabel}
                    </p>
                  </div>

                  <div className="flex flex-col items-center px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] uppercase text-[#8A5E14]">
                      <MapPin className="h-3.5 w-3.5 text-[#B8862D]" />
                      <span>Lokasi Acara</span>
                    </div>
                    <p className="mt-2 font-serif text-2xl font-semibold tracking-tight text-[#24160F] sm:text-[26px]">
                      {config.venueName}
                    </p>
                    <p className="mt-1 font-serif text-base italic text-[#6E594C]">
                      {config.resepsi.venue}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Countdown Timer Section */}
          <CountdownSection config={config} />

          {/* Mempelai (Bride & Groom) with Keraton Arch Portraits */}
          <section id="mempelai" className="relative bg-[#FAF6EE] px-5 py-16 sm:py-24">
            <div className="mx-auto max-w-5xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8A5E14]">
                  {config.greetingTitle}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-[#24160F] sm:text-5xl">
                  Mempelai Berbahagia
                </h2>
                <div className="mx-auto mt-4 flex justify-center text-[#B8862D]">
                  <KawungDivider className="h-6 w-52" />
                </div>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#574439] sm:text-base">
                  Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan anak kami:
                </p>
              </motion.div>

              <div className="relative mt-12 grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 md:gap-12">
                {/* Connecting '&' Monogram on Desktop */}
                <motion.div
                  aria-hidden="true"
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute top-1/2 left-1/2 z-10 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#B8862D]/40 bg-[#FAF6EE] font-serif text-3xl italic text-[#B8862D] shadow-sm md:flex"
                >
                  &amp;
                </motion.div>

                {/* Mempelai Wanita */}
                <motion.article
                  initial={{ opacity: 0, y: 26, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.18 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-3xl border border-[#B8862D]/30 bg-white p-2.5 shadow-sm"
                >
                  <div className="flex h-full flex-col items-center rounded-[20px] border border-[#B8862D]/15 px-6 py-8">
                    <div className="keraton-arch h-56 w-44 overflow-hidden border border-[#B8862D]/50 bg-[#24160F] p-1.5">
                      <img
                        src={config.bride.photo}
                        alt={config.bride.fullName}
                        referrerPolicy="no-referrer"
                        className="keraton-arch h-full w-full object-cover object-top"
                      />
                    </div>
                    <p className="mt-6 text-xs font-semibold tracking-[0.2em] uppercase text-[#8A5E14]">
                      Mempelai Wanita
                    </p>
                    <h3 className="mt-2 font-serif text-3xl font-semibold text-[#24160F]">
                      {config.bride.fullName}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#574439]">
                      <span className="block text-xs text-[#7D6658]">
                        {config.bride.childOrder}
                      </span>
                      {config.bride.parents}
                    </p>
                    {config.bride.instagram && (
                      <a
                        href={`https://instagram.com/${config.bride.instagram.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-[#8A5E14] hover:underline"
                      >
                        <Instagram className="h-3.5 w-3.5" />
                        <span>{config.bride.instagram}</span>
                      </a>
                    )}
                  </div>
                </motion.article>

                {/* Mempelai Pria */}
                <motion.article
                  initial={{ opacity: 0, y: 26, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.18 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-3xl border border-[#B8862D]/30 bg-white p-2.5 shadow-sm"
                >
                  <div className="flex h-full flex-col items-center rounded-[20px] border border-[#B8862D]/15 px-6 py-8">
                    <div className="keraton-arch h-56 w-44 overflow-hidden border border-[#B8862D]/50 bg-[#24160F] p-1.5">
                      <img
                        src={config.groom.photo}
                        alt={config.groom.fullName}
                        referrerPolicy="no-referrer"
                        className="keraton-arch h-full w-full object-cover object-top"
                      />
                    </div>
                    <p className="mt-6 text-xs font-semibold tracking-[0.2em] uppercase text-[#8A5E14]">
                      Mempelai Pria
                    </p>
                    <h3 className="mt-2 font-serif text-3xl font-semibold text-[#24160F]">
                      {config.groom.fullName}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#574439]">
                      <span className="block text-xs text-[#7D6658]">
                        {config.groom.childOrder}
                      </span>
                      {config.groom.parents}
                    </p>
                    {config.groom.instagram && (
                      <a
                        href={`https://instagram.com/${config.groom.instagram.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-[#8A5E14] hover:underline"
                      >
                        <Instagram className="h-3.5 w-3.5" />
                        <span>{config.groom.instagram}</span>
                      </a>
                    )}
                  </div>
                </motion.article>
              </div>
            </div>
          </section>

          {/* Acara & Google Maps */}
          <VenueMapSection config={config} />

          {/* Interactive Responsive Photo Gallery */}
          <GallerySection photos={config.gallery} />

          {/* Integrated RSVP & Wishes */}
          <RsvpSection
            defaultGuestName={guestName}
            entries={rsvps}
            summary={summary}
            hasGoogleSheetSync={Boolean(config.googleSheetWebhookUrl)}
            onSubmitRsvp={handleSubmitRsvp}
          />
        </main>

        {/* Footer */}
        <footer className="relative overflow-hidden bg-[#24160F] px-5 py-16 text-center text-[#FAF6EE]">
          <BatikKawungPattern id="footer-kawung" className="text-[#DFB963] opacity-[0.045]" />
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mx-auto max-w-3xl"
          >
            <div className="mx-auto mb-4 flex items-center justify-center gap-3 text-[#DFB963]">
              <GununganMotif className="h-11 w-8" />
            </div>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#DFB963]">
              Matur Nuwun
            </p>
            <h2 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
              {config.coupleTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-[#FAF6EE]/75 sm:text-sm">
              Kami yang berbahagia: Kel. {config.bride.parents} &amp; Kel. {config.groom.parents}. Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami haturkan terima kasih.
            </p>
          </motion.div>
        </footer>

        {/* Creator & Publish Studio Modal */}
        <PublishStudioModal
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          config={config}
          rsvps={rsvps}
          summary={summary}
          onSaveConfig={handleSaveConfig}
          onPreviewGuest={(name) => {
            setGuestName(name);
            setIsOpened(false);
          }}
        />
      </div>
    </MotionConfig>
  );
}
