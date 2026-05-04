'use client';

import { useState } from 'react';
import { INJECTION_POINTS } from '../lib/injection-points';

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
  const hover = hoverId ? INJECTION_POINTS.find((p) => p.id === hoverId) : null;

  return (
    <div className="relative inline-block overflow-hidden rounded-lg" style={{ width, aspectRatio: '800/1000' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/face-real.png"
        alt="Plantilla facial"
        className="absolute inset-0 block h-full w-full object-cover"
        crossOrigin="anonymous"
      />
      <svg
        viewBox="0 0 800 1000"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 block h-full w-full select-none"
        role="img"
        aria-label="Diagrama facial para puntos de inyección"
      >

        {/* Capa sutil para mejorar contraste de los puntos */}
        <rect x="0" y="0" width="800" height="1000" fill="#000" fillOpacity="0.05" />

        {/* Puntos de inyección */}
        {INJECTION_POINTS.map((p) => {
          const isActive = activeIds.has(p.id);
          const isHover = hoverId === p.id;
          return (
            <g key={p.id}>
              {/* Halo cuando activo */}
              {isActive && (
                <circle cx={p.cx} cy={p.cy} r={18} fill="#22c55e" fillOpacity={0.3} />
              )}
              <circle
                cx={p.cx}
                cy={p.cy}
                r={isHover || isActive ? 11 : 9}
                fill={isActive ? '#22c55e' : '#ffffff'}
                stroke={isActive ? '#0f5132' : '#0f172a'}
                strokeWidth={isActive ? 3 : 2}
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
                fill={isActive ? '#0f5132' : '#0f172a'}
                pointerEvents="none"
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hover && (
        <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-md bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur">
          {hover.zona} — {hover.nombre}
        </div>
      )}
    </div>
  );
}
