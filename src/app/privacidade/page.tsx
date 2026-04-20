import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — Nutre",
};

export default function Privacidade() {
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
        <h1 className="text-3xl font-extrabold text-[#111] mb-1">Política de Privacidade</h1>
        <p className="text-sm text-[#aaa] mb-8">Última atualização: 20 de abril de 2026</p>

        <div className="bg-white rounded-[20px] border border-[#f0f0f0] p-6 space-y-7 text-[14px] text-[#444] leading-relaxed">

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">1. Quem somos</h2>
            <p>O <strong>Nutre</strong> é um aplicativo de acompanhamento nutricional operado por <strong>Vicente Hilário</strong> (CRN4 23101536), com sede no Brasil. Para dúvidas sobre esta política, entre em contato pelo e-mail <a href="mailto:vicenteho04@gmail.com" className="text-[#16a34a] underline">vicenteho04@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">2. Dados que coletamos</h2>
            <p className="mb-2">Ao usar o Nutre, coletamos os seguintes dados:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Dados de cadastro:</strong> nome e endereço de e-mail</li>
              <li><strong>Dados de saúde:</strong> fotos de refeições, descrições de alimentos, metas calóricas e de macronutrientes, objetivos alimentares (perda de peso, manutenção, ganho de massa)</li>
              <li><strong>Dados de uso:</strong> registros de refeições, sequência de dias (streak), histórico de análises</li>
              <li><strong>Dados de pagamento:</strong> processados diretamente pela Hotmart — não armazenamos dados de cartão</li>
              <li><strong>Dados técnicos:</strong> tipo de dispositivo, navegador e logs de acesso necessários para o funcionamento do serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">3. Como usamos seus dados</h2>
            <p className="mb-2">Seus dados são utilizados exclusivamente para:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Fornecer a análise nutricional das refeições registradas</li>
              <li>Personalizar metas e acompanhar seu progresso</li>
              <li>Enviar lembretes e notificações (quando autorizados por você)</li>
              <li>Gerenciar sua assinatura e validar seu plano</li>
              <li>Melhorar o serviço com base em padrões agregados e anônimos</li>
            </ul>
            <p className="mt-2"><strong>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais.</strong></p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">4. Dados sensíveis de saúde</h2>
            <p>Informações sobre alimentação e objetivos de saúde são consideradas <strong>dados sensíveis</strong> pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Ao cadastrar-se, você consente expressamente com o tratamento desses dados para as finalidades descritas nesta política. Você pode revogar esse consentimento a qualquer momento solicitando a exclusão da sua conta.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">5. Compartilhamento com terceiros</h2>
            <p className="mb-2">Para operar o serviço, utilizamos os seguintes parceiros tecnológicos:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Supabase:</strong> banco de dados e autenticação (servidores na AWS)</li>
              <li><strong>Vercel:</strong> hospedagem do aplicativo</li>
              <li><strong>Anthropic (Claude):</strong> processamento de IA para análise de refeições — as imagens e descrições são enviadas à API da Anthropic e não são armazenadas por eles para treinamento de modelos por padrão</li>
              <li><strong>Hotmart:</strong> processamento de pagamentos e gerenciamento de assinaturas</li>
            </ul>
            <p className="mt-2">Todos os parceiros operam sob contratos de confidencialidade e políticas de privacidade próprias.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">6. Seus direitos (LGPD)</h2>
            <p className="mb-2">Você tem direito a:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Solicitar a portabilidade dos seus dados</li>
              <li>Revogar seu consentimento a qualquer momento</li>
              <li>Solicitar a exclusão completa da sua conta e dados</li>
            </ul>
            <p className="mt-2">Para exercer seus direitos, entre em contato pelo e-mail <a href="mailto:vicenteho04@gmail.com" className="text-[#16a34a] underline">vicenteho04@gmail.com</a>. Responderemos em até 15 dias úteis.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">7. Retenção de dados</h2>
            <p>Mantemos seus dados enquanto sua conta estiver ativa. Após o encerramento da conta, os dados são excluídos em até 30 dias, exceto quando a retenção for exigida por obrigação legal.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">8. Segurança</h2>
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito (HTTPS/TLS), autenticação segura via Supabase e acesso restrito por função ao banco de dados. Nenhum sistema é 100% invulnerável, mas nos comprometemos a notificá-lo em caso de incidente de segurança que envolva seus dados.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">9. Cookies e armazenamento local</h2>
            <p>Utilizamos cookies de sessão e localStorage exclusivamente para manter você autenticado e salvar preferências do aplicativo. Não utilizamos cookies de rastreamento para fins publicitários.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">10. Menores de idade</h2>
            <p>O Nutre não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de crianças e adolescentes. Se tomarmos conhecimento de tal coleta, excluiremos os dados imediatamente.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">11. Alterações nesta política</h2>
            <p>Podemos atualizar esta política periodicamente. Quando houver alterações relevantes, notificaremos você pelo e-mail cadastrado com pelo menos 15 dias de antecedência. O uso continuado do serviço após esse prazo implica aceitação da nova política.</p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-2">12. Contato</h2>
            <p>Dúvidas, solicitações ou reclamações relacionadas à privacidade podem ser enviadas para <a href="mailto:vicenteho04@gmail.com" className="text-[#16a34a] underline">vicenteho04@gmail.com</a>. Você também pode registrar reclamações junto à Autoridade Nacional de Proteção de Dados (ANPD) em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-[#16a34a] underline">gov.br/anpd</a>.</p>
          </section>

        </div>

        <p className="text-center text-xs text-[#aaa] mt-8">
          © 2026 Nutre · Vicente Hilário · CRN4 23101536 ·{" "}
          <Link href="/termos" className="underline">Termos de Uso</Link>
        </p>
      </div>
    </div>
  );
}
