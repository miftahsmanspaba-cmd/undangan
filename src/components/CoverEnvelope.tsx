import React from 'react';
import { motion } from 'motion/react';
import { MailOpen } from 'lucide-react';
import type { WeddingConfig } from '../types/wedding';
import { BatikKawungPattern, GununganMotif, UkiranCorner } from './JavaneseOrnaments';

interface CoverEnvelopeProps {
  config: WeddingConfig;
  guestName: string;
  isOpen: boolean;
  onOpenInvitation: () => void;
}

export const CoverEnvelope: React.FC<CoverEnvelopeProps> = ({
  config,
  guestName,
  isOpen,
  onOpenInvitation,
}) => {

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#180E09] p-3 text-[#FAF6EE] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-6 ${
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
          className="h-full w-full object-cover object-center opacity-30 blur-[2px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#160C07]/85 via-[#24160F]/78 to-[#120905]/95" />
        <BatikKawungPattern id="cover-kawung" className="text-[#DFB963] opacity-[0.06]" />
      </div>

      {/* Main Envelope Card featuring Prominent Couple Photo */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#DFB963]/40 bg-[#24160F]/88 p-2.5 shadow-2xl backdrop-blur-md"
      >
        <div className="relative grid grid-cols-1 items-center gap-6 rounded-[20px] border border-[#DFB963]/20 px-5 py-7 sm:px-8 sm:py-9 md:grid-cols-12 md:gap-8">
          <UkiranCorner className="pointer-events-none absolute top-2.5 left-2.5 h-7 w-7 text-[#DFB963]/70" />
          <UkiranCorner className="pointer-events-none absolute top-2.5 right-2.5 h-7 w-7 rotate-90 text-[#DFB963]/70" />
          <UkiranCorner className="pointer-events-none absolute bottom-2.5 left-2.5 h-7 w-7 -rotate-90 text-[#DFB963]/70" />
          <UkiranCorner className="pointer-events-none absolute right-2.5 bottom-2.5 h-7 w-7 rotate-180 text-[#DFB963]/70" />

          {/* Couple Portrait Column (Arched Keraton Frame) */}
          <div className="flex flex-col items-center justify-center md:col-span-5">
            <p className="mb-3 text-center font-serif text-lg font-semibold tracking-[0.18em] uppercase text-[#DFB963] sm:text-xl">
              Undangan Pernikahan
            </p>
            <div className="keraton-arch relative h-52 w-40 overflow-hidden border-2 border-[#DFB963]/70 bg-[#180E09] p-1 shadow-xl sm:h-64 sm:w-48 md:h-[380px] md:w-full">
              <img
                src={config.coverPhoto}
                alt={`Foto Pengantin ${config.coupleTitle}`}
                referrerPolicy="no-referrer"
                className="keraton-arch h-full w-full object-cover object-top"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#180E09]/45 via-transparent to-transparent" />
            </div>
          </div>

          {/* Invitation Details & Guest Name Column */}
          <div className="text-center md:col-span-7 md:text-left">
            <div className="mb-3 flex items-center justify-center text-[#DFB963] md:justify-start">
              <GununganMotif className="h-10 w-8 opacity-90" />
            </div>

            <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#FAF6EE] sm:text-5xl lg:text-6xl">
              {config.coupleTitle}
            </h1>

            <p className="mt-1.5 text-xs text-[#FAF6EE]/80 sm:text-sm">
              {config.resepsi.dateLabel} · {config.venueName}
            </p>

            <div className="my-5 border-y border-[#DFB963]/25 py-4">
              <p className="text-xs text-[#FAF6EE]/75">
                Kepada Yth. Bapak/Ibu/Saudara/i
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold text-[#DFB963] sm:text-3xl">
                {guestName}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#FAF6EE]/65">
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

            <p className="mt-3 text-[11px] text-[#FAF6EE]/60">
              Musik latar akan otomatis diputar saat undangan dibuka
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
