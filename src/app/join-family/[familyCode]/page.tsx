'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSettings } from '@/contexts/settings-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
      setHasRun(true); // Evita ejecuciones múltiples
      const handleJoin = async () => {
        await joinFamily(familyCode);
        router.push('/');
      };

      handleJoin();
    }
  }, [familyCode, joinFamily, router, toast, hasRun]);
  
  // Si no hay código, redirigir inmediatamente
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
