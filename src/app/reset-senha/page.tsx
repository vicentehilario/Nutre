"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetSenha() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [pronto, setPronto] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase converte o hash fragment em sessão automaticamente ao carregar a página
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }: { data: { session: import("@supabase/supabase-js").Session | null } }) => {
      if (data.session) setSessionReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setSessionReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
    if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }

    setLoading(true);
    setErro("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setErro(`Erro: ${error.message}`);
      setLoading(false);
      return;
    }

    setPronto(true);
    setLoading(false);
    setTimeout(() => router.push("/app"), 2000);
  }

  if (!sessionReady) {
    return (
      <main className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center space-y-3">
          <p className="text-2xl">🔑</p>
          <p className="text-sm text-gray-500">Verificando link...</p>
          <p className="text-xs text-gray-400">Se nada acontecer, o link pode ter expirado. <a href="/esqueci-senha" className="text-green-600 underline">Solicitar novo link</a></p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <p className="text-3xl font-bold text-green-700">Nutre</p>
          <p className="text-gray-500 text-sm">Criar nova senha</p>
        </div>

        {pronto ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-2">
            <p className="text-2xl">✅</p>
            <p className="text-sm font-semibold text-green-800">Senha atualizada!</p>
            <p className="text-xs text-green-700">Redirecionando para o app...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nova senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Confirmar senha</label>
              <input
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
              />
            </div>

            {erro && <p className="text-red-500 text-sm">{erro}</p>}

            <button
              type="submit"
              disabled={loading || !senha || !confirmar}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
