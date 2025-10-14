import JoinFamily from '@/app/views/join-family';

export const dynamic = 'force-static'
export const revalidate = 0

interface JoinFamilyParams {
  params: {
    familyCode: string
  }
}

export async function generateMetadata({ params }: JoinFamilyParams) {
  const { familyCode } = params

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

export default function Page({ params }: { params: { familyCode: string  } }) {
  return <JoinFamily familyCode={params.familyCode} />
}
