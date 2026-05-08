'use client';

import { useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

type Props = {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
};

export function SignaturePad({ value, onChange, label = 'Firma' }: Props) {
  const sigRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    const sig = sigRef.current;
    if (!sig) return;
    if (value && sig.isEmpty()) {
      sig.fromDataURL(value);
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
      return;
    }
    onChange(sig.toDataURL('image/png'));
  };

  const clear = () => {
    sigRef.current?.clear();
    onChange('');
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-bold text-stone">{label}</label>
        <button
          type="button"
          onClick={clear}
          className="text-[10px] font-black uppercase tracking-widest text-stone/40 hover:text-red-400 transition-colors"
        >
          Limpiar
        </button>
      </div>
      <div ref={containerRef} className="rounded-2xl border-2 border-dashed border-stone/20 bg-blush/10 overflow-hidden">
        <SignatureCanvas
          ref={sigRef}
          penColor="#4A4A4A"
          canvasProps={{
            className: 'w-full h-40 cursor-crosshair block',
          }}
          onEnd={handleEnd}
        />
      </div>
      <p className="mt-2 text-[10px] font-medium text-stone/40">Firme con el mouse o con el dedo si usa tablet.</p>
    </div>
  );
}
