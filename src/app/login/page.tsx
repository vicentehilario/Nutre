"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro(`Erro: ${error.message}`);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setErro("Login sem sessão. Tente novamente.");
      setLoading(false);
      return;
    }

    try {
      sessionStorage.setItem("nutre_refresh", data.session.refresh_token);
    } catch (_) {}

    router.push("/app");
  }

  return (
    <main className="min-h-full flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <Link href="/" className="text-3xl font-bold text-green-700 block">Nutre</Link>
          <p className="text-gray-500 text-sm">Bem-vindo de volta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-green-600 font-medium">
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
