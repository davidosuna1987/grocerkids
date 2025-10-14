import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// 🧠 Esto se ejecuta en el servidor, genera la imagen OG dinámica
export default async function Image({ params }: { params: { familyCode: string } }) {
  const { familyCode } = params;
  const name = `Familia ${familyCode}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
          color: 'white',
          fontFamily: 'Poppins, sans-serif',
          fontSize: 60,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🛒 Lista Familiar</div>
        <div style={{ fontSize: 56 }}>{name}</div>
        <div style={{ fontSize: 28, opacity: 0.8, marginTop: 20 }}>
          miapp.vercel.app/family/{familyCode}
        </div>
      </div>
    ),
    size
  );
}
