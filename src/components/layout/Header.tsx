import Image from 'next/image';
import { ThemeToggle } from '../theme-toggle';
import { Button } from '../ui/button';
import { Settings } from 'lucide-react';

type HeaderProps = {
  onSettingsClick: () => void;
};

export default function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Image
            src={`/logo.png?v=1`}
            alt="Grocer Kids logo"
            width={180}
            height={48}
            className="w-24"
            priority
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="p-0 hover:bg-transparent text-foreground/70 hover:text-primary"
            onClick={onSettingsClick}
          >
            <Settings className="!size-6" />
            <span className="sr-only">Ajustes</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
