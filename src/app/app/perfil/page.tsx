"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

interface Profile {
  nome: string;
  email: string;
  plano: string;
  streak: number;
}

const planoLabel: Record<string, string> = {
  gratis: "Grátis",
  premium: "Premium",
  nutri: "Nutre + Nutri",
};

export default function Perfil() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    const userId = user.id;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("nome, email, plano, streak")
        .eq("id", userId)
        .single();
      setProfile(data);
    }
    load();
  }, [user, authLoading, router]);

  async function handleSair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">Meu perfil</h1>
      </div>

      <div className="px-4 pt-4 space-y-3 pb-6">
        {profile && (
          <>
            {/* Info card */}
            <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
              {[
                { label: "Nome", value: profile.nome },
                { label: "E-mail", value: profile.email },
                { label: "Plano", value: planoLabel[profile.plano] ?? profile.plano },
                { label: "Sequência", value: `🔥 ${profile.streak} dias` },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  className={`px-[18px] py-4 ${i < arr.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}
                >
                  <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide mb-0.5">{item.label}</p>
                  <p className="text-[15px] font-semibold text-[#111]">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Upgrade card */}
            {profile.plano === "gratis" && (
              <div className="bg-[#111] rounded-[20px] p-5">
                <p className="text-[14px] font-bold text-white mb-1">Upgrade para Premium</p>
                <p className="text-[12px] text-[#888] mb-4 leading-relaxed">
                  Registros ilimitados, histórico completo, metas personalizadas e muito mais.
                </p>
                <div className="space-y-2.5">
                  <div className="bg-white/10 rounded-[14px] px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-[13px] font-bold text-white">Premium</p>
                      <p className="text-[11px] text-[#888]">App completo com IA</p>
                    </div>
                    <p className="text-[14px] font-bold text-[#22c55e]">R$47/mês</p>
                  </div>
                  <div className="bg-white/10 rounded-[14px] px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-[13px] font-bold text-white">Nutre + Nutri</p>
                      <p className="text-[11px] text-[#888]">App + dieta personalizada</p>
                    </div>
                    <p className="text-[14px] font-bold text-[#22c55e]">R$150/mês</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleSair}
          className="w-full border border-[#e5e5e5] text-[#555] rounded-[14px] py-3.5 text-[14px] font-semibold bg-white"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
