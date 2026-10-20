import { useState, type FormEvent } from 'react';
import { Lock, Mail, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface LoginProps {
  onBack: () => void;
}

export function Login({ onBack }: LoginProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) setError(error);
  };

  return (
    <div className="app-bg min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-pop-in">
        <div className="mb-6 text-center">
          <div className="relative mx-auto mb-3 h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-2xl pulse-glow" />
            <div className="relative grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-slate-900/70 glass">
              <ShieldCheck className="h-10 w-10 text-sky-300" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold uppercase text-white">
            Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Marcador Oficial · Colegio María Raquel
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 glass"
        >
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Correo
            </span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3 pl-10 pr-3 text-white placeholder-slate-500 outline-none focus:border-sky-400/50"
                placeholder="Tu correo autorizado"
              />
            </div>
          </label>

          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contraseña
            </span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-3 pl-10 pr-3 text-white placeholder-slate-500 outline-none focus:border-sky-400/50"
                placeholder="••••••••"
              />
            </div>
          </label>

          {error && (
            <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>Ingresar</>
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al marcador público
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Acceso restringido al administrador autorizado.
        </p>
      </div>
    </div>
  );
}
