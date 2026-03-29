"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  nome: string;
  streak: number;
  fotos_hoje: number;
  plano: string;
}

export default function AppHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function tryRestoreSession() {
      const { data: { session: existing } } = await supabase.auth.getSession();
      if (!existing) {
        try {
          const refreshToken = sessionStorage.getItem("nutre_refresh");
          if (refreshToken) {
            await supabase.auth.refreshSession({ refresh_token: refreshToken });
          }
        } catch (_) {}
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;

      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("nome, streak, fotos_hoje, plano")
          .eq("id", session.user.id)
          .single();

        if (active) {
          setProfile(data);
          setLoading(false);
        }
      } else if (event === "INITIAL_SESSION" || event === "SIGNED_OUT") {
        window.location.href = "/login";
      }
    });

    tryRestoreSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const limitefotos = profile?.plano === "gratis" ? 2 : 999;
  const fotosRestantes = Math.max(0, limitefotos - (profile?.fotos_hoje ?? 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Saudação */}
      <div>
        <p className="text-gray-500 text-sm">Olá,</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {profile?.nome?.split(" ")[0] ?? "bem-vindo"} 👋
        </h1>
      </div>

      {/* Streak */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="text-4xl">🔥</div>
        <div>
          <p className="text-2xl font-bold text-green-700">
            {profile?.streak ?? 0} {profile?.streak === 1 ? "dia" : "dias"}
          </p>
          <p className="text-sm text-green-600">de consistência seguidos</p>
        </div>
      </div>

      {/* Fotos de hoje */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-800">Registros de hoje</p>
          {profile?.plano === "gratis" && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
              {profile.fotos_hoje}/2 grátis
            </span>
          )}
        </div>

        {profile?.fotos_hoje === 0 ? (
          <p className="text-sm text-gray-400">
            Ainda sem registros hoje. Tire uma foto da sua próxima refeição!
          </p>
        ) : (
          <p className="text-sm text-green-600 font-medium">
            ✓ {profile.fotos_hoje} {profile.fotos_hoje === 1 ? "refeição registrada" : "refeições registradas"} hoje
          </p>
        )}

        <Link
          href="/app/registrar"
          className={`block w-full py-3 rounded-xl text-center font-semibold text-sm transition ${
            fotosRestantes === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {fotosRestantes === 0
            ? "Limite diário atingido — faça upgrade"
            : "📷 Registrar refeição"}
        </Link>

        {fotosRestantes === 0 && (
          <Link
            href="/app/perfil"
            className="block w-full py-3 rounded-xl text-center font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition"
          >
            Upgrade para Premium
          </Link>
        )}
      </div>

      {/* Momento crítico */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
        <p className="font-semibold text-orange-800 mb-1">Bateu aquela vontade?</p>
        <p className="text-sm text-orange-600 mb-3">
          Me conta o que você quer comer e eu te ajudo a sair dessa sem culpa.
        </p>
        <Link
          href="/app/momento-critico"
          className="block w-full py-3 rounded-xl text-center font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition"
        >
          🆘 Preciso de ajuda agora
        </Link>
      </div>
    </div>
  );
}
