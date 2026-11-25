import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Check, Clock, Copy, MapPin, Navigation } from 'lucide-react';
import type { WeddingConfig } from '../types/wedding';
import { KawungDivider, UkiranCorner } from './JavaneseOrnaments';

interface VenueMapSectionProps {
  config: WeddingConfig;
}

export const VenueMapSection: React.FC<VenueMapSectionProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${config.venueName}, ${config.venueAddress}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const embedQuery = encodeURIComponent(config.googleMapsEmbedQuery || config.venueName);
  const events = [config.akad, config.resepsi];

  return (
    <section id="acara" className="bg-[#F2EAD9] px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8A5E14]">
            Rangkaian Acara
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-[#24160F] sm:text-5xl">
            Waktu &amp; Tempat
          </h2>
          <div className="mx-auto mt-4 flex justify-center text-[#B8862D]">
            <KawungDivider className="h-6 w-52" />
          </div>
        </div>

        {/* Two-Column Keraton Framed Event Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {events.map((ev, idx) => (
            <motion.div
              key={ev.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-[#B8862D]/30 bg-white p-2.5 shadow-sm"
            >
              <div className="relative flex h-full flex-col justify-between rounded-[20px] border border-[#B8862D]/20 px-6 py-8 text-center sm:px-8">
                <UkiranCorner className="absolute top-2.5 left-2.5 h-6 w-6 text-[#B8862D]/55" />
                <UkiranCorner className="absolute top-2.5 right-2.5 h-6 w-6 rotate-90 text-[#B8862D]/55" />

                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8A5E14]">
                    {ev.title}
                  </p>
                  <h3 className="mt-2 font-serif text-3xl font-semibold text-[#24160F]">
                    {ev.dateLabel}
                  </h3>

                  <div className="mt-5 space-y-3 text-sm text-[#574439]">
                    <p className="inline-flex items-center justify-center gap-2 font-semibold text-[#24160F]">
                      <Clock className="h-4 w-4 text-[#B8862D]" />
                      <span className="tabular-nums">{ev.timeLabel}</span>
                    </p>
                    <p className="flex items-start justify-center gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B8862D]" />
                      <span>
                        <strong className="block text-[#24160F]">{ev.venue}</strong>
                        {ev.address}
                      </span>
                    </p>
                  </div>
                </div>

                {ev.note && (
                  <p className="mt-6 border-t border-[#B8862D]/15 pt-4 text-xs leading-relaxed text-[#6E594C]">
                    {ev.note}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Google Maps Integration */}
        <motion.div
          id="lokasi"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 overflow-hidden rounded-3xl border border-[#B8862D]/30 bg-white shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8A5E14]">
                  Penunjuk Arah
                </p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-[#24160F] sm:text-3xl">
                  {config.venueName}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#574439]">
                  {config.venueAddress}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-[#6E594C]">
                  <Calendar className="h-4 w-4 text-[#B8862D]" />
                  <span>{config.akad.dateLabel} · Pukul 08.00 – 14.30 WIB</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row lg:flex-col">
                <a
                  href={config.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#24160F] px-5 py-2.5 text-sm font-semibold text-[#FAF6EE] transition-colors hover:bg-[#3A2419] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862D]"
                >
                  <Navigation className="h-4 w-4 text-[#DFB963]" />
                  <span className="whitespace-nowrap">Buka di Google Maps</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#B8862D]/35 bg-[#FAF6EE] px-5 py-2.5 text-sm font-semibold text-[#24160F] transition-colors hover:bg-[#F2EAD9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862D]"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-[#1E5631]" />
                      <span className="whitespace-nowrap">Alamat Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-[#8A5E14]" />
                      <span className="whitespace-nowrap">Salin Alamat</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="min-h-[300px] border-t border-[#B8862D]/20 bg-[#EAE0CC] lg:col-span-7 lg:border-t-0 lg:border-l">
              <iframe
                title={`Peta lokasi ${config.venueName}`}
                src={`https://maps.google.com/maps?q=${embedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="h-full min-h-[300px] w-full border-0 lg:min-h-[360px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
