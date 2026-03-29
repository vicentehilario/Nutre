import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-full flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="space-y-2">
          <div className="text-5xl">🥗</div>
          <h1 className="text-3xl font-bold text-green-700">Nutre</h1>
          <p className="text-gray-500">seu nutri pessoal</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/cadastro"
            className="block w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-center hover:bg-green-700 transition"
          >
            Começar agora
          </Link>
          <Link
            href="/login"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-center hover:bg-gray-100 transition"
          >
            Já tenho conta
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Acompanhamento nutricional com IA, do jeito que funciona de verdade.
        </p>
      </div>
    </main>
  );
}
