import { createClient } from "npm:@supabase/supabase-js@2";
import { JWT } from "npm:google-auth-library@9.15.1";

const SPACE_ID = "shun-wayne-kapi-period";
const SITE_URL = "https://rix220809-rgb.github.io/rixwayne/";
const OWNERS = ["蕭小舜", "懷寶"];
const TIME_ZONE = "Asia/Taipei";
type Mode = "period" | "daily_question" | "pill" | "special_event";
type CycleRow = { id?: string; start_date: string; end_date: string | null };

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
function taipeiDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}
function parseDate(value: string) { return new Date(`${value}T00:00:00+08:00`); }
function dayDiff(later: string, earlier: string) {
  return Math.round((parseDate(later).getTime() - parseDate(earlier).getTime()) / 86400000);
}
function addDays(value: string, days: number) {
  const d = parseDate(value); d.setUTCDate(d.getUTCDate() + days); return taipeiDate(d);
}
async function firebaseToken(account: { client_email: string; private_key: string }) {
  const jwt = new JWT({
    email: account.client_email,
    key: account.private_key,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const result = await jwt.authorize();
  if (!result.access_token) throw new Error("無法取得 Firebase access token");
  return result.access_token;
}
async function sendPush(projectId: string, accessToken: string, token: string, title: string, body: string, target: string) {
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        data: { url: `${SITE_URL}?tab=${target}` },
        webpush: { fcm_options: { link: `${SITE_URL}?tab=${target}` } },
      },
    }),
  });
  if (!r.ok) throw new Error(`Firebase ${r.status}: ${await r.text()}`);
}
async function loadCycles(supabase: ReturnType<typeof createClient>) {
  const primary = await supabase
    .from("period_cycles")
    .select("id,start_date,end_date")
    .eq("space_id", SPACE_ID)
    .order("start_date", { ascending: false });

  if (!primary.error) {
    return { rows: (primary.data || []) as CycleRow[], source: "period_cycles" };
  }
  if (primary.error.code !== "PGRST205") throw primary.error;

  const fallback = await supabase
    .from("period_records")
    .select("id,start_date,end_date")
    .eq("space_id", SPACE_ID)
    .order("start_date", { ascending: false });

  if (fallback.error) throw fallback.error;
  return { rows: (fallback.data || []) as CycleRow[], source: "period_records" };
}


function lunarMonthDay(date: Date) {
  const parts = new Intl.DateTimeFormat("en-u-ca-chinese", {
    timeZone: TIME_ZONE,
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  return {
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function qixiDateForYear(year: number) {
  const start = new Date(`${year}-07-01T00:00:00+08:00`);
  const end = new Date(`${year}-10-15T00:00:00+08:00`);
  for (let date = new Date(start); date.getTime() <= end.getTime(); date.setUTCDate(date.getUTCDate() + 1)) {
    const lunar = lunarMonthDay(date);
    if (lunar.month === 7 && lunar.day === 7) return taipeiDate(date);
  }
  return null;
}

function specialEventOccurrences(today: string) {
  const year = Number(today.slice(0, 4));
  const fixed = [
    { id: "anniversary", name: "交往週年", month: 1, day: 9, emoji: "❤️" },
    { id: "wayne-birthday", name: "懷寶生日", month: 1, day: 21, emoji: "🎂" },
    { id: "valentine", name: "西洋情人節", month: 2, day: 14, emoji: "💝" },
    { id: "white-day", name: "白色情人節", month: 3, day: 14, emoji: "🤍" },
    { id: "shun-birthday", name: "小舜生日", month: 10, day: 11, emoji: "🎂" },
    { id: "christmas", name: "聖誕節", month: 12, day: 25, emoji: "🎄" },
  ];
  const rows: Array<{ id: string; name: string; date: string; emoji: string }> = [];
  for (const eventYear of [year, year + 1]) {
    for (const event of fixed) {
      rows.push({
        ...event,
        date: `${eventYear}-${String(event.month).padStart(2, "0")}-${String(event.day).padStart(2, "0")}`,
      });
    }
    const qixi = qixiDateForYear(eventYear);
    if (qixi) rows.push({ id: "qixi", name: "七夕情人節", date: qixi, emoji: "🌌" });
  }
  return rows.filter((event) => dayDiff(event.date, today) >= 0).sort((a, b) => a.date.localeCompare(b.date));
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

    const expectedSecret = Deno.env.get("CRON_SECRET");
    if (!expectedSecret || req.headers.get("x-cron-secret") !== expectedSecret) {
      return response({ error: "Unauthorized" }, 401);
    }

    const payload = await req.json().catch(() => ({}));
    const mode = payload.mode as Mode;
    const force = payload.force === true;
    if (!["period", "daily_question", "pill", "special_event"].includes(mode)) {
      return response({ error: "mode 必須是 period、daily_question、pill 或 special_event" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const legacyServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const rawSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
    let serviceRoleKey = legacyServiceRole;

    if (!serviceRoleKey && rawSecretKeys) {
      const parsed = JSON.parse(rawSecretKeys);
      serviceRoleKey = parsed.default || (Object.values(parsed)[0] as string | undefined);
    }

    const firebaseJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
    if (!supabaseUrl || !serviceRoleKey || !firebaseJson || !projectId) {
      throw new Error("缺少 Edge Function Secrets");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const today = taipeiDate();

    const { data: subscriptions, error: subscriptionError } = await supabase
      .from("push_subscriptions")
      .select("owner,fcm_token")
      .eq("space_id", SPACE_ID)
      .eq("enabled", true);
    if (subscriptionError) throw subscriptionError;

    let cycleSource = "not-needed";
    let latestCycle: CycleRow | null = null;
    let activeCycle: CycleRow | null = null;
    let activeDay: number | null = null;
    let latestPeriodDay: number | null = null;
    let predictedStart: string | null = null;

    if (mode === "period" || mode === "pill") {
      const loaded = await loadCycles(supabase);
      cycleSource = loaded.source;

      const allCycles = loaded.rows
        .filter(c => dayDiff(today, c.start_date) >= 0)
        .sort((a,b) => b.start_date.localeCompare(a.start_date));

      latestCycle = allCycles[0] || null;
      activeCycle = allCycles.find(c => !c.end_date) || null;
      activeDay = activeCycle ? dayDiff(today, activeCycle.start_date) + 1 : null;
      latestPeriodDay = latestCycle ? dayDiff(today, latestCycle.start_date) + 1 : null;

      const completed = loaded.rows.filter(c => c.end_date);
      if (!activeCycle && completed.length) {
        const sorted = [...completed].sort((a,b) => a.start_date.localeCompare(b.start_date));
        const gaps: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
          const gap = dayDiff(sorted[i].start_date, sorted[i-1].start_date);
          if (gap >= 21 && gap <= 45) gaps.push(gap);
        }
        const average = gaps.length ? Math.round(gaps.reduce((a,b) => a+b, 0) / gaps.length) : 29;
        predictedStart = addDays(completed[0].start_date, average);
      }
    }

    const notices: Array<{owner:string;type:string;title:string;body:string;target:string}> = [];

    if (mode === "period") {
      if (activeCycle && activeDay !== null && activeDay >= 1 && activeDay <= 4) {
        for (const owner of OWNERS) {
          notices.push({
            owner,
            type: `period_day_${activeDay}`,
            title: `🚨 小舜經期第 ${activeDay} 天`,
            body: owner === "懷寶" ? "請切換溫柔照顧模式，多抱抱、少講幹話。" : "今天也要好好照顧自己，不舒服就休息。",
            target: "period"
          });
        }
      } else if (predictedStart) {
        const daysAway = dayDiff(predictedStart, today);
        if (daysAway >= 1 && daysAway <= 3) {
          for (const owner of OWNERS) {
            notices.push({
              owner,
              type: `period_forecast_${daysAway}`,
              title: `🌙 小舜警報：預估還有 ${daysAway} 天`,
              body: owner === "懷寶" ? "請提前準備飲料、抱抱與耐心。" : "經期可能快到了，記得留意身體與心情。",
              target: "period"
            });
          }
        }
      }
    }

    if (mode === "pill" && latestCycle && latestPeriodDay !== null) {
      const pillDay = latestPeriodDay - 4;
      if (pillDay >= 1 && pillDay <= 28) {
        for (const owner of OWNERS) {
          notices.push({
            owner,
            type: `pill_day_${pillDay}`,
            title: `💊 21:00 避孕藥提醒｜第 ${pillDay}/28 天`,
            body: owner === "懷寶"
              ? `今天是小舜本輪避孕藥提醒第 ${pillDay} 天，記得提醒她依醫師與藥袋指示服藥。`
              : `今天是本輪避孕藥提醒第 ${pillDay} 天，記得依醫師與藥袋指示服藥。`,
            target: "period"
          });
        }
      }
    }


    if (mode === "special_event") {
      const nextEvent = specialEventOccurrences(today)[0] || null;
      const reminderDays = new Set([30, 21, 14, 7, 3, 1, 0]);
      if (nextEvent) {
        const daysAway = dayDiff(nextEvent.date, today);
        if (force || reminderDays.has(daysAway)) {
          for (const owner of OWNERS) {
            notices.push({
              owner,
              type: `special_event_${nextEvent.id}_${nextEvent.date}_${daysAway}`,
              title: daysAway === 0
                ? `${nextEvent.emoji} 今天是${nextEvent.name}！`
                : `${nextEvent.emoji} ${nextEvent.name}倒數 ${daysAway} 天`,
              body: daysAway === 0
                ? "今天是值得好好記住與慶祝的日子。"
                : `距離 ${nextEvent.name} 還有 ${daysAway} 天，可以開始準備驚喜與行程了。`,
              target: "home",
            });
          }
        }
      }
    }

    if (mode === "daily_question") {
      const { data: answers, error } = await supabase
        .from("daily_couple_answers")
        .select("author")
        .eq("space_id", SPACE_ID)
        .eq("question_date", today);
      if (error) throw error;

      const answered = new Set((answers || []).map(a => String(a.author)));
      for (const owner of OWNERS) {
        if (!answered.has(owner)) {
          notices.push({
            owner,
            type: "daily_question",
            title: "❤️ 今日必答尚未完成",
            body: answered.size ? "對方已經回答了，現在只差你。" : "今天的默契題還沒回答，記得在睡前完成。",
            target: "game"
          });
        }
      }
    }

    if (!notices.length) {
      return response({ ok:true, mode, sent:0, today, cycleSource, activeDay, latestPeriodDay, predictedStart, reason:"今天不符合通知條件" });
    }

    const serviceAccount = JSON.parse(firebaseJson);
    const accessToken = await firebaseToken(serviceAccount);
    const results: unknown[] = [];

    for (const notice of notices) {
      const devices = (subscriptions || []).filter(d => d.owner === notice.owner);
      if (!devices.length) {
        results.push({ owner: notice.owner, skipped: "沒有裝置 Token" });
        continue;
      }

      if (!force) {
        const { data: existing, error } = await supabase
          .from("notification_logs")
          .select("id")
          .eq("space_id", SPACE_ID)
          .eq("notification_date", today)
          .eq("notification_type", notice.type)
          .eq("owner", notice.owner)
          .maybeSingle();
        if (error) throw error;
        if (existing) {
          results.push({ owner: notice.owner, skipped: "今天已經發送" });
          continue;
        }
      }

      let sent = 0;
      for (const device of devices) {
        await sendPush(projectId, accessToken, device.fcm_token, notice.title, notice.body, notice.target);
        sent++;
      }

      if (sent) {
        const { error } = await supabase
          .from("notification_logs")
          .upsert({
            space_id: SPACE_ID,
            notification_date: today,
            notification_type: notice.type,
            owner: notice.owner,
            title: notice.title,
            body: notice.body
          }, { onConflict: "space_id,notification_date,notification_type,owner" });
        if (error) throw error;
      }

      results.push({ owner: notice.owner, sent, type: notice.type });
    }

    return response({
      ok:true,
      mode,
      today,
      cycleSource,
      activeDay,
      latestPeriodDay,
      pillDay: latestPeriodDay !== null ? latestPeriodDay - 4 : null,
      predictedStart,
      results
    });
  } catch (error) {
    console.error(error);
    return response({ ok:false, error:error instanceof Error ? error.message : String(error) }, 500);
  }
});
