import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-slate-950/60">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-white">
          Colegio María Raquel
        </p>
        <p className="mt-1 text-sm text-slate-400">
          45 años al servicio de la comunidad · 19 al 23 de octubre de 2026
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
          Hecho con <Heart className="h-3.5 w-3.5 text-rose-400" /> para la comunidad educativa
        </p>
      </div>
    </footer>
  );
}
