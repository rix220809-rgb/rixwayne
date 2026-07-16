import { createClient } from "npm:@supabase/supabase-js@2";
import { JWT } from "npm:google-auth-library@9.15.1";

const SPACE_ID = "shun-wayne-kapi-period";
const SITE_URL = "https://rix220809-rgb.github.io/rixwayne/";
const OWNERS = ["蕭小舜", "懷寶"];
const TIME_ZONE = "Asia/Taipei";
type Mode = "period" | "daily_question" | "pill";

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {"content-type":"application/json; charset=utf-8"},
  });
}
function taipeiDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone:TIME_ZONE, year:"numeric", month:"2-digit", day:"2-digit",
  }).format(date);
}
function parseDate(value:string){ return new Date(`${value}T00:00:00+08:00`); }
function dayDiff(later:string, earlier:string){
  return Math.round((parseDate(later).getTime()-parseDate(earlier).getTime())/86400000);
}
function addDays(value:string, days:number){
  const d=parseDate(value); d.setUTCDate(d.getUTCDate()+days); return taipeiDate(d);
}
async function firebaseToken(account:{client_email:string;private_key:string}){
  const jwt=new JWT({
    email:account.client_email,
    key:account.private_key,
    scopes:["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const result=await jwt.authorize();
  if(!result.access_token) throw new Error("無法取得 Firebase access token");
  return result.access_token;
}
async function sendPush(projectId:string, accessToken:string, token:string, title:string, body:string, target:string){
  const r=await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,{
    method:"POST",
    headers:{authorization:`Bearer ${accessToken}`,"content-type":"application/json"},
    body:JSON.stringify({
      message:{
        token,
        notification:{title,body},
        data:{url:`${SITE_URL}?tab=${target}`},
        webpush:{fcm_options:{link:`${SITE_URL}?tab=${target}`}}
      }
    })
  });
  if(!r.ok) throw new Error(`Firebase ${r.status}: ${await r.text()}`);
}

Deno.serve(async req=>{
  try{
    if(req.method!=="POST") return response({error:"Method not allowed"},405);
    if(req.headers.get("x-cron-secret")!==Deno.env.get("CRON_SECRET")){
      return response({error:"Unauthorized"},401);
    }

    const payload=await req.json().catch(()=>({}));
    const mode=payload.mode as Mode;
    const force=payload.force===true;
    if(!["period","daily_question","pill"].includes(mode)){
      return response({error:"mode 必須是 period、daily_question 或 pill"},400);
    }

    const url=Deno.env.get("SUPABASE_URL");
    const legacy=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const rawKeys=Deno.env.get("SUPABASE_SECRET_KEYS");
    let key=legacy;
    if(!key && rawKeys){
      const parsed=JSON.parse(rawKeys);
      key=parsed.default || Object.values(parsed)[0] as string;
    }
    const firebaseJson=Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    const projectId=Deno.env.get("FIREBASE_PROJECT_ID");
    if(!url||!key||!firebaseJson||!projectId) throw new Error("缺少 Edge Function Secrets");

    const supabase=createClient(url,key,{auth:{persistSession:false}});
    const today=taipeiDate();

    const {data:subscriptions,error:subError}=await supabase
      .from("push_subscriptions")
      .select("owner,fcm_token")
      .eq("space_id",SPACE_ID)
      .eq("enabled",true);
    if(subError) throw subError;

    const {data:cycles,error:cycleError}=await supabase
      .from("period_cycles")
      .select("id,start_date,end_date")
      .eq("space_id",SPACE_ID)
      .order("start_date",{ascending:false});
    if(cycleError) throw cycleError;

    const active=(cycles||[]).find(c=>!c.end_date) || null;
    const completed=(cycles||[]).filter(c=>c.end_date);
    const activeDay=active ? dayDiff(today,active.start_date)+1 : null;

    let predictedStart:string|null=null;
    if(!active && completed.length){
      const sorted=[...completed].sort((a,b)=>a.start_date.localeCompare(b.start_date));
      const gaps:number[]=[];
      for(let i=1;i<sorted.length;i++){
        const gap=dayDiff(sorted[i].start_date,sorted[i-1].start_date);
        if(gap>=21&&gap<=45) gaps.push(gap);
      }
      const average=gaps.length?Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length):29;
      predictedStart=addDays(completed[0].start_date,average);
    }

    const notices:Array<{owner:string;type:string;title:string;body:string;target:string}>=[];

    if(mode==="period"){
      if(active && activeDay!==null && activeDay>=1 && activeDay<=4){
        for(const owner of OWNERS){
          notices.push({
            owner,type:`period_day_${activeDay}`,
            title:`🚨 小舜經期第 ${activeDay} 天`,
            body:owner==="懷寶"?"請切換溫柔照顧模式，多抱抱、少講幹話。":"今天也要好好照顧自己，不舒服就休息。",
            target:"period"
          });
        }
      }else if(predictedStart){
        const away=dayDiff(predictedStart,today);
        if(away>=1&&away<=3){
          for(const owner of OWNERS){
            notices.push({
              owner,type:`period_forecast_${away}`,
              title:`🌙 小舜警報：預估還有 ${away} 天`,
              body:owner==="懷寶"?"請提前準備飲料、抱抱與耐心。":"經期可能快到了，記得留意身體與心情。",
              target:"period"
            });
          }
        }
      }
    }

    if(mode==="pill" && active && activeDay!==null){
      const pillDay=activeDay-4;
      if(pillDay>=1&&pillDay<=28){
        for(const owner of OWNERS){
          notices.push({
            owner,type:`pill_day_${pillDay}`,
            title:`💊 21:00 避孕藥提醒｜第 ${pillDay} 天`,
            body:owner==="懷寶"?"記得提醒小舜依醫師與藥袋指示服藥。":"記得依醫師與藥袋指示服用今天的避孕藥。",
            target:"period"
          });
        }
      }
    }

    if(mode==="daily_question"){
      const {data:answers,error}=await supabase
        .from("daily_couple_answers")
        .select("author")
        .eq("space_id",SPACE_ID)
        .eq("question_date",today);
      if(error) throw error;
      const answered=new Set((answers||[]).map(a=>String(a.author)));
      for(const owner of OWNERS){
        if(!answered.has(owner)){
          notices.push({
            owner,type:"daily_question",title:"❤️ 今日必答尚未完成",
            body:answered.size?"對方已經回答了，現在只差你。":"今天的默契題還沒回答，記得在睡前完成。",
            target:"game"
          });
        }
      }
    }

    if(!notices.length){
      return response({ok:true,mode,sent:0,today,activeDay,predictedStart,reason:"今天不符合通知條件"});
    }

    const account=JSON.parse(firebaseJson);
    const access=await firebaseToken(account);
    const results:unknown[]=[];

    for(const notice of notices){
      const devices=(subscriptions||[]).filter(d=>d.owner===notice.owner);
      if(!devices.length){ results.push({owner:notice.owner,skipped:"沒有裝置 Token"}); continue; }

      if(!force){
        const {data:existing,error}=await supabase.from("notification_logs").select("id")
          .eq("space_id",SPACE_ID).eq("notification_date",today)
          .eq("notification_type",notice.type).eq("owner",notice.owner).maybeSingle();
        if(error) throw error;
        if(existing){ results.push({owner:notice.owner,skipped:"今天已經發送"}); continue; }
      }

      let sent=0;
      for(const device of devices){
        await sendPush(projectId,access,device.fcm_token,notice.title,notice.body,notice.target);
        sent++;
      }
      if(sent){
        const {error}=await supabase.from("notification_logs").upsert({
          space_id:SPACE_ID,notification_date:today,notification_type:notice.type,
          owner:notice.owner,title:notice.title,body:notice.body
        },{onConflict:"space_id,notification_date,notification_type,owner"});
        if(error) throw error;
      }
      results.push({owner:notice.owner,sent,type:notice.type});
    }

    return response({ok:true,mode,today,activeDay,predictedStart,results});
  }catch(error){
    console.error(error);
    return response({ok:false,error:error instanceof Error?error.message:String(error)},500);
  }
});
