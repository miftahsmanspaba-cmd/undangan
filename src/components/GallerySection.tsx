import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import type { GalleryPhoto } from '../types/wedding';
import { KawungDivider } from './JavaneseOrnaments';

interface GallerySectionProps {
  photos: GalleryPhoto[];
}

type CategoryFilter = 'Semua' | 'Detail';

export const GallerySection: React.FC<GallerySectionProps> = ({ photos }) => {
  const [filter, setFilter] = useState<CategoryFilter>('Semua');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos =
    filter === 'Semua' ? photos : photos.filter((p) => p.category === filter);

  const categories: CategoryFilter[] = ['Semua', 'Detail'];

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, filteredPhotos.length]);

  const activePhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section id="galeri" className="bg-[#FAF6EE] px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8A5E14]">
            Momen Bahagia
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-[#24160F] sm:text-5xl">
            Galeri Foto Prewedding
          </h2>
          <div className="mx-auto mt-4 flex justify-center text-[#B8862D]">
            <KawungDivider className="h-6 w-52" />
          </div>

          {/* Interactive Category Filter Buttons */}
          <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-1 rounded-xl bg-[#E7DCC7] p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setFilter(cat);
                  setLightboxIndex(null);
                }}
                className={`min-h-[40px] rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862D] sm:text-sm ${
                  filter === cat
                    ? 'bg-[#24160F] text-[#FAF6EE] shadow-sm'
                    : 'text-[#523E32] hover:text-[#24160F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Responsive Portrait Gallery Grid */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPhotos.map((photo, index) => (
            <motion.button
              key={photo.id}
              type="button"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#B8862D]/30 bg-[#24160F] text-left shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8862D]"
            >
              <img
                src={photo.src}
                alt={photo.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="h-full w-full object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#190F0A]/90 via-[#190F0A]/25 to-transparent" />

              <span className="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DFB963]/35 bg-[#24160F]/75 text-[#FAF6EE] opacity-90 backdrop-blur-sm transition-transform duration-200 group-hover:scale-105">
                <Expand className="h-4 w-4" />
              </span>

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="text-xs font-medium text-[#DFB963]">
                  {photo.category}
                </p>
                <h3 className="mt-0.5 font-serif text-xl font-semibold text-[#FAF6EE]">
                  {photo.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-[#FAF6EE]/75">
                  {photo.caption}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Fullscreen Interactive Lightbox with Thumbnail Strip */}
      {activePhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#140B07]/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxIndex(null);
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Tutup galeri"
            className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DFB963]/35 bg-[#24160F] text-[#FAF6EE] transition-colors hover:bg-[#311F15]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex w-full max-w-4xl flex-col items-center">
            <div className="relative flex w-full items-center justify-center">
              {filteredPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
                    )
                  }
                  aria-label="Foto sebelumnya"
                  className="absolute left-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DFB963]/35 bg-[#24160F]/85 text-[#FAF6EE] transition-colors hover:bg-[#311F15] sm:left-4"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              <img
                src={activePhoto.src}
                alt={activePhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[64vh] w-auto rounded-2xl border border-[#DFB963]/30 object-contain shadow-2xl"
              />

              {filteredPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
                  }
                  aria-label="Foto berikutnya"
                  className="absolute right-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DFB963]/35 bg-[#24160F]/85 text-[#FAF6EE] transition-colors hover:bg-[#311F15] sm:right-4"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-4 max-w-xl text-center text-[#FAF6EE]">
              <p className="text-xs font-medium text-[#DFB963] tabular-nums">
                {activePhoto.category} · {lightboxIndex + 1} / {filteredPhotos.length}
              </p>
              <h3 className="mt-1 font-serif text-2xl font-semibold">
                {activePhoto.title}
              </h3>
              <p className="mt-1 text-xs text-[#FAF6EE]/75 sm:text-sm">
                {activePhoto.caption}
              </p>
            </div>

            {/* Quick Thumbnail Strip */}
            {filteredPhotos.length > 1 && (
              <div className="mt-4 flex max-w-full items-center gap-2 overflow-x-auto pb-1">
                {filteredPhotos.map((thumb, idx) => (
                  <button
                    key={thumb.id}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    aria-label={`Lihat ${thumb.title}`}
                    className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border transition-all ${
                      idx === lightboxIndex
                        ? 'border-[#DFB963] scale-105 opacity-100'
                        : 'border-white/15 opacity-55 hover:opacity-85'
                    }`}
                  >
                    <img
                      src={thumb.src}
                      alt={thumb.title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
