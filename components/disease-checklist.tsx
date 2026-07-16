'use client';

import type { DiseaseRecord } from '../lib/form-schema';
import { ENFERMEDADES } from '../lib/form-schema';

type Props = {
  personales: DiseaseRecord;
  familiares: DiseaseRecord;
  onChangePersonales: (next: DiseaseRecord) => void;
  onChangeFamiliares: (next: DiseaseRecord) => void;
  idPrefix: string;
};

export function DiseaseChecklist({
  personales,
  familiares,
  onChangePersonales,
  onChangeFamiliares,
  idPrefix,
}: Props) {
  return (
    <div className="rounded-2xl border border-stone/10 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-sand/30">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-stone/50">
                Tipo de Enfermedad
              </th>
              <th className="w-24 px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-stone/50">
                Personal
              </th>
              <th className="w-24 px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-stone/50">
                Familiar
              </th>
            </tr>
          </thead>
          <tbody>
            {ENFERMEDADES.map(({ key, label, descripcion }) => {
              const inputIdPersonal = `${idPrefix}-personal-${key}`;
              const inputIdFamiliar = `${idPrefix}-familiar-${key}`;
              return (
                <tr key={key} className="border-t border-stone/5 hover:bg-blush/20 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <span className="block font-bold text-stone">
                      {label}
                    </span>
                    <p className="mt-0.5 text-[11px] text-stone/50 font-medium leading-relaxed">{descripcion}</p>
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <input
                      id={inputIdPersonal}
                      type="checkbox"
                      className="h-5 w-5 cursor-pointer accent-sage rounded-lg border-stone/20"
                      checked={personales[key].presenta}
                      onChange={(e) =>
                        onChangePersonales({
                          ...personales,
                          [key]: { ...personales[key], presenta: e.target.checked },
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <input
                      id={inputIdFamiliar}
                      type="checkbox"
                      className="h-5 w-5 cursor-pointer accent-sage rounded-lg border-stone/20"
                      checked={familiares[key].presenta}
                      onChange={(e) =>
                        onChangeFamiliares({
                          ...familiares,
                          [key]: { ...familiares[key], presenta: e.target.checked },
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
    </div>
  );
}
