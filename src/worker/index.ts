/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "Nutre";
  const options: NotificationOptions = {
    body: data.body ?? "Não se esqueça de registrar suas refeições de hoje!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "nutre-reminder",
    renotify: true,
    data: { url: "/app" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/app";
  event.waitUntil(
    (self as unknown as { clients: { openWindow: (url: string) => Promise<unknown> } }).clients.openWindow(url)
  );
});
