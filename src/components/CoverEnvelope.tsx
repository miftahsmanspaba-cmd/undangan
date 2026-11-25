import React from 'react';
import { motion } from 'motion/react';
import { MailOpen, Settings2 } from 'lucide-react';
import type { WeddingConfig } from '../types/wedding';
import { BatikKawungPattern, CoupleMonogramCrest, GununganMotif, UkiranCorner } from './JavaneseOrnaments';

interface CoverEnvelopeProps {
  config: WeddingConfig;
  guestName: string;
  isOpen: boolean;
  onOpenInvitation: () => void;
  onOpenStudio: () => void;
}

export const CoverEnvelope: React.FC<CoverEnvelopeProps> = ({
  config,
  guestName,
  isOpen,
  onOpenInvitation,
  onOpenStudio,
}) => {
  const groomInitial = config.groom.shortName.trim().charAt(0).toUpperCase() || 'B';
  const brideInitial = config.bride.shortName.trim().charAt(0).toUpperCase() || 'S';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#180E09] text-[#FAF6EE] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
      aria-hidden={isOpen}
    >
      {/* Background Cover Photo with Measured Contrast Scrim */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={config.coverPhoto}
          alt={config.coupleTitle}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#160C07]/85 via-[#24160F]/72 to-[#120905]/95" />
        <BatikKawungPattern id="cover-kawung" className="text-[#DFB963] opacity-[0.06]" />
      </div>

      {/* Discreet Creator / Publish Action */}
      <button
        type="button"
        onClick={onOpenStudio}
        className="absolute top-4 right-4 z-20 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#DFB963]/35 bg-[#24160F]/80 px-4 py-2.5 text-xs font-medium text-[#FAF6EE] backdrop-blur-md transition-colors hover:bg-[#311F15] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DFB963]"
      >
        <Settings2 className="h-3.5 w-3.5 text-[#DFB963]" />
        <span className="whitespace-nowrap">Kelola &amp; Publish HTML</span>
      </button>

      {/* Main Envelope Card with Keraton Double Hairline Inset */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-4 w-full max-w-lg rounded-3xl border border-[#DFB963]/40 bg-[#24160F]/82 p-2.5 shadow-2xl backdrop-blur-md"
      >
        <div className="relative rounded-[20px] border border-[#DFB963]/20 px-6 py-8 text-center sm:px-10 sm:py-11">
          <UkiranCorner className="absolute top-2.5 left-2.5 h-8 w-8 text-[#DFB963]/70" />
          <UkiranCorner className="absolute top-2.5 right-2.5 h-8 w-8 rotate-90 text-[#DFB963]/70" />
          <UkiranCorner className="absolute bottom-2.5 left-2.5 h-8 w-8 -rotate-90 text-[#DFB963]/70" />
          <UkiranCorner className="absolute right-2.5 bottom-2.5 h-8 w-8 rotate-180 text-[#DFB963]/70" />

          <div className="mx-auto mb-3 flex items-center justify-center gap-4 text-[#DFB963]">
            <GununganMotif className="h-12 w-9 opacity-85" />
            <CoupleMonogramCrest
              groomInitial={groomInitial}
              brideInitial={brideInitial}
              className="h-14 w-14"
            />
          </div>

          <p className="text-xs font-medium tracking-[0.24em] uppercase text-[#DFB963]">
            Pawiwahan Ageng · The Wedding Of
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#FAF6EE] sm:text-6xl">
            {config.coupleTitle}
          </h1>

          <p className="mt-2 text-xs text-[#FAF6EE]/80 sm:text-sm">
            {config.akad.dateLabel} · {config.venueName}
          </p>

          <div className="my-6 border-y border-[#DFB963]/25 py-5">
            <p className="text-xs text-[#FAF6EE]/75">
              Kepada Yth. Bapak/Ibu/Saudara/i
            </p>
            <p className="mt-1.5 font-serif text-2xl font-semibold text-[#DFB963] sm:text-3xl">
              {guestName}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#FAF6EE]/65">
              Tanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri hari bahagia kami.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenInvitation}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-full bg-[#B8862D] px-8 py-3 text-sm font-semibold text-[#FAF6EE] shadow-lg transition-all duration-200 hover:bg-[#9E7022] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DFB963] sm:w-auto"
          >
            <MailOpen className="h-4 w-4" />
            <span className="whitespace-nowrap">Buka Undangan</span>
          </button>

          <p className="mt-4 text-[11px] text-[#FAF6EE]/60">
            Musik instrumen Jawa akan diputar otomatis saat undangan dibuka
          </p>
        </div>
      </motion.div>
    </div>
  );
};
