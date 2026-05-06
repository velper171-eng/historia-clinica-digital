'use client';

import type { DiseaseRecord } from '../lib/form-schema';
import { ENFERMEDADES } from '../lib/form-schema';

type Props = {
  value: DiseaseRecord;
  onChange: (next: DiseaseRecord) => void;
  idPrefix: string;
};

export function DiseaseChecklist({ value, onChange, idPrefix }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone/10 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-sand/30">
          <tr>
            <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-stone/50">Enfermedad</th>
            <th className="w-20 px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-stone/50">¿Padece?</th>
            <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-stone/50">Observación</th>
          </tr>
        </thead>
        <tbody>
          {ENFERMEDADES.map(({ key, label, descripcion }) => {
            const entry = value[key];
            const inputId = `${idPrefix}-${key}`;
            return (
              <tr key={key} className="border-t border-stone/5 hover:bg-blush/20 transition-colors">
                <td className="px-3 py-3 align-top">
                  <label htmlFor={inputId} className="block font-bold text-stone">
                    {label}
                  </label>
                  <p className="mt-0.5 text-[11px] text-stone/50 font-medium">{descripcion}</p>
                </td>
                <td className="px-3 py-3 text-center align-top">
                  <input
                    id={inputId}
                    type="checkbox"
                    className="h-5 w-5 cursor-pointer accent-sage rounded-lg border-stone/20"
                    checked={entry.presenta}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        [key]: { ...entry, presenta: e.target.checked },
                      })
                    }
                  />
                </td>
                <td className="px-3 py-3 align-top">
                  <input
                    type="text"
                    placeholder="Detalle (opcional)"
                    className="w-full rounded-xl border border-stone/10 bg-blush/30 px-3 py-1.5 text-xs font-medium text-stone focus:border-sage focus:outline-none transition-all placeholder:text-stone/20"
                    value={entry.observacion}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        [key]: { ...entry, observacion: e.target.value },
                      })
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
