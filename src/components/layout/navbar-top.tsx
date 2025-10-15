import Image from 'next/image';
import { ThemeToggle } from '../theme-toggle';
import { useSettings } from '@/contexts/settings-context';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import CreateFamilySheet from '../settings/create-family-sheet';
import { useState } from 'react';
import SettingsSheet from '../settings/settings-sheet';
import { RefreshCcw, Home } from "lucide-react"

export default function NavbarTop() {
  const { familyId, familyName } = useSettings();
  const settingsButtonText = familyId ? familyName || familyId : 'Sincronizar';
  const [isSettingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [isCreateFamilySheetOpen, setCreateFamilySheetOpen] = useState(false);

  const handleOpenSettingsSheet = () => setSettingsSheetOpen(true)

  const getIcon = () => {
    switch (Boolean(familyId)) {
      case true:
        return <Home />
      case false:
        return <RefreshCcw />
      default:
        return
    }
  }

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
          <Button
            variant={familyId ? 'ghost' : undefined}
            className="border"
            onClick={handleOpenSettingsSheet}
          >
            {getIcon()}
            {settingsButtonText}
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <SettingsSheet
        open={isSettingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
        onCreateFamilyClick={() => {
          setSettingsSheetOpen(false);
          setCreateFamilySheetOpen(true);
        }}
        onlyFamily={true}
      />

      <CreateFamilySheet
        open={isCreateFamilySheetOpen}
        onOpenChange={setCreateFamilySheetOpen}
      />
    </header>
  );
}
