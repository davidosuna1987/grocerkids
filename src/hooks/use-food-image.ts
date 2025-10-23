// useFoodImage.ts (actualizado: Google "imagen-estricto")
'use client';

import { IMAGE_PROVIDERS, IMAGE_PROVIDERS_MAP, ImageProvider } from "@/types";
import { useCallback } from "react";
import { useSettings } from "@/contexts/settings-context";

const PEXELS_API_KEY   = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
const PIXABAY_API_KEY  = process.env.NEXT_PUBLIC_PIXABAY_API_KEY;
const GOOGLE_CSE_CX    = process.env.NEXT_PUBLIC_GOOGLE_CSE_CX;
const GOOGLE_API_KEY   = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export function useFoodImage() {
  const { provider: currentProvider, setProvider } = useSettings();

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
          const params = new URLSearchParams({
            q: food,
            searchType: 'image',
            cx: GOOGLE_CSE_CX,
            key: GOOGLE_API_KEY,
            num: '10',
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
          if (response.status === 429 && activeProvider === IMAGE_PROVIDERS_MAP.google) {
            console.warn("Google API limit reached, switching to next provider.");
            const currentIndex = IMAGE_PROVIDERS.indexOf(activeProvider);
            const nextIndex = (currentIndex + 1) % IMAGE_PROVIDERS.length;
            const nextProvider = IMAGE_PROVIDERS[nextIndex];
            setProvider(nextProvider);
            return getProductImages(food, nextProvider); 
          }
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
            (photo: { link: string; image: { thumbnailLink: string; }; }) => 
              photo.link ?? photo.image?.thumbnailLink ?? fallbackImage);
        }

        return [fallbackImage];
      } catch (err: any) {
        console.error(err?.message ?? err);
        return [fallbackImage];
      }
    },
    [currentProvider, setProvider]
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
