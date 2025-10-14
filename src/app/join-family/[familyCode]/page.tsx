import JoinFamily from '@/app/views/join-family';
import type { Metadata } from 'next';

// 🧠 Esto se ejecuta en el SERVIDOR, aunque la página sea 'use client'
export async function generateMetadata({ params }: { params: { familyCode: string } }): Promise<Metadata> {
  const { familyCode } = params;

  // (Opcional) Podrías obtener datos reales de tu API:
  // const family = await fetch(`https://api.miapp.com/family/${familyCode}`).then(r => r.json());
  // const name = family.name ?? familyCode;

  const name = `Grocer Kids`;
  const baseUrl = 'https://grocerkids.vercel.app';

  return {
    title: `Únete a ${name}`,
    description: 'Lista compartida de la compra familiar 👪🛒',
    openGraph: {
      title: `Únete a ${name}`,
      description: 'Comparte la lista familiar y colabora en tiempo real 🛒',
      url: `${baseUrl}/join-family/${familyCode}`,
      images: [
        {
          url: `${baseUrl}/join-family/${familyCode}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: `Invitación a ${name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Únete a ${name}`,
      description: 'Comparte la lista familiar y colabora en tiempo real 🛒',
      images: [`${baseUrl}/join-family/${familyCode}/opengraph-image.png`],
    },
  };
}

export default function Page({ params }: { params: { familyCode: string } }) {
  return <JoinFamily familyCode={params.familyCode} />;
}
