'use client';

import { useState } from 'react';
import { INJECTION_POINTS, INJECTION_POINTS_MAP } from '../lib/injection-points';

type Gender = 'mujer' | 'hombre';

type Props = {
  activeIds: Set<string>;
  onTogglePoint?: (id: string) => void;
  readOnly?: boolean;
  width?: number;
};

export function FaceDiagram({
  activeIds,
  onTogglePoint,
  readOnly = false,
  width = 400,
}: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>('mujer');

  const faceImage = gender === 'mujer' ? '/face-female-with-dots.png' : '/face-male-with-dots.png';
  const points = gender === 'mujer' ? INJECTION_POINTS_MAP.mujer : INJECTION_POINTS_MAP.hombre;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Selector de género */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          borderRadius: '999px',
          overflow: 'hidden',
          border: '2px solid #334155',
          width: 'fit-content',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        <button
          id="gender-mujer"
          onClick={() => setGender('mujer')}
          style={{
            padding: '8px 28px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            letterSpacing: '0.03em',
            transition: 'background 200ms, color 200ms',
            background: gender === 'mujer' ? '#e879a0' : '#1e293b',
            color: gender === 'mujer' ? '#fff' : '#94a3b8',
          }}
        >
          ♀ Mujer
        </button>
        <button
          id="gender-hombre"
          onClick={() => setGender('hombre')}
          style={{
            padding: '8px 28px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            letterSpacing: '0.03em',
            transition: 'background 200ms, color 200ms',
            background: gender === 'hombre' ? '#3b82f6' : '#1e293b',
            color: gender === 'hombre' ? '#fff' : '#94a3b8',
          }}
        >
          ♂ Hombre
        </button>
      </div>

      {/* Diagrama facial */}
      <div
        className="relative inline-block overflow-hidden rounded-lg"
        style={{ width, aspectRatio: '800/1000' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={faceImage}
          src={faceImage}
          alt={gender === 'mujer' ? 'Plantilla facial femenina' : 'Plantilla facial masculina'}
          className="absolute inset-0 block h-full w-full object-cover"
          crossOrigin="anonymous"
          style={{ transition: 'opacity 300ms ease' }}
        />
        <svg
          viewBox="0 0 800 1000"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 block h-full w-full select-none"
          role="img"
          aria-label="Diagrama facial para puntos de inyección"
        >
          {/* Capa sutil para mejorar contraste de los puntos */}
          <rect x="0" y="0" width="800" height="1000" fill="#000" fillOpacity="0.02" />

          {/* Puntos de inyección */}
          {points.map((p) => {
            const isActive = activeIds.has(p.id);
            const isHover = hoverId === p.id;
            return (
              <g key={p.id}>
                {/* Halo cuando activo */}
                {isActive && (
                  <circle cx={p.cx} cy={p.cy} r={18} fill="#22c55e" fillOpacity={0.4} />
                )}
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={isHover || isActive ? 12 : 10}
                  fill={isActive ? '#22c55e' : 'transparent'}
                  stroke={isActive ? '#0f5132' : '#22c55e'}
                  strokeWidth={isActive ? 3 : 2}
                  strokeOpacity={isActive ? 1 : 0.6}
                  style={{ cursor: readOnly ? 'default' : 'pointer', transition: 'all 120ms' }}
                  onClick={() => !readOnly && onTogglePoint?.(p.id)}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                />
                {/* Punto interno para mejor visibilidad */}
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={2}
                  fill={isActive ? '#0f5132' : '#22c55e'}
                  fillOpacity={isActive ? 1 : 0.6}
                  pointerEvents="none"
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoverId && (
          <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-md bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur">
            {points.find(p => p.id === hoverId)?.zona} — {points.find(p => p.id === hoverId)?.nombre}
          </div>
        )}
      </div>
    </div>
  );
}
