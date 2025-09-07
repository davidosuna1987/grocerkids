'use client';
import { useCallback } from "react";

const PEXELS_API_KEY = "mFJQuartb3tcHMQ03Bzl703zH68DCsiaoia479Ej6QZJGsVf4p9ChE2Z";
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "9757535-b18ed3a4f3633ebe78fc6b4d3";

type Provider = "pexels" | "pixabay";

export function useFoodImage() {

  const getProductImage = useCallback(async (food: string, provider: Provider = "pexels"): Promise<string> => {
    const fallbackImage = `https://picsum.photos/400/400?random=${crypto.randomUUID()}`;

    if (!food) return fallbackImage;

    try {
      let url = "";
      let headers: HeadersInit = {};

      if (provider === "pexels") {
        if (!PEXELS_API_KEY) {
          console.error("Pexels API key is missing.");
          return fallbackImage;
        }
        url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          food
        )}&locale=es-ES&per_page=1`;
        headers = { Authorization: PEXELS_API_KEY };
      } else if (provider === "pixabay") {
         if (!PIXABAY_API_KEY) {
          console.error("Pixabay API key is missing.");
          return fallbackImage;
        }
        url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
          food
        )}&lang=es&image_type=photo&per_page=3`; // Fetch 3 to find first one
      }

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`Error fetching image from ${provider}: ${response.status}`);
      }

      const data = await response.json();

      if (provider === "pexels" && data.photos.length > 0) {
        return data.photos[0].src.large;
      } else if (provider === "pixabay" && data.hits.length > 0) {
        return data.hits[0].largeImageURL;
      } else {
        return fallbackImage;
      }
    } catch (err: any) {
      console.error(err.message);
      return fallbackImage;
    }
  }, []);

  return { getProductImage };
}
