import React, { useEffect, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Link2,
  Save,
  Share2,
  X,
} from 'lucide-react';
import type { RsvpEntry, RsvpSummary, WeddingConfig } from '../types/wedding';
import { GOOGLE_APPS_SCRIPT_CODE, generateStandaloneHtml } from '../utils/htmlExporter';

interface PublishStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WeddingConfig;
  rsvps: RsvpEntry[];
  summary: RsvpSummary;
  onSaveConfig: (next: WeddingConfig) => Promise<boolean>;
  onPreviewGuest: (guestName: string) => void;
}

type StudioTab = 'customize' | 'sheets' | 'export';

export const PublishStudioModal: React.FC<PublishStudioModalProps> = ({
  isOpen,
  onClose,
  config,
  rsvps,
  summary,
  onSaveConfig,
  onPreviewGuest,
}) => {
  const [tab, setTab] = useState<StudioTab>('customize');
  const [draft, setDraft] = useState<WeddingConfig>(config);
  const [guestInput, setGuestInput] = useState('Bapak Hendrawan & Ibu');
  const [hostedUrl, setHostedUrl] = useState(() =>
    typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : ''
  );
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadingHtml, setDownloadingHtml] = useState(false);
  const [copyingHtml, setCopyingHtml] = useState(false);

  useEffect(() => {
    setDraft(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://undangan-anda.com/';
  const personalizedUrl = `${baseUrl}?to=${encodeURIComponent(guestInput.trim() || 'Tamu Undangan')}`;

  const whatsappText = `Assalamu'alaikum Wr. Wb.\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i *${
    guestInput.trim() || 'Tamu Undangan'
  }* untuk menghadiri acara pernikahan kami:\n\n*${draft.coupleTitle}*\n${draft.akad.dateLabel}\n${draft.venueName}\n\nBuka undangan digital:\n${personalizedUrl}\n\nMerupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    const ok = await onSaveConfig(draft);
    setSaving(false);
    setSaveMessage(
      ok
        ? 'Perubahan tersimpan! Link undangan & file ekspor HTML sudah diperbarui.'
        : 'Gagal menyimpan perubahan. Silakan coba lagi.'
    );
  };

  const handleDownloadHtml = async () => {
    setDownloadingHtml(true);
    try {
      const htmlString = await generateStandaloneHtml(draft, rsvps);
      const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingHtml(false);
    }
  };

  const handleCopyHtml = async () => {
    setCopyingHtml(true);
    try {
      const htmlString = await generateStandaloneHtml(draft, rsvps);
      await navigator.clipboard.writeText(htmlString);
      setCopiedKey('html-code');
      window.setTimeout(() => setCopiedKey(null), 2500);
    } finally {
      setCopyingHtml(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#140B07]/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Kelola Undangan, Google Sheets & Export HTML"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-[#B8862D]/35 bg-[#FAF6EE] text-[#24160F] shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#B8862D]/20 bg-[#24160F] px-6 py-4 text-[#FAF6EE]">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#FAF6EE]">
              Kelola Undangan &amp; Publish
            </h2>
            <p className="text-xs text-[#FAF6EE]/70">
              Edit data mempelai, generator link tamu ?to=, sinkronisasi Google Sheets, dan ekspor index.html untuk GitHub Pages / Canva
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel kelola"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DFB963]/35 text-[#FAF6EE] hover:bg-[#311F15]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-[#B8862D]/20 bg-[#F2EAD9] px-6 py-2">
          <button
            type="button"
            onClick={() => setTab('customize')}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              tab === 'customize'
                ? 'bg-[#24160F] text-[#FAF6EE]'
                : 'text-[#574439] hover:text-[#24160F]'
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>Edit Data &amp; Link Tamu</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('sheets')}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              tab === 'sheets'
                ? 'bg-[#24160F] text-[#FAF6EE]'
                : 'text-[#574439] hover:text-[#24160F]'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Google Sheets RSVP</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('export')}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              tab === 'export'
                ? 'bg-[#24160F] text-[#FAF6EE]'
                : 'text-[#574439] hover:text-[#24160F]'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Download HTML &amp; GitHub / Canva</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'customize' && (
            <div className="space-y-8">
              {/* Guest Link Generator (?to=Nama+Tamu) */}
              <div className="rounded-2xl border border-[#B8862D]/30 bg-white p-5">
                <h3 className="font-serif text-2xl font-semibold text-[#24160F]">
                  Generator Link Tamu (?to=Nama+Tamu)
                </h3>
                <p className="mt-1 text-xs text-[#574439]">
                  Masukkan nama tamu undangan untuk membuat tautan personal seperti inainvitation.id/?to=Nama+Tamu.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={guestInput}
                    onChange={(e) => setGuestInput(e.target.value)}
                    placeholder="Contoh: Bapak Hendrawan & Ibu"
                    className="min-h-[44px] flex-1 rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3.5 py-2 text-sm text-[#24160F]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onPreviewGuest(guestInput.trim() || 'Tamu Undangan');
                      onClose();
                    }}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#B8862D]/40 bg-[#FAF6EE] px-4 py-2 text-xs font-semibold text-[#24160F] hover:bg-[#F2EAD9] whitespace-nowrap"
                  >
                    Pratinjau di Sampul
                  </button>
                </div>

                <div className="mt-3 rounded-xl bg-[#F2EAD9]/70 p-3 text-xs break-all text-[#3B281E]">
                  {personalizedUrl}
                </div>

                <div className="mt-3 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopy('guest-url', personalizedUrl)}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#24160F] px-4 py-2 text-xs font-semibold text-[#FAF6EE] hover:bg-[#3A2419]"
                  >
                    {copiedKey === 'guest-url' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'guest-url' ? 'Link Tersalin' : 'Salin Link Undangan'}</span>
                  </button>

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#1E5631] px-4 py-2 text-xs font-semibold text-white hover:bg-[#174426]"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Kirim via WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Edit Wedding Details Form */}
              <form onSubmit={handleSave} className="rounded-2xl border border-[#B8862D]/30 bg-white p-5">
                <h3 className="font-serif text-2xl font-semibold text-[#24160F]">
                  Edit Data Mempelai, Acara &amp; Musik
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#3B281E]">
                      Judul Pasangan (Sampul &amp; Header)
                    </label>
                    <input
                      type="text"
                      value={draft.coupleTitle}
                      onChange={(e) => setDraft({ ...draft, coupleTitle: e.target.value })}
                      className="mt-1 min-h-[42px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3B281E]">
                      Tanggal Hitung Mundur (ISO)
                    </label>
                    <input
                      type="text"
                      value={draft.targetDateIso}
                      onChange={(e) => setDraft({ ...draft, targetDateIso: e.target.value })}
                      className="mt-1 min-h-[42px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3B281E]">
                      Nama Lengkap Mempelai Wanita
                    </label>
                    <input
                      type="text"
                      value={draft.bride.fullName}
                      onChange={(e) =>
                        setDraft({ ...draft, bride: { ...draft.bride, fullName: e.target.value } })
                      }
                      className="mt-1 min-h-[42px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3B281E]">
                      Nama Lengkap Mempelai Pria
                    </label>
                    <input
                      type="text"
                      value={draft.groom.fullName}
                      onChange={(e) =>
                        setDraft({ ...draft, groom: { ...draft.groom, fullName: e.target.value } })
                      }
                      className="mt-1 min-h-[42px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3B281E]">
                      Nama Gedung / Pendopo
                    </label>
                    <input
                      type="text"
                      value={draft.venueName}
                      onChange={(e) => setDraft({ ...draft, venueName: e.target.value })}
                      className="mt-1 min-h-[42px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3B281E]">
                      Link Google Maps
                    </label>
                    <input
                      type="url"
                      value={draft.googleMapsUrl}
                      onChange={(e) => setDraft({ ...draft, googleMapsUrl: e.target.value })}
                      className="mt-1 min-h-[42px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#3B281E]">
                      Alamat Lengkap Lokasi
                    </label>
                    <input
                      type="text"
                      value={draft.venueAddress}
                      onChange={(e) => setDraft({ ...draft, venueAddress: e.target.value })}
                      className="mt-1 min-h-[42px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#3B281E]">
                      URL Musik MP3 Kustom (Opsional — kosongkan untuk instrumen Jawa bawaan)
                    </label>
                    <input
                      type="url"
                      value={draft.audioUrl}
                      onChange={(e) => setDraft({ ...draft, audioUrl: e.target.value })}
                      placeholder="https://contoh.com/lagu-pernikahan.mp3"
                      className="mt-1 min-h-[42px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#B8862D] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#9E7022] disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                  {saveMessage && <span className="text-xs font-medium text-[#1E5631]">{saveMessage}</span>}
                </div>
              </form>
            </div>
          )}

          {tab === 'sheets' && (
            <div className="space-y-6">
              {/* Summary & CSV Download */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#B8862D]/30 bg-white p-5">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#24160F]">
                    Rekap Kehadiran Tamu ({summary.totalEntries} Entri)
                  </h3>
                  <p className="mt-1 text-xs text-[#574439] tabular-nums">
                    {summary.hadirCount} Hadir ({summary.totalGuests} Tamu) · {summary.berhalanganCount} Berhalangan
                  </p>
                </div>
                <a
                  href="/api/rsvp/csv"
                  download="rsvp-java-heritage.csv"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#1E5631] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#174426]"
                >
                  <Download className="h-4 w-4" />
                  <span>Download CSV (Google Sheets)</span>
                </a>
              </div>

              {/* Google Apps Script Real-time Webhook Integration */}
              <div className="rounded-2xl border border-[#B8862D]/30 bg-white p-5">
                <h3 className="font-serif text-2xl font-semibold text-[#24160F]">
                  Sinkronisasi Otomatis ke Google Sheets
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#574439]">
                  Agar setiap tamu yang mengisi RSVP langsung masuk sebagai baris baru di Google Sheets Anda (baik dari aplikasi ini maupun dari file HTML mandiri):
                </p>

                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-[#433227]">
                  <li>Buka <strong>Google Sheets</strong> baru, klik menu <strong>Ekstensi &rarr; Apps Script</strong>.</li>
                  <li>Salin kode di bawah ini dan tempelkan ke editor Apps Script, lalu simpan.</li>
                  <li>Klik <strong>Deploy &rarr; New deployment &rarr; Web app</strong>, atur <em>Who has access: Anyone</em>, lalu salin URL Web App-nya.</li>
                  <li>Tempel URL tersebut di kolom bawah ini dan klik <strong>Simpan URL Webhook</strong>.</li>
                </ol>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#3B281E]">Kode Google Apps Script (Code.gs)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('apps-script', GOOGLE_APPS_SCRIPT_CODE)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A5E14] hover:underline"
                    >
                      {copiedKey === 'apps-script' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === 'apps-script' ? 'Kode Tersalin' : 'Salin Kode'}</span>
                    </button>
                  </div>
                  <pre className="mt-2 max-h-44 overflow-auto rounded-xl bg-[#1D110B] p-3.5 text-[11px] leading-relaxed text-[#FAF6EE]">
                    {GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                </div>

                <form onSubmit={handleSave} className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="url"
                    value={draft.googleSheetWebhookUrl}
                    onChange={(e) => setDraft({ ...draft, googleSheetWebhookUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="min-h-[44px] flex-1 rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3.5 py-2 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#24160F] px-5 py-2 text-xs font-semibold text-[#FAF6EE] hover:bg-[#3A2419] whitespace-nowrap"
                  >
                    <Save className="h-4 w-4 text-[#DFB963]" />
                    <span>Simpan URL Webhook</span>
                  </button>
                </form>
                {saveMessage && <p className="mt-2 text-xs font-medium text-[#1E5631]">{saveMessage}</p>}
              </div>

              {/* Live RSVP Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#B8862D]/30 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#B8862D]/20 bg-[#F2EAD9] text-[#24160F]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Nama Tamu</th>
                      <th className="px-4 py-3 font-semibold">Kehadiran</th>
                      <th className="px-4 py-3 font-semibold tabular-nums">Tamu</th>
                      <th className="px-4 py-3 font-semibold">Ucapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B8862D]/15">
                    {rsvps.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-medium text-[#24160F]">
                          {r.nama}
                          <span className="block text-[11px] font-normal text-[#6E594C]">{r.hubungan}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.kehadiran}</td>
                        <td className="px-4 py-3 tabular-nums">{r.jumlahTamu}</td>
                        <td className="max-w-xs px-4 py-3 text-[#433227]">{r.ucapan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'export' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#B8862D]/30 bg-white p-6">
                <h3 className="font-serif text-2xl font-semibold text-[#24160F]">
                  Download File <code className="text-lg">index.html</code> Siap Pakai (Anti Blank Putih)
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#574439]">
                  Unduh seluruh undangan menjadi 1 file <strong>index.html</strong> murni (tanpa perlu compile React/Vite) yang langsung berjalan saat di-upload ke <strong>GitHub Pages</strong>, <strong>Netlify Drop</strong>, atau disematkan di <strong>Canva</strong>.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={downloadingHtml}
                    onClick={handleDownloadHtml}
                    className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#B8862D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#9E7022] disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    <span>
                      {downloadingHtml
                        ? 'Menyiapkan index.html...'
                        : 'Download index.html'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={copyingHtml}
                    onClick={handleCopyHtml}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#B8862D]/40 bg-[#FAF6EE] px-5 py-3 text-sm font-semibold text-[#24160F] hover:bg-[#F2EAD9] disabled:opacity-60"
                  >
                    {copiedKey === 'html-code' ? <Check className="h-4 w-4 text-[#1E5631]" /> : <Copy className="h-4 w-4 text-[#8A5E14]" />}
                    <span>
                      {copiedKey === 'html-code'
                        ? 'Kode HTML Tersalin'
                        : copyingHtml
                          ? 'Menyalin...'
                          : 'Salin Kode HTML'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Canva Embed & Code Generator */}
              <div className="rounded-2xl border border-[#B8862D]/30 bg-white p-6">
                <h4 className="font-serif text-2xl font-semibold text-[#24160F]">
                  Pasang di Canva (Canva Website &amp; Embed)
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[#574439]">
                  Canva tidak menerima upload file <code className="bg-[#F2EAD9] px-1">.html</code> langsung, namun Anda bisa menyematkan undangan ini penuh 1 layar di <strong>Canva Website</strong> memakai URL publik (dari Netlify Drop / GitHub Pages / URL aplikasi ini):
                </p>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-[#3B281E]">
                    URL Undangan Publik Anda (untuk disematkan di Canva)
                  </label>
                  <input
                    type="url"
                    value={hostedUrl}
                    onChange={(e) => setHostedUrl(e.target.value)}
                    placeholder="https://nama-anda.github.io/undangan/"
                    className="mt-1.5 min-h-[42px] w-full rounded-xl border border-[#24160F]/15 bg-[#FAF6EE] px-3.5 py-2 text-xs font-mono"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopy('canva-url', hostedUrl.trim() || baseUrl)}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#24160F] px-4 py-2 text-xs font-semibold text-[#FAF6EE] hover:bg-[#3A2419]"
                  >
                    {copiedKey === 'canva-url' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'canva-url' ? 'URL Canva Tersalin' : 'Salin URL untuk Canva Embed'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        'canva-iframe',
                        `<iframe src="${hostedUrl.trim() || baseUrl}" style="width:100%;height:100vh;border:0;" allow="autoplay; clipboard-write" loading="lazy"></iframe>`
                      )
                    }
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#B8862D]/40 bg-[#FAF6EE] px-4 py-2 text-xs font-semibold text-[#24160F] hover:bg-[#F2EAD9]"
                  >
                    {copiedKey === 'canva-iframe' ? <Check className="h-3.5 w-3.5 text-[#1E5631]" /> : <Copy className="h-3.5 w-3.5 text-[#8A5E14]" />}
                    <span>{copiedKey === 'canva-iframe' ? 'Kode Iframe Tersalin' : 'Salin Kode Iframe (Google Sites / HTML Embed)'}</span>
                  </button>
                </div>

                <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-[#433227]">
                  <li>Klik <strong>Download index.html</strong> di atas, lalu seret file-nya ke <strong>Netlify Drop</strong> (<code className="bg-[#F2EAD9] px-1">app.netlify.com/drop</code>) — dalam 5 detik langsung jadi URL HTTPS tanpa coding! (Atau gunakan GitHub Pages).</li>
                  <li>Tempel URL tersebut di kolom atas lalu klik <strong>Salin URL untuk Canva Embed</strong>.</li>
                  <li>Buka <strong>Canva</strong> &rarr; pilih template <strong>Website</strong> &rarr; klik menu <strong>Apps</strong> di kiri &rarr; cari <strong>Embed</strong> &rarr; tempel URL Anda dan tarik kotaknya hingga memenuhi kanvas.</li>
                  <li>Klik <strong>Publish Website</strong> di Canva — seluruh fitur (musik otomatis, countdown, galeri lightbox, Google Maps, dan RSVP Google Sheets) langsung aktif di dalam Canva!</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#B8862D]/30 bg-white p-5">
                  <h4 className="font-serif text-xl font-semibold text-[#24160F]">
                    Upload ke Netlify Drop (5 Detik)
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#433227]">
                    Jika ingin cara paling cepat tanpa setting GitHub, cukup buat folder kosong berisi 1 file <strong>index.html</strong> hasil download, lalu seret folder tersebut ke Netlify Drop.
                  </p>
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A5E14] hover:underline"
                  >
                    <span>Buka Netlify Drop</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="rounded-2xl border border-[#B8862D]/30 bg-white p-5">
                  <h4 className="font-serif text-xl font-semibold text-[#24160F]">
                    Upload ke GitHub Pages (Anti Blank)
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#433227]">
                    Upload <strong>index.html</strong> hasil <em>Download index.html</em> ke repository baru lalu aktifkan <strong>Settings &rarr; Pages &rarr; Branch: main</strong>. Jika mengupload seluruh project React, pilih <strong>Source: GitHub Actions</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
