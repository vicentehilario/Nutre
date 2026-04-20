import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-[18px] bg-[#1a3a20] flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
          <path d="M 18,18 L 31,18 L 68,82 L 82,82 L 82,18 L 69,18 L 32,82 L 18,82 Z" fill="white"/>
        </svg>
      </div>
      <h1 className="text-[48px] font-extrabold text-[#1a3a20] leading-none mb-2">404</h1>
      <p className="text-[18px] font-bold text-[#111] mb-1">Página não encontrada</p>
      <p className="text-[14px] text-[#aaa] mb-8 max-w-xs leading-relaxed">
        Essa página não existe ou foi movida. Mas seus registros e metas estão todos aqui.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/app"
          className="block w-full py-3.5 rounded-[14px] text-center text-[14px] font-bold bg-[#16a34a] text-white"
        >
          Ir para o app
        </Link>
        <Link
          href="/"
          className="block w-full py-3.5 rounded-[14px] text-center text-[14px] font-semibold bg-white border border-[#e5e5e5] text-[#555]"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
