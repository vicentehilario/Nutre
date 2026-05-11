"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-senha`,
    });

    if (error) {
      setErro("Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.");
      setLoading(false);
      return;
    }

    setEnviado(true);
    setLoading(false);
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
          <Link href="/" className="text-3xl font-bold text-green-700 block">Nutre</Link>
          <p className="text-gray-500 text-sm">Recuperar senha</p>
        </div>

        {enviado ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-3xl">📧</p>
            <p className="text-base font-bold text-green-800">E-mail enviado!</p>
            <p className="text-sm text-green-700 leading-relaxed">
              Verifique sua caixa de entrada e clique no link para criar uma nova senha.
              O link expira em 1 hora.
            </p>
            <Link href="/login" className="block mt-2 text-sm text-green-600 font-semibold underline">
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Digite seu e-mail e vamos enviar um link para você criar uma nova senha.
            </p>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="seu@email.com"
              />
            </div>

            {erro && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>

            <p className="text-center">
              <Link href="/login" className="text-sm text-green-600 hover:underline">
                Voltar ao login
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
