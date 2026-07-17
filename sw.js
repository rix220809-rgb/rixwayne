importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDIiLkQ4N6vyMyeG_25UogJfUqhr6FaQbc",
  authDomain: "our-memories-push.firebaseapp.com",
  projectId: "our-memories-push",
  storageBucket: "our-memories-push.firebasestorage.app",
  messagingSenderId: "283362590873",
  appId: "1:283362590873:web:2380bcb3162867bc213808"
});

// Initialize FCM only. Do not manually show notification messages here,
// otherwise the browser and Service Worker will each display one copy.
firebase.messaging();

const CACHE_NAME = "our-memories-v10.3.0";
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css?v=10.0.0",
  "./js/app.js?v=10.0.0",
  "./js/push-notifications.js?v=10.0.0",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE))
      .catch(error => console.warn("Cache install failed", error))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, copy))
          .catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const url =
    event.notification.data?.url ||
    event.notification.fcmOptions?.link ||
    "./index.html";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(windowClients => {
        for (const client of windowClients) {
          if ("navigate" in client && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
