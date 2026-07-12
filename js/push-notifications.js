
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getMessaging, getToken, isSupported, onMessage } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging.js";

const firebaseConfig = {
  "apiKey": "AIzaSyDIiLkQ4N6vyMyeG_25UogJfUqhr6FaQbc",
  "authDomain": "our-memories-push.firebaseapp.com",
  "projectId": "our-memories-push",
  "storageBucket": "our-memories-push.firebasestorage.app",
  "messagingSenderId": "283362590873",
  "appId": "1:283362590873:web:2380bcb3162867bc213808"
};
const VAPID_PUBLIC_KEY = "BNnGKB0AE3SgwI-55sXcuGVl-DITM4n2fwpCJrOrjn6sQVjQto8efHKdPH4nw1eEJgB1hek99av1m8q2pBv3ILc";

const SUPABASE_URL = "https://hcrrqcqmhszllrnaqzin.supabase.co";
const SUPABASE_KEY = "sb_publishable_UJehDUWGpPHTKQ-qF-C5WQ_oEbbfGni";
const SPACE_ID = "shun-wayne-kapi-period";

const firebaseApp = initializeApp(firebaseConfig);
const pushDb = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
}

async function chooseOwner() {
  const saved = localStorage.getItem("ourMemories.pushOwner");
  if (saved) return saved;
  const selected = window.prompt("這支手機是誰在使用？請輸入「蕭小舜」或「懷寶」", "蕭小舜");
  const owner = selected === "懷寶" ? "懷寶" : "蕭小舜";
  localStorage.setItem("ourMemories.pushOwner", owner);
  return owner;
}

async function saveToken(token) {
  if (!pushDb) throw new Error("Supabase 尚未載入");
  const owner = await chooseOwner();
  const payload = {
    space_id: SPACE_ID,
    owner,
    fcm_token: token,
    platform: navigator.userAgent,
    enabled: true,
    updated_at: new Date().toISOString()
  };
  const { error } = await pushDb
    .from("push_subscriptions")
    .upsert(payload, { onConflict: "fcm_token" });
  if (error) throw error;
  return owner;
}

window.enablePushNotifications = async function enablePushNotifications() {
  if (!isStandalone() && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    throw new Error("iPhone 請先用 Safari 將網站加入主畫面，再從主畫面開啟。");
  }
  if (!("serviceWorker" in navigator)) throw new Error("此瀏覽器不支援 Service Worker");

  const supported = await isSupported();
  if (!supported) throw new Error("此瀏覽器目前不支援 Firebase Web Push");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("通知權限未允許");

  const registration = await navigator.serviceWorker.register("./sw.js?v=8.2.5");
  await navigator.serviceWorker.ready;

  const messaging = getMessaging(firebaseApp);
  const token = await getToken(messaging, {
    vapidKey: VAPID_PUBLIC_KEY,
    serviceWorkerRegistration: registration
  });
  if (!token) throw new Error("沒有取得裝置通知 Token");

  const owner = await saveToken(token);
  localStorage.setItem("ourMemories.fcmToken", token);
  return { token, owner };
};

window.getPushStatus = function getPushStatus() {
  return {
    supported: "Notification" in window && "serviceWorker" in navigator,
    permission: "Notification" in window ? Notification.permission : "unsupported",
    standalone: isStandalone(),
    registered: !!localStorage.getItem("ourMemories.fcmToken"),
    owner: localStorage.getItem("ourMemories.pushOwner") || ""
  };
};

try {
  if (await isSupported()) {
    const messaging = getMessaging(firebaseApp);
    onMessage(messaging, payload => {
      const title = payload.notification?.title || "Our Memories";
      const body = payload.notification?.body || "你有一則新提醒";
      if (Notification.permission === "granted") {
        new Notification(title, { body, icon: "./icon-192.png" });
      }
    });
  }
} catch (e) {
  console.warn("Firebase foreground messaging unavailable", e);
}
