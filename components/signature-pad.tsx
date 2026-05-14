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


  const containerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);

  // Mantener el ref actualizado
  useEffect(() => {
    valueRef.current = value;
    if (value) setIsLocked(true);
  }, [value]);
  
  useEffect(() => {
    const container = containerRef.current;
    const sig = sigRef.current;
    if (!container || !sig) return;

    const restoreSignature = () => {
      const val = valueRef.current;
      if (val && sig) {
        // Un pequeño delay asegura que el canvas esté listo para pintar
        setTimeout(() => {
          sig.fromDataURL(val);
        }, 50);
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const canvas = sig.getCanvas();
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        
        const newWidth = Math.floor(width * ratio);
        const newHeight = Math.floor(height * ratio);

        if (canvas.width !== newWidth || canvas.height !== newHeight) {
          canvas.width = newWidth;
          canvas.height = newHeight;
          canvas.getContext('2d')?.scale(ratio, ratio);
          restoreSignature();
        }
      }
    });

    resizeObserver.observe(container);
    
    // Intento inicial de restauración
    restoreSignature();

    return () => resizeObserver.disconnect();
  }, []); // Sin dependencias para que solo se monte una vez

  const handleEnd = () => {
    const sig = sigRef.current;
    if (!sig) return;
    if (sig.isEmpty()) {
      onChange('');
      setIsLocked(false);
      return;
    }
    onChange(sig.toDataURL('image/png'));
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
          {value && !isLocked && (
            <button
              type="button"
              onClick={lock}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-sage hover:text-sage/80 transition-colors"
            >
              <LockOpen size={10} />
              Fijar Firma
            </button>
          )}
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
          "relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden h-40 w-full max-w-2xl mx-auto",
          isLocked ? "border-sage/40 bg-sage/5" : "border-stone/20 bg-blush/10"
        )}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="#4A4A4A"
          canvasProps={{
            className: clsx(
              'w-full h-full block transition-opacity',
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
