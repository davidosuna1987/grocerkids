import { IMAGE_PROVIDERS_MAP } from "@/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useSettings } from "@/contexts/settings-context";

export default function ProviderSelector() {

      const { provider, setProvider } = useSettings();
    return (
        <div className="flex flex-col gap-2">
            <Label>Proveedor de imágenes</Label>
            <div className='grid grid-cols-3 gap-2'>
                <Button
                    variant={provider === IMAGE_PROVIDERS_MAP.google ? 'default' : 'ghost'}
                    onClick={() => setProvider(IMAGE_PROVIDERS_MAP.google)}
                    className='border'
                >
                    Google
                </Button>
                <Button
                    variant={provider === IMAGE_PROVIDERS_MAP.pexels ? 'default' : 'ghost'}
                    onClick={() => setProvider(IMAGE_PROVIDERS_MAP.pexels)}
                    className='border'
                >
                    Pexels
                </Button>
                <Button
                    variant={provider === IMAGE_PROVIDERS_MAP.pixabay ? 'default' : 'ghost'}
                    onClick={() => setProvider(IMAGE_PROVIDERS_MAP.pixabay)}
                    className='border'
                >
                    Pixabay
                </Button>
            </div>
        </div>
    )
} 