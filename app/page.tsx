import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="mb-3 text-3xl font-bold text-slate-900 md:text-4xl">
          Historia Clínica Digital
        </h1>
        <p className="mb-8 text-slate-600">
          Plataforma especializada para la gestión integral de historias clínicas en procedimientos de medicina estética. Facilite el registro de antecedentes, la firma de consentimientos informados y el mapeo detallado de puntos de aplicación con exportación inmediata a PDF profesional.
        </p>

        <ul className="mb-8 space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-600">✓</span>
            <span>Consentimiento informado con firma digital</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-600">✓</span>
            <span>Cuestionario de antecedentes personales y familiares</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-600">✓</span>
            <span>Diagrama facial interactivo con ~50 puntos predefinidos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-600">✓</span>
            <span>PDF descargable de 4 páginas listo para imprimir</span>
          </li>
        </ul>

        <Link
          href="/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          Iniciar nueva historia clínica →
        </Link>

        <p className="mt-6 text-xs text-slate-500">
          Los datos no se almacenan en ningún servidor. Se procesan localmente en su dispositivo y
          se exportan únicamente como archivo PDF.
        </p>
      </div>
    </main>
  );
}
