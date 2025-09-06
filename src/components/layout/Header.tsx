import { ShoppingCart } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline tracking-tight text-primary sm:text-3xl">
            GrocerKids
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
