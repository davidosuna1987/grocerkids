// useFoodImage.ts (actualizado: Google "imagen-estricto")
'use client';

import { IMAGE_PROVIDERS_MAP, ImageProvider } from "@/types";
import { useCallback } from "react";
import { useSettings } from "@/contexts/settings-context";

const PEXELS_API_KEY   = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
const PIXABAY_API_KEY  = process.env.NEXT_PUBLIC_PIXABAY_API_KEY;
const GOOGLE_CSE_CX    = process.env.NEXT_PUBLIC_GOOGLE_CSE_CX;
const GOOGLE_API_KEY   = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export function useFoodImage() {
  const { provider: currentProvider } = useSettings();

  const pickLargestGoogleImage = (items: any[]) => {
    // Ordena por área (width*height) desc y devuelve el link
    const withDims = items
      .map((it) => ({
        url: it.link,
        width: it.image?.width ?? 0,
        height: it.image?.height ?? 0,
        area: (it.image?.width ?? 0) * (it.image?.height ?? 0),
        thumb: it.image?.thumbnailLink,
      }))
      .filter((i) => i.url);

    if (!withDims.length) return null;
    withDims.sort((a, b) => b.area - a.area);
    return withDims[0].url || withDims[0].thumb || null;
  };

  const getProductImages = useCallback(
    async (food: string, provider?: ImageProvider): Promise<string[]> => {
      const activeProvider = provider || currentProvider;
      const fallbackImage = `https://ui-avatars.com/api/?name=${food}&background=7d3eea&color=fff&length=1&bold=false&uppercase=true&format=svg`

      if (!food?.trim()) return [fallbackImage];

      try {
        let url = "";
        let headers: HeadersInit = {};

        if (activeProvider === IMAGE_PROVIDERS_MAP.pexels) {
          if (!PEXELS_API_KEY) {
            console.error("Pexels API key missing: NEXT_PUBLIC_PEXELS_API_KEY");
            return [fallbackImage];
          }
          url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(food)}&locale=es-ES&per_page=20`;
          headers = { Authorization: PEXELS_API_KEY };

        } else if (activeProvider === IMAGE_PROVIDERS_MAP.pixabay) {
          if (!PIXABAY_API_KEY) {
            console.error("Pixabay API key missing: NEXT_PUBLIC_PIXABAY_API_KEY");
            return [fallbackImage];
          }
          url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(food)}&lang=es&image_type=photo&per_page=20`;

        } else if (activeProvider === IMAGE_PROVIDERS_MAP.google) {
          if (!GOOGLE_CSE_CX || !GOOGLE_API_KEY) {
            console.error("Google CSE creds missing: NEXT_PUBLIC_GOOGLE_CSE_CX / NEXT_PUBLIC_GOOGLE_API_KEY");
            return [fallbackImage];
          }
          // Afinado “estilo imágenes de Google”
          // - searchType=image → solo imágenes
          // - imgType=photo, imgSize=large → resultados más fotográficos y grandes
          // - hl=es, gl=es, lr=lang_es → sesgo a español
          // - num=10 → más candidatos para elegir el más grande/nítido
          const params = new URLSearchParams({
            q: food,
            searchType: 'image',
            cx: GOOGLE_CSE_CX,
            key: GOOGLE_API_KEY,
            num: '20',
            safe: 'active',
            hl: 'es',
            gl: 'ES',
            lr: 'lang_es',
          });
          url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;

        } else {
          return [fallbackImage];
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(`Error fetching image from ${String(activeProvider)}: ${response.status}`);
        }

        const data = await response.json();

        if (activeProvider === IMAGE_PROVIDERS_MAP.pexels && Array.isArray(data.photos) && data.photos.length > 0) {
          return data.photos.map(
            (photo: { src: { large: string; medium: string; }; }) => 
              photo.src?.medium ?? photo.src?.large ?? fallbackImage);
        }

        if (activeProvider === IMAGE_PROVIDERS_MAP.pixabay && Array.isArray(data.hits) && data.hits.length > 0) {
          return data.hits.map(
            (photo: { largeImageURL: string; webformatURL: string; }) => 
              photo.webformatURL ?? photo.largeImageURL ?? fallbackImage);
        }

        if (activeProvider === IMAGE_PROVIDERS_MAP.google && Array.isArray(data.items) && data.items.length > 0) {
          return data.items.map(
            (photo: { link: string; thumbnailLink: string; }) => 
              photo.link ?? photo.thumbnailLink ?? fallbackImage);
        }

        return [fallbackImage];
      } catch (err: any) {
        console.error(err?.message ?? err);
        return [fallbackImage];
      }
    },
    [currentProvider]
  );

  const getProductImage = useCallback(
    async (food: string, provider?: ImageProvider): Promise<string> => {
      const images = await getProductImages(food, provider);
      return images[0];
    },
    [getProductImages]
  );

  return { getProductImage, getProductImages };
}
