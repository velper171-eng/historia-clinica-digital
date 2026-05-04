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
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-700">Enfermedad</th>
            <th className="w-16 px-3 py-2 text-center font-medium text-slate-700">¿Padece?</th>
            <th className="px-3 py-2 text-left font-medium text-slate-700">Observación</th>
          </tr>
        </thead>
        <tbody>
          {ENFERMEDADES.map(({ key, label, descripcion }) => {
            const entry = value[key];
            const inputId = `${idPrefix}-${key}`;
            return (
              <tr key={key} className="border-t border-slate-200">
                <td className="px-3 py-2 align-top">
                  <label htmlFor={inputId} className="block font-medium text-slate-800">
                    {label}
                  </label>
                  <p className="mt-0.5 text-xs text-slate-500">{descripcion}</p>
                </td>
                <td className="px-3 py-2 text-center align-top">
                  <input
                    id={inputId}
                    type="checkbox"
                    className="h-5 w-5 cursor-pointer accent-emerald-600"
                    checked={entry.presenta}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        [key]: { ...entry, presenta: e.target.checked },
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    type="text"
                    placeholder="Detalle (opcional)"
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
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
