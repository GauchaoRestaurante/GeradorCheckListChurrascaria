import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  itemName?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  itemName,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setErrorMsg(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Falha ao abrir câmera:', err);
      // Fallback try without facingMode constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (finalErr: any) {
        setErrorMsg('Não foi possível acessar a câmera. Verifique se concedeu permissão ou use o botão de carregar arquivo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    // Square crop for checklist clarity
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;

    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    // Compress to sharp, manageable JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Capturar Foto para o Item
            </h3>
            {itemName && (
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
                {itemName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center text-white space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <p className="text-sm text-slate-300">{errorMsg}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Foto Capturada"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />
              {/* Overlay target frame to help center the item */}
              <div className="pointer-events-none absolute inset-8 border-2 border-dashed border-white/60 rounded-xl" />
              <div className="pointer-events-none absolute bottom-3 text-center text-xs text-white/90 bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
                Centralize o item no quadro
              </div>
            </>
          )}

          {isLoading && !errorMsg && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Iniciando câmera...
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {capturedImage ? (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Tirar Outra
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                <Check className="w-4 h-4" />
                Usar Esta Foto
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={toggleFacingMode}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                title="Alternar Câmera Frontal / Traseira"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Inverter
              </button>

              <button
                onClick={takeSnapshot}
                disabled={isLoading || !!errorMsg}
                className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-md disabled:opacity-50"
                title="Tirar Foto"
              >
                <Camera className="w-6 h-6" />
              </button>

              <button
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
