import { createBrowserClient } from "@supabase/ssr";

const ONE_YEAR = 365 * 24 * 60 * 60;

function parseCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};
  return Object.fromEntries(
    document.cookie
      .split("; ")
      .filter(Boolean)
      .map((c) => {
        const idx = c.indexOf("=");
        return [c.slice(0, idx), decodeURIComponent(c.slice(idx + 1))];
      })
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ReturnType<typeof createBrowserClient<any>> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): ReturnType<typeof createBrowserClient<any>> {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies = parseCookies();
            return Object.entries(cookies).map(([name, value]) => ({ name, value }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              const maxAge = options?.maxAge ?? ONE_YEAR;
              const parts = [
                `${name}=${encodeURIComponent(value)}`,
                `Max-Age=${maxAge}`,
                "Path=/",
                "SameSite=Lax",
                "Secure",
              ];
              document.cookie = parts.join("; ");
            });
          },
        },
      }
    );
  }
  return client;
}
