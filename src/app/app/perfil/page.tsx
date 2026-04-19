"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface Profile {
  nome: string;
  email: string;
  plano: string;
  streak: number;
  created_at?: string;
  plano_ativado_em?: string | null;
}

const planoLabel: Record<string, string> = {
  gratis: "Grátis",
  premium: "Premium",
  dieta_treino: "Dieta & Treino",
};

const FEATURES = [
  { label: "Análise por foto com IA",      gratis: true,  premium: true,  dt: true  },
  { label: "Registros por dia",             gratis: "2",   premium: "∞",   dt: "∞"   },
  { label: "Histórico completo",            gratis: false, premium: true,  dt: true  },
  { label: "Metas personalizadas",          gratis: true,  premium: true,  dt: true  },
  { label: "Importar plano PDF",            gratis: true,  premium: true,  dt: true  },
  { label: "Botão SOS — momento crítico",  gratis: false, premium: true,  dt: true  },
  { label: "Gráficos de evolução",          gratis: false, premium: true,  dt: true  },
  { label: "Dieta personalizada pelo nutri", gratis: false, premium: false, dt: true  },
  { label: "Treino personalizado",          gratis: false, premium: false, dt: true  },
];

function FeatureCell({ v }: { v: boolean | string }) {
  if (v === true) return <span className="text-[#16a34a] font-bold text-sm">✓</span>;
  if (v === false) return <span className="text-[#ddd] text-sm">—</span>;
  return <span className="text-[#111] font-bold text-xs">{v}</span>;
}

export default function Perfil() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { permission, subscribed, subscribe, unsubscribe } = usePushNotifications();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    const userId = user.id;
    const authUser = user;
    async function load() {
      setProfileLoading(true);
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("nome, email, plano, streak, created_at, plano_ativado_em").eq("id", userId).single();
      if (data) {
        setProfile(data);
      } else {
        // Fallback: usar dados do auth quando o perfil ainda não foi criado na tabela
        setProfile({
          nome: authUser.user_metadata?.nome ?? authUser.email?.split("@")[0] ?? "Usuário",
          email: authUser.email ?? "",
          plano: "gratis",
          streak: 0,
        });
      }
      setProfileLoading(false);
    }
    load();
  }, [user, authLoading, router]);

  async function handleSair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const isPago = profile?.plano && profile.plano !== "gratis";

  if (authLoading || profileLoading) {
    return (
      <div className="bg-[#fafafa] min-h-screen flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#f0f0f0]" />
          <div className="absolute inset-0 rounded-full border-4 border-[#16a34a] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
        <h1 className="text-2xl font-bold text-[#111] tracking-tight">Meu perfil</h1>
      </div>

      <div className="px-4 pt-4 space-y-3 pb-8">
        {profile && (
          <>
            {/* Plano badge */}
            <div className={`rounded-[20px] p-5 ${isPago ? "bg-[#111]" : "bg-white border border-[#f0f0f0]"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1 ${isPago ? "text-[#888]" : "text-[#aaa]"}`}>Plano atual</p>
                  <p className={`text-[20px] font-extrabold ${isPago ? "text-white" : "text-[#111]"}`}>
                    {planoLabel[profile.plano] ?? profile.plano}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isPago ? "bg-white/10" : "bg-[#f5f5f5]"}`}>
                  {isPago ? "⭐" : "🌱"}
                </div>
              </div>
              {isPago && (
                <span className="inline-block mt-3 text-[11px] font-bold text-[#22c55e] bg-[rgba(34,197,94,0.15)] px-2.5 py-1 rounded-full">
                  ✓ Acesso completo ativo
                </span>
              )}
            </div>

            {/* Info card */}
            <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
              {[
                { label: "Nome", value: profile.nome },
                { label: "E-mail", value: profile.email },
                { label: "Sequência", value: `🔥 ${profile.streak} dias` },
              ].map((item, i, arr) => (
                <div key={item.label} className={`px-[18px] py-4 ${i < arr.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                  <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide mb-0.5">{item.label}</p>
                  <p className="text-[15px] font-semibold text-[#111]">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Upgrade — só para usuários grátis */}
            {!isPago && (
              <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
                <div className="bg-[#111] px-5 pt-5 pb-4">
                  <p className="text-[17px] font-extrabold text-white mb-1">Desbloqueie o Nutre completo</p>
                  <p className="text-[12px] text-[#888] leading-relaxed">
                    No plano grátis você tem 2 registros por dia. Faça upgrade para registros ilimitados, histórico, gráficos e mais.
                  </p>
                </div>

                {/* Comparativo */}
                <div className="overflow-x-auto">
                  <table className="w-full text-center" style={{ minWidth: 320 }}>
                    <thead>
                      <tr className="border-b border-[#f0f0f0]">
                        <th className="text-left px-4 py-3 text-[11px] text-[#aaa] font-semibold uppercase tracking-wide w-[45%]">Recurso</th>
                        <th className="py-3 text-[11px] font-bold text-[#aaa] uppercase tracking-wide">Grátis</th>
                        <th className="py-3 text-[11px] font-bold text-[#16a34a] uppercase tracking-wide">Premium</th>
                        <th className="py-3 text-[11px] font-bold text-[#c2410c] uppercase tracking-wide">D&T</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f5]">
                      {FEATURES.map((f) => (
                        <tr key={f.label}>
                          <td className="text-left px-4 py-2.5 text-[12px] text-[#555] font-medium">{f.label}</td>
                          <td className="py-2.5"><FeatureCell v={f.gratis} /></td>
                          <td className="py-2.5 bg-[#f0fdf4]"><FeatureCell v={f.premium} /></td>
                          <td className="py-2.5"><FeatureCell v={f.dt} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CTAs */}
                <div className="p-4 space-y-2.5">
                  <a
                    href="https://go.hotmart.com/R105181472H?off=5sks6hjc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full px-4 py-3.5 rounded-[16px] bg-[#16a34a] text-white"
                  >
                    <div className="text-left">
                      <p className="text-[14px] font-bold">Premium Mensal</p>
                      <p className="text-[11px] opacity-75">Cancele quando quiser</p>
                    </div>
                    <p className="text-[17px] font-extrabold">R$ 47/mês</p>
                  </a>

                  <a
                    href="https://go.hotmart.com/R105181472H?off=w71953zf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full px-4 py-3.5 rounded-[16px] bg-[#f0fdf4] border border-[#bbf7d0]"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[14px] font-bold text-[#15803d]">Premium Anual</p>
                        <span className="text-[10px] font-bold text-white bg-[#16a34a] px-1.5 py-0.5 rounded-full">-30%</span>
                      </div>
                      <p className="text-[11px] text-[#86efac]">Equivale a R$ 33/mês</p>
                    </div>
                    <p className="text-[17px] font-extrabold text-[#15803d]">R$ 397/ano</p>
                  </a>

                  <a
                    href="https://go.hotmart.com/R105181472H?off=arsue9iw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full px-4 py-3.5 rounded-[16px] bg-[#fff7ed] border border-[#fed7aa]"
                  >
                    <div className="text-left">
                      <p className="text-[14px] font-bold text-[#c2410c]">Dieta & Treino</p>
                      <p className="text-[11px] text-[#ea580c] opacity-80">App + dieta + treino personalizados</p>
                    </div>
                    <p className="text-[17px] font-extrabold text-[#c2410c]">R$ 97/mês</p>
                  </a>
                </div>
              </div>
            )}
          </>
        )}

        {/* Status da assinatura — para usuários pagos */}
        {isPago && profile && (
          <div className="bg-white rounded-[20px] border border-[#f0f0f0] overflow-hidden">
            <div className="px-[18px] py-4 border-b border-[#f5f5f5]">
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide mb-0.5">Status da assinatura</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] flex-shrink-0" />
                <p className="text-[15px] font-bold text-[#16a34a]">Ativa</p>
              </div>
              {(profile.plano_ativado_em || profile.created_at) && (
                <p className="text-[12px] text-[#aaa] mt-0.5">
                  Ativo desde {new Date(profile.plano_ativado_em ?? profile.created_at!).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <div className="px-[18px] py-4 border-b border-[#f5f5f5]">
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide mb-1">Plano contratado</p>
              <p className="text-[15px] font-bold text-[#111]">{planoLabel[profile.plano] ?? profile.plano}</p>
            </div>
            <div className="px-[18px] py-4">
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide mb-2">Gerenciar assinatura</p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://app-vlp.hotmart.com/user/subscriptions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-[#fafafa] border border-[#e5e5e5] rounded-[12px] px-4 py-3"
                >
                  <span className="text-[13px] font-semibold text-[#333]">Ver no Hotmart</span>
                  <span className="text-[#aaa] text-sm">→</span>
                </a>
                <a
                  href={`https://wa.me/5528999888498?text=${encodeURIComponent("Olá! Preciso de ajuda com minha assinatura Nutre.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-[#f0fdf4] border border-[#bbf7d0] rounded-[12px] px-4 py-3"
                >
                  <span className="text-[13px] font-semibold text-[#16a34a]">Falar com suporte</span>
                  <span className="text-[#16a34a] text-sm">→</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Notificações push */}
        {permission !== "unsupported" && (
          <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-5">
            <p className="text-[13px] font-bold text-[#111] mb-1">Lembretes diários</p>
            <p className="text-xs text-[#aaa] mb-3.5">
              {subscribed || permission === "granted"
                ? "Você receberá uma notificação ao meio-dia se não registrou ainda."
                : "Ative para receber um lembrete diário de registrar suas refeições."}
            </p>
            {subscribed || permission === "granted" ? (
              <button
                onClick={unsubscribe}
                className="w-full border border-[#e5e5e5] text-[#555] rounded-[14px] py-3 text-[13px] font-semibold bg-white"
              >
                Desativar lembretes
              </button>
            ) : (
              <button
                onClick={subscribe}
                className="w-full bg-[#16a34a] text-white rounded-[14px] py-3 text-[13px] font-bold"
              >
                🔔 Ativar lembretes
              </button>
            )}
          </div>
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
