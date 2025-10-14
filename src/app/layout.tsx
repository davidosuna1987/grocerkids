import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Grocer Kids',
  description: 'Una lista de la compra divertida y visual para niños y padres. Comparte lista de la compra con tus seres queridos y sincronízala con los demás de la casa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-title" content="Grocer Kids" />
        <meta property="og:image" content="https://grocerkids.vercel.app/og-image.png" />
        <meta property="og:image:width" content="830" />
        <meta property="og:image:height" content="301" />
        <meta property="og:image:alt" content="Grocer Kids" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://grocerkids.vercel.app/og-image.png" />
        <meta name="twitter:image:alt" content="Grocer Kids" />
        <meta name="twitter:image:width" content="830" />
        <meta name="twitter:image:height" content="301" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Una lista de la compra divertida y visual para niños y padres. Comparte lista de la compra con tus seres queridos y sincronízala con los demás de la casa." />
        <meta name="title" content="Grocer Kids" />
      </head>
      <body className={cn("font-body antialiased", "min-h-screen bg-background")}>
        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SettingsProvider>
              {children}
              <Toaster />
            </SettingsProvider>
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
