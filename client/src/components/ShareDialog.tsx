import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Facebook, Twitter, Instagram, Music, Youtube, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  shareFacebook,
  shareTwitter,
  shareInstagram,
  shareTikTok,
  shareYouTube,
  copyToClipboard,
  downloadFile,
} from "@/lib/socialShare";

interface ShareDialogProps {
  projectName: string;
  imageDataUrl?: string;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function ShareDialog({ projectName, imageDataUrl, canvasRef }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Enlace copiado");
    } else {
      toast.error("Error al copiar");
    }
  };

  const handleDownload = () => {
    if (canvasRef?.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      downloadFile(dataUrl, `${projectName}.png`, "image/png");
      toast.success("Imagen descargada");
    } else if (imageDataUrl) {
      downloadFile(imageDataUrl, `${projectName}.png`, "image/png");
      toast.success("Imagen descargada");
    }
  };

  const handleShare = (platform: string) => {
    const options = {
      title: projectName,
      text: `Mira mi creación en Visual Content AI: ${projectName}`,
      url: shareUrl,
      imageUrl: imageDataUrl,
    };

    try {
      switch (platform) {
        case "facebook":
          shareFacebook(options);
          break;
        case "twitter":
          shareTwitter(options);
          break;
        case "instagram":
          shareInstagram(options);
          break;
        case "tiktok":
          shareTikTok(options);
          break;
        case "youtube":
          shareYouTube(options);
          break;
      }
      toast.success(`Abriendo ${platform}...`);
    } catch (error) {
      toast.error(`Error al compartir en ${platform}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Compartir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir Contenido</DialogTitle>
          <DialogDescription>
            Comparte tu creación en redes sociales o descárgala
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Redes Sociales */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Redes Sociales</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleShare("facebook")}
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleShare("twitter")}
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleShare("instagram")}
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleShare("tiktok")}
              >
                <Music className="w-4 h-4" />
                TikTok
              </Button>
            </div>
          </div>

          {/* Copiar Enlace */}
          <div>
            <Label htmlFor="share-link" className="text-sm font-semibold mb-2 block">
              Copiar Enlace
            </Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                className="text-xs"
              />
              <Button
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Descargar */}
          {(canvasRef?.current || imageDataUrl) && (
            <Button
              className="w-full"
              onClick={handleDownload}
            >
              Descargar Imagen
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
