"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  nome: string;
  email: string;
  plano: string;
  streak: number;
}

export default function Perfil() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("nome, email, plano, streak")
        .eq("id", session.user.id)
        .single();

      setProfile(data);
    }
    load();
  }, []);

  async function handleSair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const planoLabel: Record<string, string> = {
    gratis: "Grátis",
    premium: "Premium",
    nutri: "Nutre + Nutri",
  };

  return (
    <div className="px-5 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Meu perfil</h1>

      {profile && (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
            <div>
              <p className="text-xs text-gray-400">Nome</p>
              <p className="font-semibold text-gray-900">{profile.nome}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">E-mail</p>
              <p className="font-semibold text-gray-900">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Plano atual</p>
              <p className="font-semibold text-gray-900">{planoLabel[profile.plano] ?? profile.plano}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Sequência atual</p>
              <p className="font-semibold text-gray-900">🔥 {profile.streak} dias</p>
            </div>
          </div>

          {profile.plano === "gratis" && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
              <p className="font-semibold text-green-800">Upgrade para Premium</p>
              <p className="text-sm text-green-700">
                Fotos ilimitadas, substituições inteligentes, alertas personalizados e muito mais.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white border border-green-200 rounded-xl p-3">
                  <div>
                    <p className="font-semibold text-gray-800">Premium</p>
                    <p className="text-xs text-gray-500">App completo com IA</p>
                  </div>
                  <p className="font-bold text-green-700">R$47/mês</p>
                </div>
                <div className="flex justify-between items-center bg-white border border-green-200 rounded-xl p-3">
                  <div>
                    <p className="font-semibold text-gray-800">Nutre + Nutri</p>
                    <p className="text-xs text-gray-500">App + dieta personalizada</p>
                  </div>
                  <p className="font-bold text-green-700">R$150/mês</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <button
        onClick={handleSair}
        className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
      >
        Sair da conta
      </button>
    </div>
  );
}
