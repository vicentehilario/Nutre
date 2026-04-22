self.addEventListener("push", function (event) {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { title: "Nutre", body: event.data.text() }; }

  const title = data.title || "Nutre";
  const options = {
    body: data.body || "",
    icon: "/api/icons/192",
    badge: "/api/icons/192",
    data: { url: data.url || "/app" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/app";
  event.waitUntil(clients.openWindow(url));
});
