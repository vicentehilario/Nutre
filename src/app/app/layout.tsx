"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/app", label: "Início", icon: "🏠" },
  { href: "/app/registrar", label: "Registrar", icon: "📷" },
  { href: "/app/momento-critico", label: "Socorro", icon: "🆘" },
  { href: "/app/perfil", label: "Perfil", icon: "👤" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();


  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition ${
                  active ? "text-green-600" : "text-gray-400"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
