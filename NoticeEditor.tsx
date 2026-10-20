import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { RainNotice } from '@/lib/types';

interface NoticeEditorProps {
  notice: RainNotice | null;
  onChange: () => void;
}

export function NoticeEditor({ notice, onChange }: NoticeEditorProps) {
  const [text, setText] = useState(notice?.text ?? '');
  const [visible, setVisible] = useState(notice?.is_visible ?? true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // sync when notice loads/changes
  useState(() => {
    if (notice) {
      setText(notice.text);
      setVisible(notice.is_visible);
    }
  });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('rain_notice')
      .update({ text, is_visible: visible, updated_at: new Date().toISOString() })
      .eq('id', 1);
    setSaving(false);
    if (error) setMsg(error.message);
    else {
      setMsg('Aviso actualizado.');
      onChange();
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
      <h3 className="mb-3 font-display text-lg font-bold uppercase text-white">
        Aviso importante (lluvias)
      </h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-white outline-none focus:border-sky-400/50"
      />
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-slate-900"
        />
        Mostrar el aviso en la página pública
      </label>
      <button
        onClick={save}
        disabled={saving}
        className="mt-4 flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        Guardar aviso
      </button>
      {msg && (
        <p className="mt-3 text-sm text-sky-200">{msg}</p>
      )}
    </div>
  );
}
