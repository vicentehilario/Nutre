"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Stage = "verificando" | "pronto" | "sem-sessao" | "sucesso";

export default function ResetSenha() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("verificando");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then((res: Awaited<ReturnType<typeof supabase.auth.getSession>>) => {
      setStage(res.data.session ? "pronto" : "sem-sessao");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
    if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setErro("Não foi possível salvar. Tente solicitar um novo link.");
      setLoading(false);
      return;
    }

    setStage("sucesso");
    setTimeout(() => router.push("/app"), 2500);
  }

  if (stage === "verificando") {
    return (
      <main className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#f0f0f0] border-t-green-600 animate-spin" />
          </div>
          <p className="text-sm text-gray-500">Verificando sessão...</p>
        </div>
      </main>
    );
  }

  if (stage === "sem-sessao") {
    return (
      <main className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="text-3xl">⏰</p>
          <p className="text-base font-bold text-gray-800">Link expirado ou inválido</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            O link é válido por 1 hora e para uso único. Solicite um novo para continuar.
          </p>
          <Link
            href="/esqueci-senha"
            className="inline-block mt-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm"
          >
            Solicitar novo link
          </Link>
        </div>
      </main>
    );
  }

  if (stage === "sucesso") {
    return (
      <main className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-3xl">✅</p>
            <p className="text-base font-bold text-green-800">Senha atualizada!</p>
            <p className="text-sm text-green-700">Redirecionando para o app...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-3">
            <svg width="56" height="56" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="22" fill="#1a3a20"/>
              <path d="M 18,18 L 31,18 L 68,82 L 82,82 L 82,18 L 69,18 L 32,82 L 18,82 Z" fill="white"/>
            </svg>
          </div>
          <p className="text-3xl font-bold text-green-700">Nutre</p>
          <p className="text-gray-500 text-sm">Criar nova senha</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Nova senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
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
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !senha || !confirmar}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>

          <p className="text-center">
            <Link href="/login" className="text-sm text-gray-400 hover:underline">
              Voltar ao login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
