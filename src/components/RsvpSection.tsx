import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Send, Sheet } from 'lucide-react';
import type { AttendanceStatus, RsvpEntry, RsvpSummary } from '../types/wedding';
import { KawungDivider } from './JavaneseOrnaments';

interface RsvpSectionProps {
  defaultGuestName: string;
  entries: RsvpEntry[];
  summary: RsvpSummary;
  hasGoogleSheetSync: boolean;
  onSubmitRsvp: (payload: {
    nama: string;
    hubungan: string;
    kehadiran: AttendanceStatus;
    jumlahTamu: number;
    ucapan: string;
  }) => Promise<{ ok: boolean; error?: string; syncedToSheet?: boolean }>;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  defaultGuestName,
  entries,
  summary,
  hasGoogleSheetSync,
  onSubmitRsvp,
}) => {
  const [nama, setNama] = useState(
    defaultGuestName && defaultGuestName !== 'Tamu Undangan' ? defaultGuestName : ''
  );
  const [hubungan, setHubungan] = useState('');
  const [kehadiran, setKehadiran] = useState<AttendanceStatus>('Hadir');
  const [jumlahTamu, setJumlahTamu] = useState<number>(2);
  const [ucapan, setUcapan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    const res = await onSubmitRsvp({
      nama,
      hubungan: hubungan || 'Tamu Undangan',
      kehadiran,
      jumlahTamu: kehadiran === 'Berhalangan' ? 0 : jumlahTamu,
      ucapan,
    });
    setSubmitting(false);

    if (res.ok) {
      setUcapan('');
      setFeedback({
        type: 'success',
        message: res.syncedToSheet
          ? 'Matur nuwun! Konfirmasi & doa Anda telah tersimpan dan disinkronkan ke Google Sheets.'
          : 'Matur nuwun! Konfirmasi kehadiran & ucapan doa Anda telah tersimpan.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Terjadi kesalahan saat mengirim konfirmasi.',
      });
    }
  };

  return (
    <section id="rsvp" className="bg-[#F2EAD9] px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8A5E14]">
            Konfirmasi Kehadiran
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-[#24160F] sm:text-5xl">
            RSVP &amp; Ucapan Doa
          </h2>
          <div className="mx-auto mt-4 flex justify-center text-[#B8862D]">
            <KawungDivider className="h-6 w-52" />
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#574439] sm:text-base">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu.
          </p>

          {/* Clean Unboxed Tabular Summary */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-[#574439] sm:text-sm">
            <span className="tabular-nums">
              <strong className="text-[#24160F]">{summary.hadirCount}</strong> Konfirmasi Hadir
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              <strong className="text-[#24160F]">{summary.totalGuests}</strong> Estimasi Tamu
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              <strong className="text-[#24160F]">{summary.totalEntries}</strong> Ucapan Doa
            </span>
            {hasGoogleSheetSync && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#216E39]">
                  <Sheet className="h-3.5 w-3.5" />
                  <span>Terhubung ke Google Sheets</span>
                </span>
              </>
            )}
          </div>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Form Column */}
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#B8862D]/30 bg-white p-6 shadow-sm sm:p-8 lg:col-span-5"
          >
            <h3 className="font-serif text-2xl font-semibold text-[#24160F]">
              Kirim Konfirmasi
            </h3>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="rsvp-nama"
                  className="block text-xs font-semibold text-[#3B281E]"
                >
                  Nama Lengkap
                </label>
                <input
                  id="rsvp-nama"
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Bapak Hendrawan & Ibu"
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3.5 py-2.5 text-sm text-[#24160F] placeholder:text-[#8A7668] focus:border-[#B8862D] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="rsvp-hubungan"
                  className="block text-xs font-semibold text-[#3B281E]"
                >
                  Relasi / Asal
                </label>
                <input
                  id="rsvp-hubungan"
                  type="text"
                  value={hubungan}
                  onChange={(e) => setHubungan(e.target.value)}
                  placeholder="Keluarga, Sahabat, Rekan Kerja..."
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3.5 py-2.5 text-sm text-[#24160F] placeholder:text-[#8A7668] focus:border-[#B8862D] focus:outline-none"
                />
              </div>

              {/* Tactile Attendance Selector Buttons */}
              <div>
                <span className="block text-xs font-semibold text-[#3B281E]">
                  Konfirmasi Kehadiran
                </span>
                <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setKehadiran('Hadir')}
                    className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      kehadiran === 'Hadir'
                        ? 'border-[#24160F] bg-[#24160F] text-[#FAF6EE]'
                        : 'border-[#24160F]/15 bg-[#FAF6EE] text-[#574439] hover:border-[#B8862D]'
                    }`}
                  >
                    InsyaAllah Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setKehadiran('Berhalangan')}
                    className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      kehadiran === 'Berhalangan'
                        ? 'border-[#24160F] bg-[#24160F] text-[#FAF6EE]'
                        : 'border-[#24160F]/15 bg-[#FAF6EE] text-[#574439] hover:border-[#B8862D]'
                    }`}
                  >
                    Berhalangan Hadir
                  </button>
                </div>
              </div>

              {kehadiran === 'Hadir' && (
                <div>
                  <label
                    htmlFor="rsvp-jumlah"
                    className="block text-xs font-semibold text-[#3B281E]"
                  >
                    Jumlah Tamu
                  </label>
                  <select
                    id="rsvp-jumlah"
                    value={jumlahTamu}
                    onChange={(e) => setJumlahTamu(Number(e.target.value))}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3 py-2.5 text-sm text-[#24160F] focus:border-[#B8862D] focus:outline-none"
                  >
                    <option value={1}>1 Orang</option>
                    <option value={2}>2 Orang</option>
                    <option value={3}>3 Orang</option>
                    <option value={4}>4 Orang</option>
                    <option value={5}>5 Orang</option>
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="rsvp-ucapan"
                  className="block text-xs font-semibold text-[#3B281E]"
                >
                  Ucapan &amp; Doa Restu
                </label>
                <textarea
                  id="rsvp-ucapan"
                  rows={3}
                  required
                  value={ucapan}
                  onChange={(e) => setUcapan(e.target.value)}
                  placeholder="Tuliskan doa terbaik untuk kedua mempelai..."
                  className="mt-1.5 w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3.5 py-2.5 text-sm text-[#24160F] placeholder:text-[#8A7668] focus:border-[#B8862D] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#B8862D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9E7022] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862D]"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Mengirim...' : 'Kirim Konfirmasi & Ucapan'}</span>
              </button>

              {feedback && (
                <div
                  role="status"
                  className={`flex items-start gap-2 rounded-xl px-3.5 py-3 text-xs leading-relaxed ${
                    feedback.type === 'success'
                      ? 'bg-[#EEF6EE] text-[#1E5631]'
                      : 'bg-[#FDF0ED] text-[#8E2A1B]'
                  }`}
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{feedback.message}</span>
                </div>
              )}
            </div>
          </motion.form>

          {/* Wishes Feed Column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
              {entries.length === 0 ? (
                <div className="rounded-2xl border border-[#B8862D]/20 bg-white p-8 text-center text-sm text-[#634F43]">
                  Belum ada ucapan. Jadilah yang pertama memberikan doa restu.
                </div>
              ) : (
                entries.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-[#B8862D]/25 bg-white p-5 transition-colors hover:border-[#B8862D]/45"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="font-serif text-xl font-semibold text-[#24160F]">
                        {item.nama}
                      </h4>
                      <span
                        className={`text-xs font-semibold ${
                          item.kehadiran === 'Hadir'
                            ? 'text-[#1E5631]'
                            : 'text-[#7B4F2B]'
                        }`}
                      >
                        {item.kehadiran}
                        {item.kehadiran === 'Hadir' ? ` · ${item.jumlahTamu} Tamu` : ''}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#7D6658]">
                      {item.hubungan} ·{' '}
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[#433227]">
                      {item.ucapan}
                    </p>
                  </article>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
