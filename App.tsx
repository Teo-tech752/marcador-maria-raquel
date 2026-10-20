import { useEffect, useState } from 'react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { PublicPage } from '@/pages/PublicPage';
import { Login } from '@/admin/Login';
import { AdminDashboard } from '@/admin/AdminDashboard';

function getRoute(): 'public' | 'admin' {
  const p = window.location.pathname.replace(/\/+$/, '');
  return p === '/admin' ? 'admin' : 'public';
}

function navigate(path: string) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function AdminRoute() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const [route, setRoute] = useState<'public' | 'admin'>(getRoute());

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (route === 'public') {
    return <PublicPage />;
  }

  if (loading) {
    return (
      <div className="app-bg min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
      </div>
    );
  }

  if (!session) {
    return <Login onBack={() => navigate('/')} />;
  }

  if (!isAdmin) {
    return <AccessDenied onBack={() => navigate('/')} onSignOut={signOut} />;
  }

  return <AdminDashboard onExit={() => navigate('/')} />;
}

function AccessDenied({
  onBack,
  onSignOut,
}: {
  onBack: () => void;
  onSignOut: () => Promise<void>;
}) {
  return (
    <div className="app-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-rose-400/20 bg-slate-950/75 p-7 text-center glass">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-300">
          <LockKeyhole className="h-8 w-8" />
        </div>
        <h1 className="font-display mt-5 text-2xl font-bold uppercase text-white">
          Acceso denegado
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Esta cuenta inició sesión, pero no está autorizada como administradora del marcador.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white hover:bg-sky-400"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al marcador público
          </button>
          <button
            onClick={onSignOut}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminRoute />
    </AuthProvider>
  );
}
