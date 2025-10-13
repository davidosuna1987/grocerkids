'use client';

import { Button } from '@/components/ui/button';
import { Trash2, List, Grid, Camera, Settings, Share2 } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { VIEW_TYPES_MAP } from '@/types';
import { useToast } from '@/hooks/use-toast';

type BottomNavigationProps = {
  onUploadClick: () => void;
  onClearClick: () => void;
  onSettingsClick: () => void;
  hasProducts: boolean;
};

export default function BottomNavigation({
  onUploadClick,
  onClearClick,
  onSettingsClick,
  hasProducts,
}: BottomNavigationProps) {
  const { viewType, setViewType, familyId } = useSettings();
  const { toast } = useToast();

  const handleViewToggle = () => {
    const newViewType = viewType === VIEW_TYPES_MAP.list ? VIEW_TYPES_MAP.grid : VIEW_TYPES_MAP.list;
    setViewType(newViewType);
  };
  
  const handleShare = async () => {
    if (familyId && navigator.share) {
      try {
        await navigator.share({
          title: 'Grocer Kids: Lista de la compra',
          text: `¡Únete a mi lista de la compra en Grocer Kids! Usa este código: ${familyId}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error al compartir:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo compartir la lista.',
        });
      }
    } else if (familyId) {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(familyId);
      toast({ title: '¡Copiado!', description: 'Código de lista copiado al portapapeles.' });
    }
  };

  return (
    <footer key={viewType} className="sticky bottom-0 bg-card shadow-[0_-2px_5px_rgba(0,0,0,0.05)] rounded-t-2xl max-w-3xl mx-auto w-full px-4 z-50">
      <nav className="flex justify-between items-center h-20 px-4 mx-auto lg:px-0">
        <Button
          variant="ghost"
          className="flex flex-col items-center text-muted-foreground h-auto hover:bg-transparent [&:hover>span]:text-primary [&:hover>svg]:text-primary"
          onClick={onClearClick}
          disabled={!hasProducts}
        >
          <Trash2 className='!size-7' />
        </Button>

        <Button
          variant="ghost"
          className="flex flex-col items-center text-muted-foreground h-auto hover:bg-transparent [&:hover>span]:text-primary [&:hover>svg]:text-primary"
          onClick={handleViewToggle}
        >
          {viewType === 'list' ? (
            <Grid className="!size-7" />
          ) : (
            <List className="!size-7" />
          )}
        </Button>

        <Button
          variant="ghost"
          className="text-card-foreground h-auto hover:bg-transparent"
          onClick={onUploadClick}
        >
          <div className="flex justify-center items-center size-24 bg-primary rounded-full text-primary-foreground -mt-8 shadow-lg shadow-primary/30">
            <Camera className='!size-10' />
          </div>
        </Button>

        <Button
          variant="ghost"
          className="flex flex-col items-center text-muted-foreground h-auto hover:bg-transparent [&:hover>span]:text-primary [&:hover>svg]:text-primary"
          onClick={onSettingsClick}
        >
          <Settings className="!size-7" />
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center text-muted-foreground h-auto hover:bg-transparent [&:hover>span]:text-primary [&:hover>svg]:text-primary"
          onClick={handleShare}
          disabled={!familyId}
        >
          <Share2 className='!size-7' />
        </Button>
      </nav>
    </footer>
  );
}
