import Image from 'next/image';
import { ThemeToggle } from '../theme-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Image
            src={`/logo.png?v=${new Date().getTime()}`}
            alt="GrocerKids logo"
            width={180}
            height={48}
            priority
          />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
