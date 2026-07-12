
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js");

firebase.initializeApp({
  "apiKey": "AIzaSyDIiLkQ4N6vyMyeG_25UogJfUqhr6FaQbc",
  "authDomain": "our-memories-push.firebaseapp.com",
  "projectId": "our-memories-push",
  "storageBucket": "our-memories-push.firebasestorage.app",
  "messagingSenderId": "283362590873",
  "appId": "1:283362590873:web:2380bcb3162867bc213808"
});
const messaging = firebase.messaging();

const CACHE_NAME = "our-memories-v8.2.5";
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css?v=8.2.5",
  "./js/app.js?v=8.2.5",
  "./js/push-notifications.js?v=8.2.5",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || "Our Memories";
  const options = {
    body: payload.notification?.body || "你有一則新提醒",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    data: {
      url: payload.data?.url || "./index.html"
    }
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url || "./index.html";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
