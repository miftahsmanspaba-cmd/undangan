import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarPlus } from 'lucide-react';
import type { WeddingConfig } from '../types/wedding';
import { BatikKawungPattern, KawungDivider } from './JavaneseOrnaments';

interface CountdownSectionProps {
  config: WeddingConfig;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function computeRemaining(targetIso: string): TimeRemaining {
  const targetMs = new Date(targetIso).getTime();
  const nowMs = Date.now();
  const diff = Number.isNaN(targetMs) ? 0 : targetMs - nowMs;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

function formatGoogleCalendarUrl(config: WeddingConfig): string {
  const start = new Date(config.targetDateIso);
  const validStart = Number.isNaN(start.getTime()) ? new Date('2026-12-19T08:00:00+07:00') : start;
  const end = new Date(validStart.getTime() + 6 * 60 * 60 * 1000);
  const toGCalDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Pernikahan ${config.coupleTitle}`,
    dates: `${toGCalDate(validStart)}/${toGCalDate(end)}`,
    details: `Akad Nikah & Resepsi Pawiwahan ${config.coupleTitle}`,
    location: `${config.venueName}, ${config.venueAddress}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({ config }) => {
  const [remaining, setRemaining] = useState<TimeRemaining>(() =>
    computeRemaining(config.targetDateIso)
  );

  useEffect(() => {
    setRemaining(computeRemaining(config.targetDateIso));
    const timer = window.setInterval(() => {
      setRemaining(computeRemaining(config.targetDateIso));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [config.targetDateIso]);

  const blocks = [
    { label: 'Hari', value: remaining.days },
    { label: 'Jam', value: remaining.hours },
    { label: 'Menit', value: remaining.minutes },
    { label: 'Detik', value: remaining.seconds },
  ];

  return (
    <section className="relative overflow-hidden bg-[#24160F] px-5 py-16 text-[#FAF6EE] sm:py-24">
      <BatikKawungPattern id="countdown-kawung" className="text-[#DFB963] opacity-[0.05]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#DFB963]">
          Menuju Hari Bahagia
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-[#FAF6EE] sm:text-5xl">
          Hitung Mundur Akad Nikah
        </h2>

        <div className="mx-auto mt-4 flex justify-center text-[#DFB963]/75">
          <KawungDivider className="h-6 w-52" />
        </div>

        <div className="mx-auto mt-9 grid max-w-xl grid-cols-4 gap-3 sm:gap-5">
          {blocks.map((b) => (
            <div
              key={b.label}
              className="rounded-2xl border border-[#DFB963]/25 bg-[#311F15]/90 p-1.5 shadow-lg"
            >
              <div className="rounded-xl border border-[#DFB963]/15 px-2 py-4 sm:py-6">
                <div className="font-serif text-3xl font-semibold tabular-nums text-[#DFB963] sm:text-5xl">
                  {String(b.value).padStart(2, '0')}
                </div>
                <div className="mt-1.5 text-xs font-medium text-[#FAF6EE]/80 sm:text-sm">
                  {b.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {remaining.isPast && (
          <p className="mt-4 text-sm text-[#DFB963]">
            Hari bahagia telah tiba — terima kasih atas doa restu Anda.
          </p>
        )}

        <div className="mt-9">
          <a
            href={formatGoogleCalendarUrl(config)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#DFB963]/45 bg-[#311F15]/70 px-6 py-2.5 text-sm font-medium text-[#FAF6EE] transition-colors hover:bg-[#DFB963]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DFB963]"
          >
            <CalendarPlus className="h-4 w-4 text-[#DFB963]" />
            <span className="whitespace-nowrap">Simpan ke Google Calendar</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
};
