/// <reference lib="webworker" />

// eslint-disable-next-line no-restricted-globals
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "Nutre";
  const tag = data.tag ?? "nutre-reminder";
  const options: NotificationOptions = {
    body: data.body ?? "Não se esqueça de registrar suas refeições!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag,
    data: { url: data.url ?? "/app" },
  };
  event.waitUntil(sw.registration.showNotification(title, options));
});

sw.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/app";
  event.waitUntil(
    (sw as unknown as { clients: { openWindow: (url: string) => Promise<unknown> } }).clients.openWindow(url)
  );
});
