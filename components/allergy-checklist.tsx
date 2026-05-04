'use client';

import type { AllergyRecord } from '../lib/form-schema';
import { ALERGIAS } from '../lib/form-schema';

type Props = {
  value: AllergyRecord;
  onChange: (next: AllergyRecord) => void;
};

export function AllergyChecklist({ value, onChange }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-700">
              Marque con una X si ha presentado alguna alergia medicamentosa
            </th>
            <th className="w-20 px-3 py-2 text-center font-medium text-slate-700">Sí</th>
          </tr>
        </thead>
        <tbody>
          {ALERGIAS.map(({ key, label }) => (
            <tr key={key} className="border-t border-slate-200">
              <td className="px-3 py-2">
                <label htmlFor={`alergia-${key}`} className="cursor-pointer text-slate-800">
                  {label}
                </label>
              </td>
              <td className="px-3 py-2 text-center">
                <input
                  id={`alergia-${key}`}
                  type="checkbox"
                  className="h-5 w-5 cursor-pointer accent-emerald-600"
                  checked={value[key]}
                  onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
                />
              </td>
            </tr>
          ))}
          <tr className="border-t border-slate-200">
            <td className="px-3 py-2">
              <label htmlFor="alergia-otros" className="block cursor-pointer text-slate-800">
                Otros
              </label>
              <input
                type="text"
                placeholder="Especifique la alergia"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
                value={value.otros.descripcion}
                onChange={(e) =>
                  onChange({
                    ...value,
                    otros: { ...value.otros, descripcion: e.target.value },
                  })
                }
                disabled={!value.otros.presenta}
              />
            </td>
            <td className="px-3 py-2 text-center">
              <input
                id="alergia-otros"
                type="checkbox"
                className="h-5 w-5 cursor-pointer accent-emerald-600"
                checked={value.otros.presenta}
                onChange={(e) =>
                  onChange({
                    ...value,
                    otros: { ...value.otros, presenta: e.target.checked },
                  })
                }
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
