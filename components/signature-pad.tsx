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
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-slate-500 underline hover:text-slate-700"
        >
          Limpiar
        </button>
      </div>
      <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white">
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            className: 'w-full h-40 rounded-lg cursor-crosshair',
            width: 600,
            height: 160,
          }}
          onEnd={handleEnd}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">Firme con el mouse o con el dedo si usa tablet.</p>
    </div>
  );
}
