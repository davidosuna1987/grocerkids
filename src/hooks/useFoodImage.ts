'use client';

import { IMAGE_PROVIDERS_MAP, ImageProvider } from "@/types";
import { useCallback } from "react";
import { useSettings } from "@/contexts/SettingsContext";

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
const PIXABAY_API_KEY = process.env.NEXT_PUBLIC_PIXABAY_API_KEY;

export function useFoodImage() {
  const { provider: currentProvider } = useSettings();

  const getProductImage = useCallback(async (food: string, provider?: ImageProvider): Promise<string> => {
    const activeProvider = provider || currentProvider;
    const fallbackImage = `https://picsum.photos/400/400?random=${crypto.randomUUID()}`;

    if (!food) return fallbackImage;

    try {
      let url = "";
      let headers: HeadersInit = {};

      if (activeProvider === IMAGE_PROVIDERS_MAP.pexels) {
        if (!PEXELS_API_KEY) {
          console.error("Pexels API key is missing.");
          return fallbackImage;
        }
        url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          food
        )}&locale=es-ES&per_page=1`;
        headers = { Authorization: PEXELS_API_KEY };
      } else if (activeProvider === IMAGE_PROVIDERS_MAP.pixabay) {
         if (!PIXABAY_API_KEY) {
          console.error("Pixabay API key is missing. Make sure it's defined in .env as NEXT_PUBLIC_PIXABAY_API_KEY");
          return fallbackImage;
        }
        url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
          food
        )}&lang=es&image_type=photo&per_page=3`;
      } else {
        return fallbackImage;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`Error fetching image from ${activeProvider}: ${response.status}`);
      }

      const data = await response.json();

      if (activeProvider === IMAGE_PROVIDERS_MAP.pexels && data.photos.length > 0) {
        return data.photos[0].src.large;
      } else if (activeProvider === IMAGE_PROVIDERS_MAP.pixabay && data.hits.length > 0) {
        return data.hits[0].largeImageURL;
      } else {
        console.log(`No results found on ${activeProvider} for "${food}", using fallback.`);
        return fallbackImage;
      }
    } catch (err: any) {
      console.error(err.message);
      return fallbackImage;
    }
  }, [currentProvider]);

  return { getProductImage };
}
