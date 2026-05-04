export type InjectionPointDefinition = {
  id: string;
  zona: string;
  nombre: string;
  cx: number;
  cy: number;
};

// SVG viewBox: 800 x 1000, calibrado contra public/face-template.jpg
// Anatomía de referencia (post-zoom):
//   Línea de pelo  y ≈ 230
//   Cejas          y ≈ 358-385  (izq x ≈ 250-340, der x ≈ 405-490)
//   Glabela        ≈ (375, 385)
//   Ojos           y ≈ 410      (izq x ≈ 305, der x ≈ 450)
//   Bunny          y ≈ 450
//   Punta nariz    ≈ (375, 495)
//   Labios sup     y ≈ 530-540
//   Comisuras      y ≈ 560
//   Mentón         y ≈ 615-650
//   Cuello visible y ≈ 715-755
export const INJECTION_POINTS: InjectionPointDefinition[] = [
  // ===== FRONTAL (frente, encima cejas) =====
  { id: 'frontal-sup-1', zona: 'Frontal', nombre: 'Frontal superior izquierdo', cx: 310, cy: 260 },
  { id: 'frontal-sup-2', zona: 'Frontal', nombre: 'Frontal superior central izq', cx: 370, cy: 245 },
  { id: 'frontal-sup-3', zona: 'Frontal', nombre: 'Frontal superior central der', cx: 430, cy: 245 },
  { id: 'frontal-sup-4', zona: 'Frontal', nombre: 'Frontal superior derecho', cx: 490, cy: 260 },
  { id: 'frontal-inf-1', zona: 'Frontal', nombre: 'Frontal inferior izquierdo', cx: 325, cy: 315 },
  { id: 'frontal-inf-2', zona: 'Frontal', nombre: 'Frontal inferior central izq', cx: 375, cy: 305 },
  { id: 'frontal-inf-3', zona: 'Frontal', nombre: 'Frontal inferior central der', cx: 425, cy: 305 },
  { id: 'frontal-inf-4', zona: 'Frontal', nombre: 'Frontal inferior derecho', cx: 475, cy: 315 },

  // ===== GLABELA (entre cejas + procerus) =====
  { id: 'glabela-corrugador-izq-medial', zona: 'Glabela', nombre: 'Corrugador izquierdo medial', cx: 380, cy: 370 },
  { id: 'glabela-corrugador-izq-lateral', zona: 'Glabela', nombre: 'Corrugador izquierdo lateral', cx: 345, cy: 365 },
  { id: 'glabela-procerus', zona: 'Glabela', nombre: 'Procerus (central)', cx: 400, cy: 395 },
  { id: 'glabela-corrugador-der-medial', zona: 'Glabela', nombre: 'Corrugador derecho medial', cx: 420, cy: 370 },
  { id: 'glabela-corrugador-der-lateral', zona: 'Glabela', nombre: 'Corrugador derecho lateral', cx: 455, cy: 365 },

  // ===== COLA DE CEJA =====
  { id: 'cola-ceja-izq', zona: 'Cola de ceja', nombre: 'Cola de ceja izquierda', cx: 250, cy: 380 },
  { id: 'cola-ceja-der', zona: 'Cola de ceja', nombre: 'Cola de ceja derecha', cx: 550, cy: 380 },

  // ===== PATAS DE GALLO (lateral del ojo) =====
  { id: 'pata-gallo-izq-sup', zona: 'Patas de gallo', nombre: 'Pata de gallo izq superior', cx: 240, cy: 410 },
  { id: 'pata-gallo-izq-med', zona: 'Patas de gallo', nombre: 'Pata de gallo izq media', cx: 230, cy: 440 },
  { id: 'pata-gallo-izq-inf', zona: 'Patas de gallo', nombre: 'Pata de gallo izq inferior', cx: 250, cy: 470 },
  { id: 'pata-gallo-der-sup', zona: 'Patas de gallo', nombre: 'Pata de gallo der superior', cx: 560, cy: 410 },
  { id: 'pata-gallo-der-med', zona: 'Patas de gallo', nombre: 'Pata de gallo der media', cx: 570, cy: 440 },
  { id: 'pata-gallo-der-inf', zona: 'Patas de gallo', nombre: 'Pata de gallo der inferior', cx: 550, cy: 470 },

  // ===== BUNNY LINES (laterales nariz, sobre el puente) =====
  { id: 'bunny-izq', zona: 'Bunny lines', nombre: 'Bunny line izquierdo', cx: 385, cy: 470 },
  { id: 'bunny-der', zona: 'Bunny lines', nombre: 'Bunny line derecho', cx: 415, cy: 470 },

  // ===== LABIO SUPERIOR (borde bermellón) =====
  { id: 'labio-sup-izq-1', zona: 'Labio superior', nombre: 'Labio superior izq exterior', cx: 355, cy: 590 },
  { id: 'labio-sup-izq-2', zona: 'Labio superior', nombre: 'Labio superior izq interior', cx: 380, cy: 585 },
  { id: 'labio-sup-der-1', zona: 'Labio superior', nombre: 'Labio superior der interior', cx: 420, cy: 585 },
  { id: 'labio-sup-der-2', zona: 'Labio superior', nombre: 'Labio superior der exterior', cx: 445, cy: 590 },

  // ===== COMISURAS (DAO) =====
  { id: 'dao-izq', zona: 'Comisuras (DAO)', nombre: 'Comisura izquierda (DAO)', cx: 350, cy: 625 },
  { id: 'dao-der', zona: 'Comisuras (DAO)', nombre: 'Comisura derecha (DAO)', cx: 450, cy: 625 },

  // ===== MENTÓN =====
  { id: 'menton-izq-sup', zona: 'Mentón', nombre: 'Mentón izq superior', cx: 385, cy: 690 },
  { id: 'menton-der-sup', zona: 'Mentón', nombre: 'Mentón der superior', cx: 415, cy: 690 },
  { id: 'menton-izq-inf', zona: 'Mentón', nombre: 'Mentón izq inferior', cx: 390, cy: 720 },
  { id: 'menton-der-inf', zona: 'Mentón', nombre: 'Mentón der inferior', cx: 410, cy: 720 },

  // ===== MASETERO (mandíbula lateral) =====
  { id: 'masetero-izq-1', zona: 'Masetero', nombre: 'Masetero izq superior', cx: 320, cy: 670 },
  { id: 'masetero-izq-2', zona: 'Masetero', nombre: 'Masetero izq medio', cx: 300, cy: 710 },
  { id: 'masetero-izq-3', zona: 'Masetero', nombre: 'Masetero izq inferior', cx: 340, cy: 710 },
  { id: 'masetero-der-1', zona: 'Masetero', nombre: 'Masetero der superior', cx: 480, cy: 670 },
  { id: 'masetero-der-2', zona: 'Masetero', nombre: 'Masetero der medio', cx: 500, cy: 710 },
  { id: 'masetero-der-3', zona: 'Masetero', nombre: 'Masetero der inferior', cx: 460, cy: 710 },

  // ===== PLATISMA (cuello, sobre piel visible) =====
  { id: 'platisma-1', zona: 'Platisma', nombre: 'Banda izquierda superior', cx: 355, cy: 820 },
  { id: 'platisma-2', zona: 'Platisma', nombre: 'Banda izquierda media', cx: 355, cy: 860 },
  { id: 'platisma-3', zona: 'Platisma', nombre: 'Banda izquierda inferior', cx: 355, cy: 900 },
  { id: 'platisma-4', zona: 'Platisma', nombre: 'Banda derecha superior', cx: 445, cy: 820 },
  { id: 'platisma-5', zona: 'Platisma', nombre: 'Banda derecha media', cx: 445, cy: 860 },
  { id: 'platisma-6', zona: 'Platisma', nombre: 'Banda derecha inferior', cx: 445, cy: 900 },
];

export const ZONAS_INYECCION = Array.from(
  new Set(INJECTION_POINTS.map((p) => p.zona))
);
