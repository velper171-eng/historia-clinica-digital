'use client';

import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Lock, LockOpen } from 'lucide-react';
import { clsx } from 'clsx';

type Props = {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
};

export function SignaturePad({ value, onChange, label = 'Firma' }: Props) {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [isLocked, setIsLocked] = useState(!!value);


  useEffect(() => {
    const sig = sigRef.current;
    if (!sig) return;
    if (value && sig.isEmpty()) {
      sig.fromDataURL(value);
      setIsLocked(true);
    }
  }, [value]);

  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const sig = sigRef.current;
      if (!container || !sig) return;
      
      const canvas = sig.getCanvas();
      const rect = container.getBoundingClientRect();
      
      // Ajustamos el canvas para que coincida con el tamaño visual exacto
      // Usamos el ratio de píxeles para que se vea nítido en pantallas retina/iPad
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      
      if (canvas.width !== rect.width * ratio || canvas.height !== rect.height * ratio) {
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        canvas.getContext('2d')?.scale(ratio, ratio);
        
        // Al redimensionar el canvas se borra, así que intentamos recargar el valor si existe
        if (value) {
          sig.fromDataURL(value);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [value]);

  const handleEnd = () => {
    const sig = sigRef.current;
    if (!sig) return;
    if (sig.isEmpty()) {
      onChange('');
      setIsLocked(false);
      return;
    }
    onChange(sig.toDataURL('image/png'));
    // Bloqueo automático al terminar el trazo para cumplir con "cuando se firme se bloquee"
    setIsLocked(true);
  };

  const clear = () => {
    sigRef.current?.clear();
    onChange('');
    setIsLocked(false);
  };

  const lock = () => {
    if (value) {
      setIsLocked(true);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-bold text-stone">{label}</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={clear}
            className="text-[10px] font-black uppercase tracking-widest text-stone/40 hover:text-red-400 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
      <div 
        ref={containerRef} 
        className={clsx(
          "relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden",
          isLocked ? "border-sage/40 bg-sage/5" : "border-stone/20 bg-blush/10"
        )}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="#4A4A4A"
          canvasProps={{
            className: clsx(
              'w-full h-40 block transition-opacity',
              isLocked ? 'cursor-not-allowed pointer-events-none opacity-60' : 'cursor-crosshair opacity-100'
            ),
          }}
          onEnd={handleEnd}
        />
        
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px] animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-white/90 p-2.5 shadow-sm border border-sage/20 scale-90 sm:scale-100">
              <Lock size={14} className="text-sage" />
              <span className="text-[9px] font-black text-sage uppercase tracking-tighter">Firma Protegida</span>
            </div>
          </div>
        )}
      </div>
      <p className="mt-2 text-[10px] font-medium text-stone/40">
        {isLocked 
          ? "La firma está bloqueada para evitar cambios. Use 'Limpiar' para firmar de nuevo." 
          : "Firme con el mouse o con el dedo. Luego pulse 'Fijar' para bloquearla."}
      </p>
    </div>
  );
}
