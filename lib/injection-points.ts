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
  // ===== FRONTAL (frente) =====
  { id: 'frontal-sup-1', zona: 'Frontal', nombre: 'Frontal superior izquierdo', cx: 260, cy: 200 },
  { id: 'frontal-sup-2', zona: 'Frontal', nombre: 'Frontal superior central izq', cx: 350, cy: 195 },
  { id: 'frontal-sup-3', zona: 'Frontal', nombre: 'Frontal superior central der', cx: 450, cy: 195 },
  { id: 'frontal-sup-4', zona: 'Frontal', nombre: 'Frontal superior derecho', cx: 540, cy: 200 },
  { id: 'frontal-inf-1', zona: 'Frontal', nombre: 'Frontal inferior izquierdo', cx: 250, cy: 250 },
  { id: 'frontal-inf-2', zona: 'Frontal', nombre: 'Frontal inferior central izq', cx: 350, cy: 245 },
  { id: 'frontal-inf-3', zona: 'Frontal', nombre: 'Frontal inferior central der', cx: 450, cy: 245 },
  { id: 'frontal-inf-4', zona: 'Frontal', nombre: 'Frontal inferior derecho', cx: 550, cy: 250 },

  // ===== GLABELA (entre cejas) =====
  { id: 'glabela-corrugador-izq-medial', zona: 'Glabela', nombre: 'Corrugador izquierdo medial', cx: 375, cy: 375 },
  { id: 'glabela-corrugador-izq-lateral', zona: 'Glabela', nombre: 'Corrugador izquierdo lateral', cx: 340, cy: 365 },
  { id: 'glabela-procerus', zona: 'Glabela', nombre: 'Procerus (central)', cx: 400, cy: 395 },
  { id: 'glabela-corrugador-der-medial', zona: 'Glabela', nombre: 'Corrugador derecho medial', cx: 425, cy: 375 },
  { id: 'glabela-corrugador-der-lateral', zona: 'Glabela', nombre: 'Corrugador derecho lateral', cx: 460, cy: 365 },

  // ===== COLA DE CEJA =====
  { id: 'cola-ceja-izq', zona: 'Cola de ceja', nombre: 'Cola de ceja izquierda', cx: 230, cy: 345 },
  { id: 'cola-ceja-der', zona: 'Cola de ceja', nombre: 'Cola de ceja derecha', cx: 570, cy: 345 },

  // ===== PATAS DE GALLO (lateral del ojo) =====
  { id: 'pata-gallo-izq-sup', zona: 'Patas de gallo', nombre: 'Pata de gallo izq superior', cx: 220, cy: 395 },
  { id: 'pata-gallo-izq-med', zona: 'Patas de gallo', nombre: 'Pata de gallo izq media', cx: 205, cy: 425 },
  { id: 'pata-gallo-izq-inf', zona: 'Patas de gallo', nombre: 'Pata de gallo izq inferior', cx: 225, cy: 455 },
  { id: 'pata-gallo-der-sup', zona: 'Patas de gallo', nombre: 'Pata de gallo der superior', cx: 580, cy: 395 },
  { id: 'pata-gallo-der-med', zona: 'Patas de gallo', nombre: 'Pata de gallo der media', cx: 595, cy: 425 },
  { id: 'pata-gallo-der-inf', zona: 'Patas de gallo', nombre: 'Pata de gallo der inferior', cx: 575, cy: 455 },

  // ===== BUNNY LINES (nariz) =====
  { id: 'bunny-izq', zona: 'Bunny lines', nombre: 'Bunny line izquierdo', cx: 365, cy: 470 },
  { id: 'bunny-der', zona: 'Bunny lines', nombre: 'Bunny line derecho', cx: 435, cy: 470 },

  // ===== LABIO SUPERIOR =====
  { id: 'labio-sup-izq-1', zona: 'Labio superior', nombre: 'Labio superior izq exterior', cx: 330, cy: 580 },
  { id: 'labio-sup-izq-2', zona: 'Labio superior', nombre: 'Labio superior izq interior', cx: 375, cy: 575 },
  { id: 'labio-sup-der-1', zona: 'Labio superior', nombre: 'Labio superior der interior', cx: 425, cy: 575 },
  { id: 'labio-sup-der-2', zona: 'Labio superior', nombre: 'Labio superior der exterior', cx: 470, cy: 580 },

  // ===== COMISURAS (DAO) =====
  { id: 'dao-izq', zona: 'Comisuras (DAO)', nombre: 'Comisura izquierda (DAO)', cx: 345, cy: 625 },
  { id: 'dao-der', zona: 'Comisuras (DAO)', nombre: 'Comisura derecha (DAO)', cx: 455, cy: 625 },

  // ===== MENTÓN =====
  { id: 'menton-izq-sup', zona: 'Mentón', nombre: 'Mentón izq superior', cx: 375, cy: 685 },
  { id: 'menton-der-sup', zona: 'Mentón', nombre: 'Mentón der superior', cx: 425, cy: 685 },
  { id: 'menton-izq-inf', zona: 'Mentón', nombre: 'Mentón izq inferior', cx: 380, cy: 715 },
  { id: 'menton-der-inf', zona: 'Mentón', nombre: 'Mentón der inferior', cx: 420, cy: 715 },

  // ===== MASETERO (mandíbula) =====
  { id: 'masetero-izq-1', zona: 'Masetero', nombre: 'Masetero izq superior', cx: 300, cy: 660 },
  { id: 'masetero-izq-2', zona: 'Masetero', nombre: 'Masetero izq medio', cx: 280, cy: 700 },
  { id: 'masetero-izq-3', zona: 'Masetero', nombre: 'Masetero izq inferior', cx: 320, cy: 700 },
  { id: 'masetero-der-1', zona: 'Masetero', nombre: 'Masetero der superior', cx: 500, cy: 660 },
  { id: 'masetero-der-2', zona: 'Masetero', nombre: 'Masetero der medio', cx: 520, cy: 700 },
  { id: 'masetero-der-3', zona: 'Masetero', nombre: 'Masetero der inferior', cx: 480, cy: 700 },

  // ===== PLATISMA (cuello) =====
  { id: 'platisma-1', zona: 'Platisma', nombre: 'Banda izquierda superior', cx: 350, cy: 810 },
  { id: 'platisma-2', zona: 'Platisma', nombre: 'Banda izquierda media', cx: 350, cy: 855 },
  { id: 'platisma-3', zona: 'Platisma', nombre: 'Banda izquierda inferior', cx: 350, cy: 900 },
  { id: 'platisma-4', zona: 'Platisma', nombre: 'Banda derecha superior', cx: 450, cy: 810 },
  { id: 'platisma-5', zona: 'Platisma', nombre: 'Banda derecha media', cx: 450, cy: 855 },
  { id: 'platisma-6', zona: 'Platisma', nombre: 'Banda derecha inferior', cx: 450, cy: 900 },
];

export const ZONAS_INYECCION = Array.from(
  new Set(INJECTION_POINTS.map((p) => p.zona))
);
