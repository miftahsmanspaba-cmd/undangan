import { INITIAL_RSVPS } from '../data/defaultWedding';
import type { RsvpEntry, WeddingConfig } from '../types/wedding';
import { buildStandaloneHtmlDocument, GOOGLE_APPS_SCRIPT_CODE } from './standaloneTemplate';

export { GOOGLE_APPS_SCRIPT_CODE };

/**
 * Resize & compress image via HTML5 Canvas so exported standalone index.html
 * stays compact, loads instantaneously on mobile, and uploads cleanly to GitHub.
 */
async function imageUrlToCompressedDataUri(src: string): Promise<string> {
  if (!src) return '';
  if (src.startsWith('data:')) return src;

  try {
    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const maxDim = 960;
          let width = img.naturalWidth || 800;
          let height = img.naturalHeight || 800;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(src);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } catch {
          resolve(src);
        }
      };
      img.onerror = async () => {
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : src);
          reader.onerror = () => resolve(src);
          reader.readAsDataURL(blob);
        } catch {
          resolve(src);
        }
      };
      img.src = src;
    });
  } catch {
    return src;
  }
}

async function audioUrlToDataUri(src: string): Promise<string> {
  if (!src) return '';
  if (src.startsWith('data:')) return src;
  try {
    const response = await fetch(src);
    if (!response.ok) return src;
    const blob = await response.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : src);
      reader.onerror = () => resolve(src);
      reader.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
}

export async function generateStandaloneHtml(
  config: WeddingConfig,
  initialRsvps: RsvpEntry[] = INITIAL_RSVPS
): Promise<string> {
  const [coverData, brideData, groomData, audioData, ...galleryData] = await Promise.all([
    imageUrlToCompressedDataUri(config.coverPhoto),
    imageUrlToCompressedDataUri(config.bride.photo),
    imageUrlToCompressedDataUri(config.groom.photo),
    audioUrlToDataUri(config.audioUrl),
    ...config.gallery.map((g) => imageUrlToCompressedDataUri(g.src)),
  ]);

  return buildStandaloneHtmlDocument(
    config,
    {
      coverData,
      brideData,
      groomData,
      galleryData,
      audioData,
    },
    initialRsvps
  );
}
