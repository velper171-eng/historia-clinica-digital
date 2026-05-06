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
          border: '1px solid rgba(154, 140, 132, 0.2)',
          width: 'fit-content',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        }}
      >
        <button
          id="gender-mujer"
          onClick={() => setGender('mujer')}
          style={{
            padding: '10px 32px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'all 200ms',
            background: gender === 'mujer' ? '#A7B7A4' : '#fff',
            color: gender === 'mujer' ? '#fff' : '#9A8C84',
          }}
        >
          ♀ Mujer
        </button>
        <button
          id="gender-hombre"
          onClick={() => setGender('hombre')}
          style={{
            padding: '10px 32px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'all 200ms',
            background: gender === 'hombre' ? '#9A8C84' : '#fff',
            color: gender === 'hombre' ? '#fff' : '#9A8C84',
          }}
        >
          ♂ Hombre
        </button>
      </div>

      {/* Diagrama facial */}
      <div
        className="relative inline-block overflow-hidden rounded-[40px] shadow-2xl shadow-stone/10 border border-stone/5"
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
          <rect x="0" y="0" width="800" height="1000" fill="#9A8C84" fillOpacity="0.05" />

          {/* Puntos de inyección */}
          {points.map((p) => {
            const isActive = activeIds.has(p.id);
            const isHover = hoverId === p.id;
            return (
              <g key={p.id}>
                {/* Halo cuando activo */}
                {isActive && (
                  <circle cx={p.cx} cy={p.cy} r={24} fill="#C18C5D" fillOpacity={0.4} className="animate-pulse" />
                )}
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={isHover || isActive ? 15 : 10}
                  fill={isActive ? '#C18C5D' : 'rgba(255,255,255,0.9)'}
                  stroke={isActive ? '#fff' : '#5F715B'}
                  strokeWidth={isActive ? 4 : 2}
                  style={{ cursor: readOnly ? 'default' : 'pointer', transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                  onClick={() => !readOnly && onTogglePoint?.(p.id)}
                  onMouseEnter={() => setHoverId(p.id)}
                  onMouseLeave={() => setHoverId(null)}
                />
                {/* Punto interno para mejor visibilidad */}
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={isActive ? 5 : 2}
                  fill={isActive ? '#fff' : '#5F715B'}
                  pointerEvents="none"
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoverId && (
          <div className="pointer-events-none absolute left-1/2 bottom-8 -translate-x-1/2 rounded-full bg-stone px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-2xl border border-white/20">
            {points.find(p => p.id === hoverId)?.zona} — {points.find(p => p.id === hoverId)?.nombre}
          </div>
        )}
      </div>
    </div>
  );
}
