export interface Product {
  id: string;
  name: string;
  image: string;
  bought: boolean;
}

export type ImageProvider = "pexels" | "pixabay";

export interface AppSettings {
  provider: ImageProvider;
}
