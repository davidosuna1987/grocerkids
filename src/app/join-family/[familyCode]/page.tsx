'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSettings } from '@/contexts/settings-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
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

// 💻 Esto se ejecuta en el CLIENTE
export default function JoinFamilyPage() {
  const router = useRouter();
  const params = useParams();
  const { joinFamily } = useSettings();
  const { toast } = useToast();
  const [hasRun, setHasRun] = useState(false);

  const familyCode = Array.isArray(params.familyCode)
    ? params.familyCode[0]
    : params.familyCode;

  useEffect(() => {
    if (familyCode && !hasRun) {
      setHasRun(true);
      const handleJoin = async () => {
        await joinFamily(familyCode);
        router.push('/');
      };
      handleJoin();
    }
  }, [familyCode, joinFamily, router, toast, hasRun]);

  useEffect(() => {
    if (!familyCode && !hasRun) {
      router.push('/');
    }
  }, [familyCode, router, hasRun]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-lg">Uniéndote a la lista familiar...</p>
      </div>
    </div>
  );
}
