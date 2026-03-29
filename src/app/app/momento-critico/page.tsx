"use client";

import { useState } from "react";

export default function MomentoCritico() {
  const [vontade, setVontade] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    mensagem: string;
    substituicoes: string[];
  } | null>(null);

  async function handleEnviar() {
    if (!vontade.trim()) return;
    setLoading(true);

    const res = await fetch("/api/momento-critico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vontade }),
    });

    const data = await res.json();
    setResultado(data);
    setLoading(false);
  }

  return (
    <div className="px-5 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Momento crítico</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sem julgamento. Me conta o que você quer comer.
        </p>
      </div>

      {!resultado ? (
        <>
          <textarea
            value={vontade}
            onChange={(e) => setVontade(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            placeholder="Ex: tô com vontade de um chocolate, uma pizza, sorvete..."
          />

          <button
            onClick={handleEnviar}
            disabled={loading || !vontade.trim()}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? "Buscando alternativas..." : "Me ajuda a sair dessa"}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
            <p className="text-sm text-gray-700">{resultado.mensagem}</p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-gray-800">Alternativas para você:</p>
            {resultado.substituicoes.map((s, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3 items-start"
              >
                <span className="text-green-600 font-bold">{i + 1}.</span>
                <p className="text-sm text-gray-700">{s}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setResultado(null); setVontade(""); }}
            className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Tentar outra situação
          </button>
        </div>
      )}
    </div>
  );
}
