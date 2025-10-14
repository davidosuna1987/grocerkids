'use client';

import { useSettings } from "@/contexts/settings-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function JoinFamily({ familyCode }: { familyCode: string }) {
    const router = useRouter();
    const { joinFamily } = useSettings();
    const { toast } = useToast();
    const [hasRun, setHasRun] = useState(false);
  
    useEffect(() => {
      if (familyCode && !hasRun) {
        setHasRun(true);
        const handleJoin = async () => {
          await joinFamily(familyCode);
          router.push('/');
        };
        handleJoin();
      }
    }, [familyCode, joinFamily, router, toast, hasRun]);
  
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