import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getMessaging,
  getToken,
  isSupported
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDIiLkQ4N6vyMyeG_25UogJfUqhr6FaQbc",
  authDomain: "our-memories-push.firebaseapp.com",
  projectId: "our-memories-push",
  storageBucket: "our-memories-push.firebasestorage.app",
  messagingSenderId: "283362590873",
  appId: "1:283362590873:web:2380bcb3162867bc213808"
};

const VAPID_KEY =
  "BNnGKB0AE3SgwI-55sXcuGVl-DITM4n2fwpCJrOrjn6sQVjQto8efHKdPH4nw1eEJgB1hek99av1m8q2pBv3ILc";

const SUPABASE_URL = "https://hcrrqcqmhszllrnaqzin.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_UJehDUWGpPHTKQ-qF-C5WQ_oEbbfGni";
const SPACE_ID = "shun-wayne-kapi-period";
const OWNER_KEY = "ourMemories.pushOwner";

function chooseOwner() {
  const saved = localStorage.getItem(OWNER_KEY);
  if (saved === "蕭小舜" || saved === "懷寶") return saved;

  const answer = window.prompt(
    "這支手機是誰使用？\n輸入 1：蕭小舜\n輸入 2：懷寶",
    "1"
  );

  const owner =
    answer === "2" || answer === "懷寶"
      ? "懷寶"
      : "蕭小舜";

  localStorage.setItem(OWNER_KEY, owner);
  return owner;
}

function platformLabel() {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true;

  return `${navigator.platform || "web"}${standalone ? "-pwa" : "-browser"}`;
}

async function registerPush() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("這個瀏覽器不支援 Service Worker。");
  }

  if (!("Notification" in window)) {
    throw new Error("此裝置不支援網頁通知。iPhone 請先將網站加入主畫面後再開啟。");
  }

  if (!(await isSupported())) {
    throw new Error("目前瀏覽器不支援 Firebase 網頁推播。");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "通知權限已被拒絕，請到 iPhone 設定中重新允許通知。"
        : "尚未允許通知。"
    );
  }

  const registration = await navigator.serviceWorker.register(
    "./sw.js?v=10.2.1",
    { scope: "./" }
  );

  await navigator.serviceWorker.ready;

  const app = initializeApp(FIREBASE_CONFIG);
  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration
  });

  if (!token) {
    throw new Error("Firebase 沒有取得裝置 Token，請重新開啟 App 後再試。");
  }

  const owner = chooseOwner();

  if (!window.supabase?.createClient) {
    throw new Error("Supabase 模組尚未載入。");
  }

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false } }
  );

  const { error } = await client
    .from("push_subscriptions")
    .upsert(
      {
        space_id: SPACE_ID,
        owner,
        fcm_token: token,
        platform: platformLabel(),
        enabled: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: "fcm_token" }
    );

  if (error) throw error;

  localStorage.setItem("ourMemories.pushEnabled", "true");

  return {
    owner,
    tokenEnding: token.slice(-8),
    permission
  };
}

window.enablePushNotifications = registerPush;
window.resetPushOwner = () => {
  localStorage.removeItem(OWNER_KEY);
  return true;
};

window.dispatchEvent(new CustomEvent("our-memories-push-ready"));
console.info("Our Memories Firebase Push V10.2.1 ready");
