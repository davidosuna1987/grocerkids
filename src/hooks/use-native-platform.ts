import { useEffect, useState } from "react";

export type Platform = "android" | "ios" | "web";

export function useNativePlatform(): { platform: Platform, isNative: boolean } 
{
    const [platform, setPlatform] = useState<Platform>("web");

    useEffect(() => {
        if (typeof navigator === "undefined") return;

        const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

        if (/android/i.test(ua)) {
            setPlatform("android");
        } else if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
            setPlatform("ios");
        } else {
            setPlatform("web");
        }
    }, []);

    return {
        platform,
        isNative: platform !== "web"
    };
}
