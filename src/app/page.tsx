"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import s from "./landing.module.css";

function NutreLogo({ size = "nav" }: { size?: "nav" | "footer" }) {
  const dim = size === "footer" ? 22 : 32;
  const r = size === "footer" ? 6 : 8;
  return (
    <svg className={size === "footer" ? s.footerLogoIcon : s.logoIcon}
      width={dim} height={dim} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx={r * (100 / dim)} fill="#1a3a20"/>
      <path d="M 18,18 L 31,18 L 68,82 L 82,82 L 82,18 L 69,18 L 32,82 L 18,82 Z" fill="white"/>
    </svg>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/app");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className={s.landing}>
      {/* NAV */}
      <nav className={s.nav}>
        <a href="#" className={s.navLogo}>
          <NutreLogo />
          <span>Nutre</span>
        </a>
        <Link href="/cadastro" className={s.navCta}>Começar grátis</Link>
      </nav>

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroContent}>
          <div className={s.heroEyebrow}>Nutricionista · CRN4 23101536</div>
          <h1 className={s.heroH1}>
            Pare de<br />adivinhar<br />o que <em>comer.</em>
          </h1>
          <p className={s.heroSub}>
            Tire uma foto da sua refeição e descubra na hora as calorias e macronutrientes — com a orientação de um nutricionista formado por trás de cada resposta.
          </p>
          <div className={s.heroCtas}>
            <Link href="/cadastro" className={s.btnHeroPrimary}>Experimentar grátis</Link>
            <a href="#como-funciona" className={s.btnHeroSecondary}>Como funciona</a>
          </div>
          <div className={s.heroProof}>
            <div className={s.proofFaces}>
              <span className={s.proofFace}>A</span>
              <span className={s.proofFace}>H</span>
              <span className={s.proofFace}>L</span>
              <span className={s.proofFace}>M</span>
            </div>
            <p><strong>+600 pacientes</strong> já transformaram sua alimentação</p>
          </div>
        </div>
        <div className={s.heroVisual}>
          <Image
            src="/vicente-hero.jpg"
            alt="Vicente Hilário — Nutricionista"
            width={480}
            height={640}
            style={{ height: "100%", maxHeight: 620, width: "100%", objectFit: "cover", objectPosition: "top center", borderRadius: "20px 20px 0 0", boxShadow: "0 -8px 60px rgba(0,0,0,0.1)" }}
            priority
          />
          <div className={`${s.heroCard} ${s.heroCardCredential}`}>
            <div className={s.crnDot} />
            <div>
              <strong>Vicente Hilário</strong>
              <span>Nutricionista · CRN4 23101536</span>
            </div>
          </div>
          <div className={`${s.heroCard} ${s.heroCardStat}`}>
            <div className={s.statNum}>+600</div>
            <div className={s.statLabel}>pacientes<br />atendidos</div>
          </div>
        </div>
      </section>

      {/* DOR */}
      <section className={s.dor}>
        <div className={s.dorInner}>
          <div className={s.sectionTag}>O problema</div>
          <h2 className={s.sectionTitle}>Você sabe que precisa<br />mudar — mas não sabe por onde começar.</h2>
          <p className={s.sectionSub} style={{ marginBottom: 56 }}>A maioria das pessoas que quer emagrecer trava nos mesmos pontos. O Nutre foi criado para resolver cada um deles.</p>
          <div className={s.dorGrid}>
            <div className={s.dorItem}>
              <div className={s.dorNum}>01</div>
              <h3>&ldquo;Não sei quantas calorias tem o que estou comendo&rdquo;</h3>
              <p>Pesquisar alimento por alimento é trabalhoso e impreciso. Você desiste depois de dois dias.</p>
            </div>
            <div className={s.dorItem}>
              <div className={s.dorNum}>02</div>
              <h3>&ldquo;Toda dieta que faço é rígida demais para manter&rdquo;</h3>
              <p>Regras fixas geram culpa quando você sai um pouco. Aí vem a desistência e o efeito sanfona.</p>
            </div>
            <div className={s.dorItem}>
              <div className={s.dorNum}>03</div>
              <h3>&ldquo;Na hora da vontade, não tenho com quem falar&rdquo;</h3>
              <p>Sem suporte no momento crítico, você cede. O Nutre tem um botão SOS exatamente para essa hora.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className={s.como} id="como-funciona">
        <div className={s.comoInner}>
          <div className={s.sectionTag}>Como funciona</div>
          <h2 className={s.sectionTitle}>Simples como tirar uma foto</h2>
          <p className={s.sectionSub}>Sem planilhas, sem pesar alimento, sem complicação. Você fotografa, a IA analisa.</p>
          <div className={s.steps}>
            {/* Passo 1 */}
            <div className={s.step}>
              <div className={s.stepCircle}>1</div>
              <h3>Fotografe sua refeição</h3>
              <p>Prato montado, marmita ou lanche — qualquer coisa, exatamente como está. Sem preparação.</p>
              <div className={s.phoneWrap}>
                <div className={s.phone}>
                  <div className={s.phoneScreen}>
                    <div className={s.phoneCam}>
                      <div className={s.camGrid} />
                      <div className={s.camFocus} />
                      <div className={s.camLabel}>Enquadre sua refeição</div>
                    </div>
                    <div className={s.camBtn}>
                      <div className={s.camBtnInner} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Passo 2 */}
            <div className={s.step}>
              <div className={s.stepCircle}>2</div>
              <h3>A IA analisa na hora</h3>
              <p>Em segundos você vê calorias, proteínas, carboidratos e gorduras. Com base na metodologia do Vicente.</p>
              <div className={s.phoneWrap}>
                <div className={s.phone}>
                  <div className={s.phoneScreen}>
                    <div className={s.phoneAnalysis}>
                      <div className={s.analysisPhoto}>🍽️</div>
                      <div className={s.analysisTitle}>Frango grelhado com arroz</div>
                      <div className={s.macroRow}>
                        <div className={s.macroChip}><div className={s.macroVal}>38g</div><div className={s.macroKey}>Proteína</div></div>
                        <div className={s.macroChip}><div className={s.macroVal}>42g</div><div className={s.macroKey}>Carbo</div></div>
                        <div className={s.macroChip}><div className={s.macroVal}>8g</div><div className={s.macroKey}>Gordura</div></div>
                      </div>
                      <div className={s.analysisTotal}>
                        <span className={s.analysisTotalLabel}>Total kcal</span>
                        <span className={s.analysisTotalVal}>396 kcal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Passo 3 */}
            <div className={s.step}>
              <div className={s.stepCircle}>3</div>
              <h3>Acompanhe seu progresso</h3>
              <p>Histórico diário, streak de consistência e metas personalizadas. Tudo no bolso.</p>
              <div className={s.phoneWrap}>
                <div className={s.phone}>
                  <div className={s.phoneScreen}>
                    <div className={s.phoneProgress}>
                      <div className={s.progHeader}>
                        <div className={s.progTitle}>Progresso semanal</div>
                        <div className={s.progStreak}>🔥 14 dias</div>
                      </div>
                      <div className={s.progBarWrap}>
                        <div className={s.progBar} />
                      </div>
                      <div className={s.progDays}>
                        {["S","T","Q","Q","S"].map((d, i) => (
                          <div key={i} className={`${s.progDay} ${s.progDayDone}`}>{d}</div>
                        ))}
                        <div className={`${s.progDay} ${s.progDayToday}`}>S</div>
                        <div className={`${s.progDay} ${s.progDayEmpty}`}>D</div>
                      </div>
                      <div className={s.progChart}>
                        {[32,44,28,50,38,20,10].map((h, i) => (
                          <div key={i} className={s.chartBarWrap}>
                            <div className={`${s.chartBar} ${i < 5 ? s.chartBarActive : ""}`} style={{ height: h }} />
                            <div className={s.chartLbl}>{["S","T","Q","Q","S","S","D"][i]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUTORIDADE */}
      <section className={s.autoridade}>
        <div className={s.autoridadeInner}>
          <div className={s.autoridadeImgWrap}>
            <Image
              src="/vicente-autoridade.jpg"
              alt="Vicente Hilário"
              width={520}
              height={520}
              style={{ width: "100%", height: 520, objectFit: "cover", objectPosition: "top", borderRadius: 16, boxShadow: "0 20px 60px rgba(15,36,20,0.15)" }}
            />
            <div className={s.autoridadeBadge}>
              <div className={s.bNum}>+600</div>
              <div className={s.bLabel}>pacientes atendidos</div>
            </div>
          </div>
          <div className={s.autoridadeContent}>
            <div className={s.sectionTag}>Quem está por trás do Nutre</div>
            <h2 className={s.sectionTitle}>Uma metodologia real,<br />treinada em IA</h2>
            <p>O Nutre não é um app genérico. Formado há 3 anos, já atendi mais de 600 pacientes que queriam emagrecer de forma sustentável — e aprendi que o que funciona é simples: consistência, sem culpa e orientação certa.</p>
            <p>A IA do Nutre foi treinada com essa metodologia. Ela responde do jeito que eu responderia numa consulta: direta, sem enrolação, adaptada à sua realidade.</p>
            <div className={s.crnBlock}>
              <div className={s.crnBadge}>CRN4</div>
              <span>Vicente Hilário · 23101536</span>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className={s.depoimentos}>
        <div className={s.depoimentosInner}>
          <div className={s.sectionTag}>Resultados reais</div>
          <h2 className={s.sectionTitle}>Pacientes que provaram<br />a metodologia</h2>
          <p className={s.sectionSub}>Resultados reais de pessoas reais — com a mesma metodologia que o Nutre usa.</p>
          <div className={s.depGrid}>
            {/* André — destaque */}
            <div className={`${s.depCard} ${s.depCardFeatured}`}>
              <div className={s.depStars}>{[...Array(5)].map((_,i) => <span key={i} className={s.depStar} />)}</div>
              <p className={s.depQuote}>Vesti minha calça antiga número 58 — nem servia mais. Estou com 56 e já está enorme. Vou pra 54. Sai da camisa G5 pra G2, com folga.</p>
              <div className={s.depResult}>Calça 58 → rumo à 54</div>
              <div className={s.depAuthor}>
                <div className={s.depAvatar}>A</div>
                <div><div className={s.depName}>André</div><div className={s.depMeta}>Paciente</div></div>
              </div>
            </div>
            {/* Helena */}
            <div className={s.depCard}>
              <div className={s.depStars}>{[...Array(5)].map((_,i) => <span key={i} className={s.depStar} />)}</div>
              <p className={s.depQuote}>De fato, dessa vez foi a maior e melhor evolução que eu já tive. Melhorei não só meu físico, mas meu mental e a forma como enxergo a alimentação na minha vida.</p>
              <div className={s.depResult}>Transformação física e mental</div>
              <div className={s.depAuthor}>
                <div className={s.depAvatar}>H</div>
                <div><div className={s.depName}>Helena</div><div className={s.depMeta}>Paciente</div></div>
              </div>
            </div>
            {/* Leticia */}
            <div className={s.depCard}>
              <div className={s.depStars}>{[...Array(5)].map((_,i) => <span key={i} className={s.depStar} />)}</div>
              <p className={s.depQuote}>Eu tava com 59kg e pouco. Tô com 55 e pouco. Parece que o físico tá evoluindo — senti MUITA diferença.</p>
              <div className={s.depResult}>59kg → 55kg</div>
              <div className={s.depAuthor}>
                <div className={s.depAvatar}>L</div>
                <div><div className={s.depName}>Leticia Caetano</div><div className={s.depMeta}>Paciente</div></div>
              </div>
            </div>
            {/* Margot */}
            <div className={s.depCard}>
              <div className={s.depStars}>{[...Array(5)].map((_,i) => <span key={i} className={s.depStar} />)}</div>
              <p className={s.depQuote}>Antes sentia muita fome ao longo do dia, principalmente à tarde. Hoje me sinto saciada tranquilamente, sem me sentir &ldquo;lotada&rdquo;.</p>
              <div className={s.depResult}>Fim da fome à tarde</div>
              <div className={s.depAuthor}>
                <div className={s.depAvatar}>M</div>
                <div><div className={s.depName}>Margot</div><div className={s.depMeta}>Paciente · RJ</div></div>
              </div>
            </div>
            {/* Camilly */}
            <div className={s.depCard}>
              <div className={s.depStars}>{[...Array(5)].map((_,i) => <span key={i} className={s.depStar} />)}</div>
              <p className={s.depQuote}>Vicente do céu! 150g de carne é MUITA coisa. Aprendi a comer as quantidades certas sem precisar sofrer com restrição.</p>
              <div className={s.depResult}>Reeducação alimentar real</div>
              <div className={s.depAuthor}>
                <div className={s.depAvatar}>C</div>
                <div><div className={s.depName}>Camilly</div><div className={s.depMeta}>Paciente</div></div>
              </div>
            </div>
            {/* CTA card */}
            <div className={s.depCtaCard}>
              <div className={s.depCtaLabel}>Próximo resultado</div>
              <p className={s.depCtaTitle}>Pode ser<br />o seu.</p>
              <Link href="/cadastro" className={s.depCtaBtn}>Começar agora</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PREÇO */}
      <section className={s.preco}>
        <div className={s.precoInner}>
          <div className={s.sectionTag}>Planos</div>
          <h2 className={s.sectionTitle}>Simples e transparente</h2>
          <p className={s.sectionSub}>Comece grátis. Faça upgrade quando quiser.</p>
          <div className={s.precoGrid}>
            {/* Grátis */}
            <div className={s.precoCard}>
              <div className={s.precoTier}>Grátis</div>
              <div className={s.precoAmount}>
                <span className={s.priceCurrency}>R$</span>
                <span className={s.priceValue}>0</span>
                <span className={s.pricePeriod}>para sempre</span>
              </div>
              <hr className={s.precoDivider} />
              <ul className={s.precoFeatures}>
                <li>2 registros por dia</li>
                <li>Análise nutricional por foto</li>
                <li>Streak de consistência</li>
              </ul>
              <Link href="/cadastro" className={`${s.btnPlan} ${s.btnPlanOutline}`}>Começar grátis</Link>
            </div>
            {/* Premium Mensal */}
            <div className={`${s.precoCard} ${s.precoCardHighlight}`}>
              <div className={s.popularTag}>Mais popular</div>
              <div className={s.precoTier}>Premium Mensal</div>
              <div className={s.precoAmount}>
                <span className={s.priceCurrency}>R$</span>
                <span className={s.priceValue}>47</span>
                <span className={s.pricePeriod}>por mês · cancele quando quiser</span>
              </div>
              <hr className={s.precoDivider} />
              <ul className={s.precoFeatures}>
                <li>Registros ilimitados</li>
                <li>Análise nutricional com IA</li>
                <li>Histórico completo</li>
                <li>Botão SOS — momento crítico</li>
                <li>Metas personalizadas</li>
              </ul>
              <a href="https://go.hotmart.com/R105181472H?off=5sks6hjc" className={`${s.btnPlan} ${s.btnPlanWhite}`}>Assinar agora</a>
            </div>
            {/* Premium Anual */}
            <div className={s.precoCard}>
              <div className={s.precoTier}>Premium Anual <span className={s.savingsTag}>−30%</span></div>
              <div className={s.precoAmount}>
                <span className={s.priceCurrency}>R$</span>
                <span className={s.priceValue}>397</span>
                <span className={s.pricePeriod}>por ano · equivale a R$ 33/mês</span>
              </div>
              <hr className={s.precoDivider} />
              <ul className={s.precoFeatures}>
                <li>Tudo do plano mensal</li>
                <li>Economia de R$ 167 no ano</li>
                <li>Importação de plano alimentar PDF</li>
              </ul>
              <a href="https://go.hotmart.com/R105181472H?off=w71953zf" className={`${s.btnPlan} ${s.btnPlanSolid}`}>Assinar anual</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={s.ctaFinal}>
        <div className={s.ctaFinalInner}>
          <h2>Comece hoje.<br />Sua primeira análise é grátis.</h2>
          <p>Tire uma foto da sua próxima refeição e veja na hora o que está comendo — sem planilha, sem complicação.</p>
          <Link href="/cadastro" className={s.btnCtaFinal}>Baixar o Nutre grátis</Link>
          <p className={s.ctaGuarantee}>Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={s.footerBrand}>
          <NutreLogo size="footer" />
          <strong>Nutre</strong> · Vicente Hilário · CRN4 23101536
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
          <span>© 2026 Nutre.</span>
          <Link href="/privacidade" className="underline opacity-70 hover:opacity-100">Política de Privacidade</Link>
          <Link href="/termos" className="underline opacity-70 hover:opacity-100">Termos de Uso</Link>
        </div>
      </footer>
    </div>
  );
}
