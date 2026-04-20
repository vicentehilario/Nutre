import Link from "next/link";

export const metadata = {
  title: "Termos de Uso — Nutre",
};

export default function Termos() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-2xl mx-auto px-5 py-10">
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-[#16a34a] font-semibold text-sm">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-[10px] bg-[#1a3a20] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
              <path d="M 18,18 L 31,18 L 68,82 L 82,82 L 82,18 L 69,18 L 32,82 L 18,82 Z" fill="white"/>
            </svg>
          </div>
          <span className="font-extrabold text-[#1a3a20] text-lg">Nutre</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#111] mb-1">Termos de Uso</h1>
        <p className="text-sm text-[#aaa] mb-8">Última atualização: 20 de abril de 2026</p>

        <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-6 space-y-7 text-[14px] text-[#444] leading-relaxed">

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">1. Aceitação dos termos</h2>
            <p>Ao criar uma conta e usar o <strong>Nutre</strong>, você concorda com estes Termos de Uso e com nossa <Link href="/privacidade" className="text-[#16a34a] underline">Política de Privacidade</Link>. Se não concordar, não utilize o serviço.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">2. O serviço</h2>
            <p>O Nutre é um aplicativo de acompanhamento nutricional que utiliza inteligência artificial para analisar refeições fotografadas ou descritas pelo usuário, fornecendo estimativas de calorias e macronutrientes com base na metodologia do nutricionista Vicente Hilário (CRN4 23101536).</p>
            <p className="mt-2 font-semibold text-[#c2410c]">⚠️ Aviso importante: o Nutre é uma ferramenta de apoio e educação nutricional, não substitui consulta médica ou acompanhamento nutricional individualizado presencial. As análises geradas por IA são estimativas e podem conter imprecisões. Decisões de saúde devem sempre ser tomadas com orientação profissional.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">3. Elegibilidade</h2>
            <p>Para usar o Nutre você deve ter 18 anos ou mais e capacidade legal para celebrar contratos. Ao aceitar estes termos, você declara que atende a esses requisitos.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">4. Conta de usuário</h2>
            <p>Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente em caso de acesso não autorizado. Cada pessoa pode ter apenas uma conta.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">5. Planos e pagamentos</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Plano Grátis:</strong> acesso limitado a 2 análises de refeição por dia, sem histórico completo</li>
              <li><strong>Premium Mensal (R$ 47/mês):</strong> análises ilimitadas, histórico completo, botão SOS e mais</li>
              <li><strong>Premium Anual (R$ 397/ano):</strong> todos os benefícios do mensal com desconto de 30%</li>
              <li><strong>Dieta &amp; Treino (R$ 97/mês):</strong> inclui plano alimentar e de treino personalizados</li>
            </ul>
            <p className="mt-2">Pagamentos são processados pela <strong>Hotmart</strong>. Ao assinar, você concorda também com os termos e a política de privacidade da Hotmart.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">6. Cancelamento e reembolso</h2>
            <p>Você pode cancelar sua assinatura a qualquer momento pela plataforma Hotmart. O acesso permanece ativo até o fim do período pago. <strong>Reembolsos são concedidos em até 7 dias corridos após a compra</strong>, conforme o Código de Defesa do Consumidor (Lei nº 8.078/1990, art. 49). Após esse prazo, não há reembolso pelo período não utilizado. Para solicitar, entre em contato pelo WhatsApp de suporte indicado no aplicativo.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">7. Uso permitido</h2>
            <p className="mb-2">Você pode usar o Nutre para acompanhamento pessoal da sua alimentação. É proibido:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Usar o serviço para fins comerciais sem autorização prévia</li>
              <li>Tentar acessar contas de outros usuários</li>
              <li>Realizar engenharia reversa, descompilar ou copiar o aplicativo</li>
              <li>Enviar conteúdo ofensivo, ilegal ou que viole direitos de terceiros</li>
              <li>Automatizar o uso do serviço com bots ou scripts</li>
              <li>Compartilhar sua conta com terceiros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">8. Conteúdo do usuário</h2>
            <p>Ao enviar fotos e descrições de refeições, você concede ao Nutre uma licença limitada, não exclusiva e revogável para processar esse conteúdo com o objetivo de fornecer o serviço. Você mantém a propriedade dos seus dados. Não usamos suas imagens para outros fins além da análise nutricional.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">9. Propriedade intelectual</h2>
            <p>O Nutre, incluindo seu design, código-fonte, marca, metodologia e conteúdo, é propriedade de Vicente Hilário e está protegido por leis de propriedade intelectual brasileiras e internacionais. É proibida a reprodução sem autorização expressa.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">10. Limitação de responsabilidade</h2>
            <p>O Nutre é fornecido &ldquo;como está&rdquo;, sem garantias de que as análises nutricionais serão precisas em todos os casos. Não nos responsabilizamos por decisões de saúde tomadas com base exclusivamente nas estimativas geradas pelo aplicativo, por danos indiretos, lucros cessantes ou perda de dados decorrentes do uso ou impossibilidade de uso do serviço.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">11. Disponibilidade do serviço</h2>
            <p>Envidamos esforços para manter o serviço disponível 24 horas por dia, mas não garantimos disponibilidade ininterrupta. Podemos realizar manutenções programadas ou emergenciais. Em caso de interrupções prolongadas, comunicaremos pelo e-mail cadastrado.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">12. Encerramento de conta</h2>
            <p>Você pode encerrar sua conta a qualquer momento pelo aplicativo ou por e-mail. Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, sem aviso prévio em casos graves. Em caso de encerramento por nossa iniciativa sem motivo de violação, reembolsaremos o valor proporcional ao período não utilizado da assinatura.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">13. Alterações nos termos</h2>
            <p>Podemos modificar estes termos a qualquer momento. Alterações relevantes serão comunicadas com 15 dias de antecedência por e-mail. O uso continuado após esse prazo representa aceitação dos novos termos.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">14. Lei aplicável e foro</h2>
            <p>Estes termos são regidos pelas leis da República Federativa do Brasil. Para resolver disputas, as partes elegem o foro da comarca de domicílio do usuário, conforme o Código de Defesa do Consumidor.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">15. Contato</h2>
            <p>Dúvidas sobre estes termos podem ser enviadas para <a href="mailto:vicenteho04@gmail.com" className="text-[#16a34a] underline">vicenteho04@gmail.com</a> ou pelo WhatsApp de suporte disponível no aplicativo.</p>
          </section>

        </div>

        <p className="text-center text-xs text-[#aaa] mt-8">
          © 2026 Nutre · Vicente Hilário · CRN4 23101536 ·{" "}
          <Link href="/privacidade" className="underline">Política de Privacidade</Link>
        </p>
      </div>
    </div>
  );
}
