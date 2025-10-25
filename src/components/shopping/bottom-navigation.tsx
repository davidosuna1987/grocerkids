'use client';

import { Button } from '@/components/ui/button';
import { Trash2, List, Grid, Camera, Settings, Star } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { VIEW_TYPES_MAP } from '@/types';

type BottomNavigationProps = {
  onUploadClick: () => void;
  onClearClick: () => void;
  onSettingsClick: () => void;
  onFavoritesClick: () => void;
};

export default function BottomNavigation({
  onUploadClick,
  onClearClick,
  onSettingsClick,
  onFavoritesClick,
}: BottomNavigationProps) {
  const { viewType, setViewType, familyId } = useSettings();

  const handleViewToggle = () => {
    const newViewType = viewType === VIEW_TYPES_MAP.list ? VIEW_TYPES_MAP.grid : VIEW_TYPES_MAP.list;
    setViewType(newViewType);
  };

  return (
    <footer key={viewType} className="sticky bottom-0 bg-card shadow-[0_-2px_5px_rgba(0,0,0,0.05)] rounded-t-2xl max-w-3xl mx-auto w-full px-4 z-50">
      <nav className="flex justify-between items-center h-20 px-4 mx-auto lg:px-0">
        <Button
          variant="ghost"
          className="flex flex-col items-center text-black/60 dark:text-white/60 h-auto hover:bg-transparent [&:hover>span]:text-destructive [&:hover>svg]:text-destructive"
          onClick={onClearClick}
        >
          <Trash2 className='!size-6 sm:!size-7' />
        </Button>

        <Button
          variant="ghost"
          className="flex flex-col items-center text-black/60 dark:text-white/60 h-auto hover:bg-transparent [&:hover>span]:text-primary [&:hover>svg]:text-primary"
          onClick={handleViewToggle}
        >
          {viewType === 'list' ? (
            <Grid className="!size-6 sm:!size-7" />
          ) : (
            <List className="!size-6 sm:!size-7" />
          )}
        </Button>

        <Button
          variant="ghost"
          className="text-card-foreground h-auto hover:bg-transparent"
          onClick={onUploadClick}
        >
          <div className="flex justify-center items-center size-16 sm:size-24 bg-primary rounded-full text-primary-foreground -mt-6 sm:-mt-8 shadow-lg shadow-primary/30">
            <Camera className='!size-8 sm:!size-10' />
          </div>
        </Button>

        <Button
          variant="ghost"
          className="flex flex-col items-center text-black/60 dark:text-white/60 h-auto hover:bg-transparent [&:hover>span]:text-primary [&:hover>svg]:text-primary"
          onClick={onFavoritesClick}
        >
          <Star className='!size-6 sm:!size-7' />
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center text-black/60 dark:text-white/60 h-auto hover:bg-transparent [&:hover>span]:text-primary [&:hover>svg]:text-primary"
          onClick={onSettingsClick}
        >
          <Settings className="!size-6 sm:!size-7" />
        </Button>
      </nav>
    </footer>
  );
}
