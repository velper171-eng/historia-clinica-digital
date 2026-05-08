'use client';

import type { AllergyRecord } from '../lib/form-schema';
import { ALERGIAS } from '../lib/form-schema';

type Props = {
  value: AllergyRecord;
  onChange: (next: AllergyRecord) => void;
};

export function AllergyChecklist({ value, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-stone/10 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand/30">
            <tr>
              <th className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest text-stone/50">
                Alergias medicamentosas
              </th>
              <th className="w-20 px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-stone/50">Sí</th>
            </tr>
          </thead>
          <tbody>
            {ALERGIAS.map(({ key, label }) => (
              <tr key={key} className="border-t border-stone/5 hover:bg-blush/20 transition-colors">
                <td className="px-3 py-3">
                  <label htmlFor={`alergia-${key}`} className="cursor-pointer font-bold text-stone">
                    {label}
                  </label>
                </td>
                <td className="px-3 py-3 text-center">
                  <input
                    id={`alergia-${key}`}
                    type="checkbox"
                    className="h-5 w-5 cursor-pointer accent-sage rounded-lg border-stone/20"
                    checked={value[key]}
                    onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
                  />
                </td>
              </tr>
            ))}
            <tr className="border-t border-stone/5 hover:bg-blush/20 transition-colors">
              <td className="px-3 py-3">
                <label htmlFor="alergia-otros" className="block cursor-pointer font-bold text-stone">
                  Otros
                </label>
                <input
                  type="text"
                  placeholder="Especifique la alergia"
                  className="mt-1 w-full min-w-0 rounded-xl border border-stone/10 bg-blush/30 px-3 py-1.5 text-xs font-medium text-stone focus:border-sage focus:outline-none transition-all placeholder:text-stone/20"
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
              <td className="px-3 py-3 text-center">
                <input
                  id="alergia-otros"
                  type="checkbox"
                  className="h-5 w-5 cursor-pointer accent-sage rounded-lg border-stone/20"
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
    </div>
  );
}
