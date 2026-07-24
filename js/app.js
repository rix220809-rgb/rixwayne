const APP_VERSION = '10.4.0';
const START_DATE = '2026-01-09';
const KAPI_BIRTHDAY = '04/19';
const SUPABASE_URL = 'https://hcrrqcqmhszllrnaqzin.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UJehDUWGpPHTKQ-qF-C5WQ_oEbbfGni';
const CLOUD_SPACE_ID = 'shun-wayne-kapi-period';
const KAPI_KEY = 'ourMemories.kapiFeedRecords.v1';
const PERIOD_KEY = 'ourMemories.periodRecords.v1';
const QUIZ_DAILY_KEY = 'ourMemories.dailyQuizState.v1';
const DAILY_QUIZ_LIMIT = 10;
const DAILY_QUESTION_ASSIGNMENT_KEY = 'ourMemories.dailyQuestionAssignments.v10.4';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let events=[], photos=[], questions=[], achievements=[], dailyQuestionBank=[], specialEvents=[];
let db = null;
let cloudReady = false;
let quiz=[], current=0, score=0, answered=0, currentMode='all', questionLocked=false;
let kapiCarouselTimer=null, kapiCarouselIndex=0;

const kapiPraises = [
  '太棒了！小卡皮今天有認真吃飯，守宮界米其林開張。',
  '卡皮進食成功！小肚肚營業中，舜懷飼育員加十分。',
  '恭喜卡皮把食物收入胃袋，今日捕獵 KPI 達標。',
  '小卡皮吃飯了！全家可以敲鑼打鼓但不要嚇到牠。',
  '卡皮今天不是只舔一下，是有把飯吃進去，偉大。',
  '進食確認！卡皮：本王今日勉強賞臉。',
  '小卡皮吃飯成功，請頒發「乖乖吃蟲獎」。',
  '卡皮今日食慾上線，蟲蟲已被正式收編。',
  '守宮小飯桶模式啟動，卡皮好棒。',
  '卡皮吃飯啦！今天不是石像，是會進食的小寶寶。',
  '太神啦卡皮，吃飯這件事被你做得像史詩任務。',
  '卡皮今日捕食成功，請把掌聲放小聲一點。',
  '小卡皮有吃，飼主安心指數上升 300%。',
  '今日卡皮不是拒食藝術家，是乖乖飯飯藝術家。',
  '卡皮吃飯成功，蟲蟲表示：我先退場。',
  '進食紀錄完成，小卡皮的肚子正在小小發光。',
  '恭喜卡皮加入今日「有吃飯俱樂部」。',
  '小卡皮今日表現：吃飯、可愛、假裝很冷酷。',
  '卡皮有吃！這是一小口，也是飼主心中的一大步。',
  '守宮界美食評論員卡皮給了今天的蟲蟲通過。',
  '卡皮吃飯了，請立刻給牠精神上的小皇冠。',
  '卡皮今日補充能量成功，準備繼續當家裡小恐龍。',
  '小卡皮賞臉吃飯，這天值得列入回憶錄。',
  '有吃有保庇，卡皮今日平安可愛。',
  '卡皮吃飯啦，飼主焦慮雲暫時散開。',
  '今日卡皮沒有跟食物裝不熟，太棒了。',
  '小卡皮進食成功，牠只是小小一隻但很給面子。',
  '卡皮把飯吃了，請大家謝謝卡皮陛下。',
  '食物已抵達卡皮胃部，任務成功。',
  '卡皮今日乖乖吃飯，世界又穩定了一點。',
  '小卡皮不只可愛，還很會讓人放心。',
  '卡皮有吃，今天可以少 google 一點守宮拒食。',
  '進食完成，卡皮正式打卡：我有吃啦。',
  '小卡皮吃飯飯，飼主心臟回到正常位置。',
  '卡皮今日食慾：已開機。',
  '小卡皮成功狩獵，雖然獵物是被送到嘴邊的。',
  '卡皮吃飯成功，這不是普通紀錄，是喜事。',
  '今日卡皮：不辜負蟲蟲，也不辜負飼主的期待。',
  '小卡皮進食，家裡立刻變成慶功宴現場。',
  '卡皮好棒！下一次供奉小蟲蟲日期已自動推算。'
];


const kapiCarouselPhotos = [
  {src:'images/kapi01.webp', title:'卡皮床上巡邏', caption:'卡皮在床上散步，像小小恐龍出門巡邏。'},
  {src:'images/kapi02.webp', title:'卡皮暫住盒觀察', caption:'透明盒裡的卡皮，正在安靜觀察外面的世界。'},
  {src:'images/kapi03.webp', title:'小舜與卡皮貼貼', caption:'小舜趴著陪卡皮，近距離貼貼的日常紀錄。'},
  {src:'images/kapi04.webp', title:'卡皮盒內休息', caption:'卡皮在盒子裡靠著躲藏處休息，狀態看起來很放鬆。'},
  {src:'images/kapi05.webp', title:'卡皮加入合照', caption:'小舜、懷寶和卡皮一起入鏡，正式成為一家人的畫面。'},
  {src:'images/kapi06.webp', title:'卡皮盒內探索', caption:'卡皮在暫住盒裡移動，適合觀察活動力與精神。'},
  {src:'images/kapi07.webp', title:'卡皮棉被探險', caption:'卡皮在棉被旁散步，今日也是小小探險家。'},
  {src:'images/kapi08.webp', title:'小舜與卡皮對望', caption:'小舜和卡皮近距離看著彼此，是很安靜的陪伴時刻。'},
  {src:'images/kapi09.webp', title:'卡皮角落觀察', caption:'卡皮在角落靠近水盆與躲藏處，記錄牠的日常位置。'},
  {src:'images/kapi10.webp', title:'卡皮小屋口休息', caption:'卡皮在小屋口探頭休息，朦朧視角也很可愛。'}
];

const shunCutePhotos = [
  {src:'images/shun_cute01.webp', title:'小舜平時是如此乖巧可愛！', caption:'平常顯示可愛小舜；警報圖片只在經期前三天與經期期間跳出。'}
];

const angryPhotos = [
  {src:'images/anger01.webp', title:'開嘴警報', caption:'小舜開始張嘴的時候，建議先把廢話吞回去。'},
  {src:'images/anger02.webp', title:'包紮復仇者', caption:'受傷了但還是很有氣勢，請溫柔一點。'},
  {src:'images/anger03.webp', title:'安靜盯人模式', caption:'這張臉的意思通常是：你最好自己反省。'},
  {src:'images/anger04.webp', title:'雙手出擊', caption:'已經進入「不要再惹我」的視覺化示範。'},
  {src:'images/anger05.webp', title:'暴怒小怪獸', caption:'這張就是經期前警報圖騰本人。'},
  {src:'images/anger06.webp', title:'躺平冷氣壓', caption:'不一定大爆炸，但很可能一句話都不想聽。'},
  {src:'images/anger07.webp', title:'黑衣冷臉', caption:'如果你現在白目，後果請自行承擔。'},
  {src:'images/anger08.webp', title:'牛仔外套審判', caption:'審判席已開啟，請陳述你為何惹到小舜。'},
  {src:'images/anger09.webp', title:'委屈也有殺氣', caption:'這張代表：她可能想哭，也可能想先瞪你。'},
  {src:'images/anger10.webp', title:'噘嘴警示', caption:'看起來可愛，但其實是前兆。'}
];

const periodWarnings = [
  '小舜生理期將近！逼逼！請勿挑戰魔王。',
  '警告：小舜情緒氣壓下降中，請備妥抱抱與甜食。',
  '小舜月亮模式啟動，張懷請進入溫柔駕駛模式。',
  '前方高能，小舜生理期倒數中，請不要白目。',
  '今日任務：不要惹小舜、不要反駁小舜、不要讓小舜餓到。',
  '小舜即將進入經期副本，推薦裝備：熱飲、抱抱、耐心。',
  '系統提示：小舜不是脾氣差，是子宮在開搖滾演唱會。',
  '張懷請注意，小舜的血條與耐心條同步下降中。',
  '生理期預警！現在開始講話請先過腦三次。',
  '小舜情緒天氣：局部暴雨，偶有可愛雷陣雨。',
  '溫馨提醒：此時的小舜需要被愛，不需要被講道理。',
  '小舜進入「一碰就炸但還是很可愛」模式。',
  '警報！小舜即將月經來襲，請準備貢品。',
  '今日張懷守則：嘴甜一點、動作快一點、不要皮。',
  '小舜經期倒數中，請勿進行高風險發言。',
  '子宮施工中，請繞道並保持溫柔。',
  '小舜目前是珍貴易碎品，請輕拿輕放。',
  '生理期前哨站開啟，請準備暖暖包與愛心。',
  '小舜不是兇，是身體正在更新系統。',
  '小舜月亮能量上升，張懷請自動切換成照顧模式。',
  '本日禁止事項：冷處理、講道理、讓小舜等太久。',
  '小舜即將進入「我沒有生氣但你最好小心」狀態。',
  '經期警報：請張懷把白目值歸零。',
  '小舜體內小怪獸醒了，請用抱抱馴服。',
  '今日建議：給小舜熱熱的東西與穩穩的愛。',
  '小舜月經雲正在靠近，局部地區會出現想哭。',
  '此時小舜的「被理解需求」提升 300%。',
  '張懷請注意，現在不是辯論賽，是生存遊戲。',
  '小舜情緒伺服器負載偏高，請降低刺激。',
  '生理期將近，請準備：「我在」「我陪妳」「妳辛苦了」。',
  '小舜不是難搞，是身體在辦大型抗議活動。',
  '今日隱藏任務：讓小舜覺得自己被好好疼愛。',
  '經期前 3 天，張懷請啟動男友防災計畫。',
  '小舜可愛但危險，請保持安全距離並投放甜食。',
  '系統偵測到小舜耐心不足，請立即補充抱抱。',
  '小舜即將進入紅色警戒，請勿亂按情緒按鈕。',
  '生理期快到了，請不要問「妳是不是又怎樣」。',
  '小舜目前需要的是共感，不是分析報告。',
  '張懷請記得：小舜生氣照不是警告，是最後通牒。',
  '經期倒數中，今日最佳策略：乖、甜、快、抱。'
];

async function loadData(){
  try {
    if (window.supabase) {
      db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      cloudReady = true;
    }
  } catch(e) {
    console.warn('Supabase init failed', e);
    cloudReady = false;
  }

  async function loadDataFile(path){
    const url = `${path}?v=${APP_VERSION}&t=${Date.now()}`;
    const response = await fetch(url, { cache:'no-store' });
    if(!response.ok) throw new Error(`${path} 載入失敗：HTTP ${response.status}`);
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch(e) {
      console.error(`${path} JSON parse failed`, e, text.slice(0,300));
      throw new Error(`${path} 格式錯誤：${e.message}`);
    }
  }

  try {
    events = await loadDataFile('data/events.json');
    photos = await loadDataFile('data/photos.json');
    questions = await loadDataFile('data/questions.json');
    achievements = await loadDataFile('data/achievements.json');
    dailyQuestionBank = await loadDataFile('data/daily_question_bank.json');
    specialEvents = await loadDataFile('data/special_events.json');
  } catch(e) {
    console.error('data load failed', e);
    events = events || [];
    photos = photos || [];
    questions = questions || [];
    achievements = achievements || [];
    window.__LOAD_ERROR__ = e.message || String(e);
  }

  init();
}
function isISODate(s){
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}
function todayISO(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function localDate(s){
  if(!isISODate(s)) return null;
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}
function addDaysISO(dateStr, days){
  const dt = localDate(dateStr) || localDate(todayISO());
  dt.setDate(dt.getDate() + Number(days || 0));
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth()+1).padStart(2,'0');
  const dd = String(dt.getDate()).padStart(2,'0');
  return `${yy}-${mm}-${dd}`;
}
function addDays(s,n){ return addDaysISO(isISODate(s) ? s : todayISO(), n); }
function dayDiff(a,b){
  const da = localDate(a);
  const db = localDate(b);
  if(!da || !db) return 0;
  return Math.round((da-db)/(1000*60*60*24));
}
function fmt(s){
  if(!isISODate(s)) return '—';
  const [y,m,d]=s.split('-');
  return `${m}/${d}`;
}
function sample(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function hashString(s=''){
  return [...String(s)].reduce((a,c)=>a + c.charCodeAt(0), 0);
}
function pickFromDate(arr, dateSeed=todayISO(), extra=0){
  if(!arr.length) return null;
  const idx = (hashString(dateSeed) + extra) % arr.length;
  return arr[idx];
}

function seededRandom(seed){
  let t = seed + 0x6D2B79F5;
  return function(){
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle(arr, seedText){
  const rand = seededRandom(hashString(seedText));
  return [...arr].sort(() => rand() - 0.5);
}
function quizDayKey(mode){
  return `${todayISO()}::${mode}`;
}
function getDailyQuizState(){
  return loadJSON(QUIZ_DAILY_KEY, {});
}
function setDailyQuizState(state){
  saveJSON(QUIZ_DAILY_KEY, state);
}
function isDailyQuizDone(mode){
  const state = getDailyQuizState();
  return !!state[quizDayKey(mode)]?.completed;
}
function markDailyQuizDone(mode, total, finalScore){
  const state = getDailyQuizState();
  state[quizDayKey(mode)] = {
    completed: true,
    date: todayISO(),
    mode,
    total,
    score: finalScore,
    finishedAt: new Date().toISOString()
  };
  setDailyQuizState(state);
}
function buildDailyQuiz(pool, mode){
  return seededShuffle(pool, `${todayISO()}-${mode}-our-memories-v4.6`).slice(0, DAILY_QUIZ_LIMIT);
}

function loadJSON(key, fallback){ try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch(e){return fallback} }
function saveJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

function cleanupOldServiceWorkers(){
  if (window.caches) {
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.includes('our-memories') && k !== 'our-memories-v10.4.0').map(k => caches.delete(k))))
      .catch(()=>{});
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=10.4.0').catch(err=>console.warn('SW register failed', err));
  }
}


/* ===== v8.2.3 mobile-safe image loading ===== */
function repoBaseUrl(){
  const base = new URL('.', document.baseURI);
  return base.href;
}
function assetUrl(path){
  const clean = String(path || '').replace(/^\.?\//, '');
  return new URL(clean, repoBaseUrl()).href + `?v=${encodeURIComponent(APP_VERSION)}`;
}
function jpgFallbackUrl(src){
  try{
    const u = new URL(src, document.baseURI);
    u.pathname = u.pathname.replace(/\.webp$/i, '.jpg');
    u.searchParams.set('v', APP_VERSION);
    return u.href;
  }catch(e){
    return String(src || '').replace(/\.webp(\?.*)?$/i, '.jpg?v=' + APP_VERSION);
  }
}
function imageFallback(img, label='圖片載入失敗'){
  if(!img) return;

  if(!img.dataset.jpgTried && /\.webp(?:\?|$)/i.test(img.currentSrc || img.src || '')){
    img.dataset.jpgTried = '1';
    img.src = jpgFallbackUrl(img.currentSrc || img.src);
    return;
  }

  if(img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  const wrap = document.createElement('div');
  wrap.className = 'image-fallback';
  wrap.innerHTML = `<span>🖼️</span><b>${label}</b><small>${img.getAttribute('src') || ''}</small>`;
  img.replaceWith(wrap);
}
function bindImageFallbacks(scope=document){
  scope.querySelectorAll('img').forEach(img=>{
    img.loading = img.closest('dialog') ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.onerror = () => imageFallback(img, img.alt || '圖片載入失敗');
  });
}


const dailyHeroLines = ["今天也是值得紀念的一天。", "謝謝你們一起走到了現在。", "每一張照片，都是未來會懷念的現在。", "今天也請好好珍惜彼此。", "卡皮今天也在幫你們見證回憶。"];
function getDailyHeroLine(){
  return pickFromDate(dailyHeroLines, todayISO(), 121) || dailyHeroLines[0];
}
function renderDailyHeroLine(){
  const el = $('#todayLine');
  if(el) el.textContent = getDailyHeroLine();
}

function daysTogether(){
  const start = localDate(START_DATE);
  const today = new Date();
  return Math.max(0, Math.floor((today-start)/(1000*60*60*24))+1);
}
function sameMonthDay(d1,d2){return isISODate(d1) && isISODate(d2) && d1.slice(5,10)===d2.slice(5,10)}
function pickDailyMemory(){
  if(!events.length) return {event:{id:'empty', title:'尚未載入回憶', summary:'請確認 data/events.json 已上傳。', category:'system', rank:'—'}, title:'今日回憶錄'};
  const today = localDate(todayISO());
  const iso = todayISO();
  const lastYear = String(today.getFullYear()-1)+iso.slice(4);
  let match = events.find(e=>isISODate(e.date) && e.date===lastYear);
  if(match) return {event:match, title:'一年前的今天'};
  match = events.find(e=>sameMonthDay(e.date, iso));
  if(match) return {event:match, title:'今天的回憶紀念日'};
  const pool = events.filter(e=>e.rank==='legendary');
  const index = today.getDate() % Math.max(1,pool.length);
  return {event:pool[index] || events[0], title:'今日回憶錄'};
}
function photoByEvent(id){
  const ev = events.find(e => e.id === id);
  // v4.5: LINE／純文字回憶一律不套照片，避免被舊資料或快取誤配成第一張合照
  if (!ev || isDialogueEvent(ev) || String(id).startsWith('EV-LINE')) return null;
  return photos.find(p => p.eventId === id) || null;
}
function isDialogueEvent(ev){return ev?.id?.startsWith('EV-LINE') || ev?.category==='對話' || ev?.tags?.includes('LINE')}
function eventIcon(ev){
  if(ev?.id==='EV-0032') return '🦎';
  if(isDialogueEvent(ev)) return '💬';
  if(ev?.category==='工作') return '💿';
  if(ev?.category==='感情') return '🫂';
  if(ev?.category==='禮物') return '🎁';
  if(ev?.category==='默契') return '🧠';
  return '✨';
}
async function init(){
  cleanupOldServiceWorkers();

  try { setupTabs(); } catch(e) { console.error('setupTabs failed', e); }

  try {
    $('#daysTogether').textContent = daysTogether();

    if (window.__LOAD_ERROR__) {
      $('#todayLine').textContent = '資料載入失敗，請確認 data/questions.json 是否正確。';
      $('#flashbackCard').innerHTML = `<div class="feature-body"><h3>網站資料沒有完整載入</h3><p>按鈕已啟動，但回憶、照片與題庫需要 data 檔案完整才會出現。</p><div class="story">${window.__LOAD_ERROR__}</div></div>`;
      return;
    }

    const daily = pickDailyMemory();
    $('#flashbackTitle').textContent = daily.title;
    $('#todayLine').textContent = `${daily.title}：${daily.event.title}`;
    renderFlashback(daily.event);
    renderDailyHeroLine();
    await mergeDailyAnswersIntoQuestionPool();
    renderStats();
    renderMemories();
    renderAlbum();
    await renderCareSummary();
    await renderMoodBoard();
    await renderKapi();
    await renderPeriod();
    await renderDailyCoupleChallenge();
    startGame('all');
    bindImageFallbacks();
    setTimeout(()=>showHomePeriodPopup(), 700);

    try {
      const after = sessionStorage.getItem('ourMemories.afterReloadTab');
      if(after){ sessionStorage.removeItem('ourMemories.afterReloadTab'); setTimeout(()=>showTab(after), 120); }
    } catch(e) {}
  } catch(e) {
    console.error('init render failed', e);
    $('#todayLine').textContent = '網站初始化發生錯誤，但底部按鈕已啟動。';
    $('#flashbackCard').innerHTML = `<div class="feature-body"><h3>網站初始化失敗</h3><p>請使用 v7.4 完整覆蓋上傳。</p><div class="story">${e.message || e}</div></div>`;
  }
}
function renderFlashback(ev){
  const ph = photoByEvent(ev.id);
  $('#flashbackCard').innerHTML = `
    ${ph ? `<img class="feature-img" src="${assetUrl(ph.src)}" alt="${ev.title}">` : `<div class="feature-symbol"><span>${eventIcon(ev)}</span><b>${isDialogueEvent(ev)?'LINE MEMORY':'TEXT MEMORY'}</b></div>`}
    <div class="feature-body">
      <div class="badge-row"><span class="badge">${ev.rank}</span><span class="badge">${ev.category}</span></div>
      <h3>${ev.title}</h3><p>${ev.summary}</p>
      ${(ev.chatFragments||[]).slice(0,2).map(x=>`<div class="story">${x}</div>`).join('')}
    </div>`;
}
function renderStats(){
  const lineQ=questions.filter(q=>q.source==='line').length;
  $('#stats').innerHTML = [
    ['回憶事件', events.length], ['照片', photos.length], ['對話題', lineQ], ['成就', achievements.length]
  ].map(([k,v])=>`<div class="stat"><b>${v}</b><span>${k}</span></div>`).join('');
}
function bindClick(selector, handler){
  const el = $(selector);
  if(el) el.onclick = handler;
}
function setupTabs(){
  $$('.bottom-nav button').forEach(btn=>btn.onclick=()=>showTab(btn.dataset.tab));
  $$('.mode-card').forEach(btn=>btn.onclick=()=>{showTab('game'); startGame(btn.dataset.mode)});
  bindClick('#nextBtn', nextQuestion);
  bindClick('#restartBtn', ()=>startGame(currentMode));
  bindClick('#closeModal', ()=>$('#modal')?.close());
  if($('#kapiDate')) $('#kapiDate').value=todayISO();
  if($('#periodStartDate')) $('#periodStartDate').value=todayISO();
  if($('#periodEndDate')) $('#periodEndDate').value=addDays(todayISO(),5);
  bindClick('#kapiAteBtn', ()=>addKapiRecord('fed'));
  bindClick('#kapiRefusedBtn', ()=>addKapiRecord('refused'));
  bindClick('#periodSaveBtn', ()=>savePeriodRange());
  bindClick('#periodEstimateBtn', ()=>toast('下方已顯示下一次經期預估。'));
  bindClick('#moodPostBtn', ()=>addMoodPost());
}
function showTab(id){
  $$('.page').forEach(p=>p.classList.toggle('active', p.id===id));
  $$('.bottom-nav button').forEach(b=>b.classList.toggle('active', b.dataset.tab===id));
  try { window.scrollTo({top:0, behavior:'smooth'}); } catch(e) { window.scrollTo(0,0); }
  if(id==='home') showHomePeriodPopup();
  if(id==='kapi') renderKapi();
  if(id==='period') renderPeriod();
  if(id==='mood') renderMoodBoard();
}
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5)}
function modeFilter(q){
  if(q?.type === 'sequence') return false;
  if(q?.type === 'choice' && (!Array.isArray(q.options) || q.options.some(o=>String(o).trim()===''))) return false;
  if(currentMode==='all') return true;
  if(currentMode==='line') return q.source==='line' || q.tags?.includes('對話');
  if(currentMode==='photo') return q.source==='photo' || !!q.image;
  if(currentMode==='pet') return q.source==='pet' || q.tags?.includes('卡皮');
  return true;
}
function startGame(mode='all'){
  currentMode=mode; current=0; score=0; answered=0; questionLocked=false;
  const names={all:'混合挑戰',line:'對話電波',photo:'圖片回憶',pet:'卡皮任務'};
  $('#gameTitle').textContent=names[mode]||'混合挑戰';

  const pool = questions.filter(modeFilter);
  const safePool = pool.length ? pool : questions;
  quiz = buildDailyQuiz(safePool, mode);

  updateScore();

  if (isDailyQuizDone(mode)) {
    renderAlreadyDone();
    return;
  }
  renderQuestion();
}
function updateScore(){ $('#score').textContent=score; $('#answered').textContent=answered; }
function renderQuestion(){
  if(current >= quiz.length){ renderResult(); return; }
  questionLocked=false;
  $('#nextBtn').disabled=false;
  $('#nextBtn').textContent='下一題';
  const q = quiz[current];
  let html = `${q.image?`<img src="${assetUrl(q.image)}" alt="question image">`:''}<div class="badge-row"><span class="badge">每日第 ${current+1}/${quiz.length} 題</span><span class="badge">${q.source||'memory'}</span>${(q.tags||[]).slice(0,2).map(t=>`<span class="badge">${t}</span>`).join('')}</div><h3>${q.question}</h3>`;
  if(q.type==='open'){
    html += `<textarea class="option" rows="4" placeholder="寫下你的答案，等等可以問對方是不是也這樣想。"></textarea><button class="option" data-open="1">收藏這題</button>`;
  } else if(q.type==='sequence'){
    html += `<p class="story">先在心裡排序，再點「看答案」。</p>${q.options.map((o,i)=>`<button class="option" data-seq="${i}">${i+1}. ${o}</button>`).join('')}<button class="option" data-showseq="1">看建議排序</button>`;
  } else {
    html += q.options.map((o,i)=>`<button class="option" data-answer="${i}">${o}</button>`).join('');
  }
  html += `<div id="explain"></div>`;
  $('#quizCard').innerHTML=html;
  $('#quizCard').querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>checkAnswer(Number(btn.dataset.answer), q));
  const openBtn=$('#quizCard').querySelector('[data-open]'); if(openBtn) openBtn.onclick=()=>{if(questionLocked) return; questionLocked=true; answered++; updateScore(); explain(q,'已收藏這題，這題沒有標準答案。')};
  const seqBtn=$('#quizCard').querySelector('[data-showseq]'); if(seqBtn) seqBtn.onclick=()=>{if(questionLocked) return; questionLocked=true; answered++; score++; updateScore(); explain(q,`建議排序：${q.answer.map(i=>q.options[i]).join(' → ')}`)};
}
function checkAnswer(i,q){
  if(questionLocked) return;
  questionLocked=true;
  const opts=$$('#quizCard .option[data-answer]'); opts.forEach(b=>b.disabled=true);
  answered++;
  if(i===q.answer){ score++; opts[i].classList.add('correct'); toast('答對了！'); }
  else { opts[i].classList.add('wrong'); if(opts[q.answer]) opts[q.answer].classList.add('correct'); toast('這題被回憶偷襲了'); }
  updateScore(); explain(q, q.story || '這是一段被收進 Our Memories 的回憶。');
}
function explain(q,text){ $('#explain').innerHTML=`<div class="story">${text}</div>`; }
function nextQuestion(){
  if(current >= quiz.length - 1){ current = quiz.length; renderResult(); return; }
  current++;
  renderQuestion();
}
function renderResult(){
  const total = Math.min(DAILY_QUIZ_LIMIT, quiz.length || answered || 0);
  const percent = total ? Math.round((score / total) * 100) : 0;
  markDailyQuizDone(currentMode, total, score);
  $('#nextBtn').disabled = true;
  $('#nextBtn').textContent = '今日已完成';
  $('#quizCard').innerHTML = `
    <div class="result-panel">
      <div class="result-orb">${percent}<small>%</small></div>
      <p class="eyebrow">Daily Memory Quiz Complete</p>
      <h3>答題結束！明天再來</h3>
      <p>今天的 10 題已完成。你答對 <b>${score}</b> 題，共 <b>${total}</b> 題。</p>
      <div class="story">為了避免題目一直重複，每天每個模式只開放 10 題。明天會自動換新的每日題組。</div>
      <div class="result-actions">
        <button onclick="showTab('memories')">去看回憶錄</button>
        <button onclick="showTab('home')" class="ghost-inline">回首頁</button>
      </div>
    </div>`;
}
function renderAlreadyDone(){
  $('#nextBtn').disabled = true;
  $('#nextBtn').textContent = '明天再來';
  const state = getDailyQuizState()[quizDayKey(currentMode)];
  const total = state?.total || DAILY_QUIZ_LIMIT;
  const finalScore = state?.score ?? 0;
  const percent = total ? Math.round((finalScore / total) * 100) : 0;
  $('#quizCard').innerHTML = `
    <div class="result-panel">
      <div class="result-orb">${percent}<small>%</small></div>
      <p class="eyebrow">Today's Quiz Finished</p>
      <h3>答題結束！明天再來</h3>
      <p>今天這個模式的 10 題已經玩完了。為了避免題目重複，明天再開新題組。</p>
      <div class="result-actions">
        <button onclick="showTab('memories')">去看回憶錄</button>
        <button onclick="showTab('home')" class="ghost-inline">回首頁</button>
      </div>
    </div>`;
}

function refreshAfterCloudWrite(tabName){
  try { sessionStorage.setItem('ourMemories.afterReloadTab', tabName || 'home'); } catch(e) {}
  setTimeout(()=>window.location.reload(), 650);
}

function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1800); }
function renderMemories(){
  $('#memoryList').innerHTML = events.map(ev=>{
    const ph = (isDialogueEvent(ev) || ev.id.startsWith('EV-LINE')) ? null : photoByEvent(ev.id);
    return `<button class="memory-row ${ph?'has-photo':'text-memory'}" data-event="${ev.id}">${ph ? `<img src="${assetUrl(ph.src)}" alt="${ev.title}">` : `<div class="memory-symbol"><span>${eventIcon(ev)}</span><small>${isDialogueEvent(ev)?'對話':'文字'}</small></div>`}<div><h3>${ev.title}</h3><p>${ev.summary}</p></div></button>`;
  }).join('');
  $$('#memoryList [data-event]').forEach(b=>b.onclick=()=>openEvent(b.dataset.event));
}
function renderAlbum(){
  $('#photoCount').textContent=`${photos.length} photos`;
  $('#albumGrid').innerHTML=photos.map(p=>`<button class="photo-tile" data-photo="${p.id}"><img src="${assetUrl(p.src)}" alt="${p.title}"><b>${p.title}</b><small>${p.metadata.orientation} · ${p.metadata.webSize}</small></button>`).join('');
  $$('#albumGrid [data-photo]').forEach(b=>b.onclick=()=>openPhoto(b.dataset.photo));
}


async function cloudSelect(table){
  if(!db) return null;
  const orderField = table==='kapi_feed_records' ? 'feed_date' : 'start_date';
  const { data, error } = await db.from(table).select('*').eq('space_id', CLOUD_SPACE_ID).order(orderField, { ascending:false });
  if(error){ console.warn(error); return null; }
  return data || [];
}
async function cloudInsert(table, payload){
  if(!db) throw new Error('Supabase not initialized');
  const { error } = await db.from(table).insert({ ...payload, space_id: CLOUD_SPACE_ID });
  if(error) throw error;
}
async function cloudDelete(table, id){
  if(!db) throw new Error('Supabase not initialized');
  const { error } = await db.from(table).delete().eq('id', id).eq('space_id', CLOUD_SPACE_ID);
  if(error) throw error;
}
function normalizeKapiRows(rows){
  return (rows||[]).map(r=>({id:r.id, date:r.feed_date || r.date, status:r.status, food:r.food||'', amount:r.amount||'', note:r.note||''})).sort((a,b)=>b.date.localeCompare(a.date));
}
async function getKapiRecords(){
  const cloud = await cloudSelect('kapi_feed_records');
  if(cloud) return normalizeKapiRows(cloud);
  return loadJSON(KAPI_KEY, []);
}
function setKapiRecords(records){ saveJSON(KAPI_KEY, records); }
function nextKapiRange(record){
  if(!record) return null;
  if(record.status==='fed') return {start:addDaysISO(record.date,3), end:addDaysISO(record.date,4), type:'餵食日'};
  return {start:addDaysISO(record.date,1), end:addDaysISO(record.date,2), type:'再試一次'};
}
function kapiStatusText(range){
  if(!range) return '還沒有餵食紀錄，先新增一次紀錄，卡皮雷達就會開始運作。';
  const today=todayISO();
  const toStart=dayDiff(range.start,today), toEnd=dayDiff(range.end,today);
  if(toStart>0) return `距離${range.type}還有 ${toStart} 天，預估 ${fmt(range.start)}～${fmt(range.end)}。`;
  if(toEnd>=0) return `卡皮雷達逼逼！今天在預估${range.type}區間：${fmt(range.start)}～${fmt(range.end)}。`;
  return `已超過預估${range.type} ${Math.abs(toEnd)} 天，可以觀察卡皮狀態後安排下一次。`;
}
async function renderCareSummary(){
  const kapiLast = (await getKapiRecords()).sort((a,b)=>b.date.localeCompare(a.date))[0];
  const kapiRange = nextKapiRange(kapiLast);
  const periodInfo = await getPeriodPrediction();
  $('#careSummary').innerHTML = `
    <button class="care-pill" onclick="showTab('kapi')"><b>🦎 卡皮提醒</b><span>${kapiRange ? `${fmt(kapiRange.start)}～${fmt(kapiRange.end)}` : '尚未紀錄'}</span></button>
    <button class="care-pill" onclick="showTab('period')"><b>🩸 小舜警報</b><span>${periodInfo.nextStart ? `${fmt(periodInfo.nextStart)} 預估` : '待紀錄'}</span></button>`;
}
async function addKapiRecord(status){
  const date=$('#kapiDate').value || todayISO();
  const food = $('#kapiFood').value.trim();
  const amount = $('#kapiAmount').value.trim();
  const note = $('#kapiNote').value.trim();

  if(!food && !amount && !note){
    toast('請至少填「吃什麼、份量、備註」其中一欄，不然會變成空白紀錄。');
    return;
  }

  const record={date, status, food, amount, note};
  try{
    if(db) await cloudInsert('kapi_feed_records', {feed_date:date, status, food:record.food, amount:record.amount, note:record.note});
    else {
      const records=[{id:Date.now(),...record},...loadJSON(KAPI_KEY, [])].slice(0,80);
      setKapiRecords(records);
    }
  }catch(e){
    console.error('kapi insert failed', e);
    toast('卡皮紀錄沒有寫入成功，請檢查 Supabase 權限。');
    return;
  }

  $('#kapiFood').value=''; $('#kapiAmount').value=''; $('#kapiNote').value='';
  toast(status==='fed' ? '卡皮紀錄已寫入 Supabase，畫面即將重新整理。' : '未進食紀錄已寫入 Supabase，畫面即將重新整理。');
  refreshAfterCloudWrite('kapi');
}
async function deleteKapiRecord(id){
  try{
    if(db) await cloudDelete('kapi_feed_records', id);
    else setKapiRecords(loadJSON(KAPI_KEY, []).filter(r=>String(r.id)!==String(id)));
    await renderKapi(); await renderCareSummary(); toast('已刪除這筆卡皮紀錄');
  }catch(e){ console.error(e); toast('刪除失敗，請檢查 Supabase 權限。');}
}

function renderKapiCarousel(){
  const list = kapiCarouselPhotos.length ? kapiCarouselPhotos : [{src:'images/photo0032.webp', title:'卡皮', caption:'卡皮輪播圖'}];
  kapiCarouselIndex = 0;
  return `<div class="kapi-carousel" data-carousel-count="${list.length}">
    ${list.map((p,i)=>`<div class="kapi-slide ${i===0?'active':''}" data-kapi-slide="${i}">
      <img src="${p.src}?v=${APP_VERSION}" alt="${p.title}">
      <div class="kapi-slide-caption"><b>${p.title}</b><span>${i+1}/${list.length}｜${p.caption}</span></div>
    </div>`).join('')}
    <button class="kapi-arrow left" type="button" onclick="moveKapiSlide(-1)">‹</button>
    <button class="kapi-arrow right" type="button" onclick="moveKapiSlide(1)">›</button>
    <div class="kapi-dots">${list.map((p,i)=>`<button type="button" class="kapi-dot ${i===0?'active':''}" data-kapi-dot="${i}" onclick="setKapiSlide(${i})"></button>`).join('')}</div>
  </div>`;
}
function setKapiSlide(index){
  const slides = $$('[data-kapi-slide]');
  const dots = $$('[data-kapi-dot]');
  if(!slides.length) return;
  kapiCarouselIndex = ((index % slides.length) + slides.length) % slides.length;
  slides.forEach((s,i)=>s.classList.toggle('active', i===kapiCarouselIndex));
  dots.forEach((d,i)=>d.classList.toggle('active', i===kapiCarouselIndex));
}
function moveKapiSlide(step){ setKapiSlide(kapiCarouselIndex + step); }
function startKapiCarousel(){
  const slides = $$('[data-kapi-slide]');
  if(slides.length <= 1) return;
  if(kapiCarouselTimer) clearInterval(kapiCarouselTimer);
  kapiCarouselTimer = setInterval(()=>moveKapiSlide(1), 3000);
}

function renderCutePeriodImage(){
  const cute = shunCutePhotos[0];
  return `<div class="alert-placeholder">
    <img src="${cute.src}?v=${APP_VERSION}" alt="${cute.title}">
    <div class="cute-overlay"><b>${cute.title}</b><p>${cute.caption}</p></div>
  </div>`;
}

async function renderKapi(){
  const records=(await getKapiRecords()).filter(r=>r && r.date && r.status && ((r.food||'').trim() || (r.amount||'').trim() || (r.note||'').trim())).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const last=records[0];
  const range=nextKapiRange(last);
  $('#kapiCard').innerHTML = `${renderKapiCarousel()}<div class="feature-body"><div class="badge-row"><span class="badge">🦎 Pet</span><span class="badge">生日 ${KAPI_BIRTHDAY}</span><span class="badge">${cloudReady?'Supabase 雲端':'本機備援'}</span><span class="badge">10 張輪播</span></div><h3>卡皮照護雷達</h3><p>${kapiStatusText(range)}</p>${last?`<div class="story">上次紀錄：${fmt(last.date)}｜${last.status==='fed'?'有吃飯':'未進食'}${last.food?`｜${last.food}`:''}${last.amount?`｜${last.amount}`:''}</div>`:''}</div>`;
  $('#kapiHistory').innerHTML = records.length ? records.map(r=>{
    const nr=nextKapiRange(r);
    return `<div class="record-row"><div><b>${fmt(r.date)} ${r.status==='fed'?'✅ 有吃飯':'🥲 未進食'}</b><p>${r.food||'未填食物'} ${r.amount?`・${r.amount}`:''}${r.note?`<br>${r.note}`:''}</p><small>下次：${fmt(nr.start)}～${fmt(nr.end)} ${nr.type}</small></div><button onclick="deleteKapiRecord('${r.id}')">刪除</button></div>`;
  }).join('') : `<div class="empty-card">還沒有卡皮餵食紀錄。輸入日期後按「有吃」或「未進食」就會開始推算。</div>`;
  startKapiCarousel();
}


function seedPeriods(){
  return [
    {id:'seed-20260416', start:'2026-04-16', end:'2026-04-20', note:'初始紀錄'},
    {id:'seed-20260514', start:'2026-05-14', end:'2026-05-18', note:'初始紀錄'},
    {id:'seed-20260612', start:'2026-06-12', end:'2026-06-16', note:'初始紀錄'}
  ];
}
function normalizePeriodRows(rows){
  return (rows||[]).map(r=>({id:r.id, start:r.start_date || r.start, end:r.end_date || r.end, note:r.note||''})).sort((a,b)=>a.start.localeCompare(b.start));
}

function dedupePeriodRecords(records){
  const map = new Map();
  (records||[]).forEach(r=>{
    if(!r || !r.start || !r.end) return;
    const key = `${r.start}|${r.end}`;
    if(!map.has(key)) map.set(key, r);
    else {
      const old = map.get(key);
      if(String(r.id||'').localeCompare(String(old.id||'')) < 0) map.set(key, r);
    }
  });
  return [...map.values()].sort((a,b)=>a.start.localeCompare(b.start));
}

async function getPeriodRecords(){
  const cloud = await cloudSelect('period_records');
  if(cloud) return dedupePeriodRecords(normalizePeriodRows(cloud));
  const stored = loadJSON(PERIOD_KEY, null);
  if(stored) return dedupePeriodRecords(stored.map(r=>({id:r.id,start:r.start,end:r.end,note:r.note||''})));
  const seed=dedupePeriodRecords(seedPeriods()); saveJSON(PERIOD_KEY, seed); return seed;
}
function setPeriodRecords(records){ saveJSON(PERIOD_KEY, records); }
function getCycleLength(records){ return 30; }
function averagePeriodDays(records){
  const lens = records.map(r=>dayDiff(r.end,r.start)+1).filter(n=>n>=2&&n<=10);
  if(!lens.length) return 6;
  return Math.round(lens.reduce((a,b)=>a+b,0)/lens.length);
}
async function getPeriodPrediction(){
  const records=(await getPeriodRecords()).sort((a,b)=>a.start.localeCompare(b.start));
  const cycle=getCycleLength(records);
  const avgDays=averagePeriodDays(records);
  let next=records[records.length-1]?.start || todayISO();
  const today=todayISO();
  while(dayDiff(next,today)<=0) next=addDaysISO(next,cycle);
  return {records, cycle, avgDays, nextStart:next, nextEnd:addDaysISO(next,Math.max(1,avgDays-1)), warningDays:dayDiff(next,today)};
}
function findActivePeriod(records){
  const today=todayISO();
  return records.find(r=>dayDiff(today,r.start)>=0 && dayDiff(today,r.end)<=0) || null;
}
async function savePeriodRange(){
  const start=$('#periodStartDate').value || todayISO();
  const end=$('#periodEndDate').value || addDays(start,5);
  const note=$('#periodNote').value.trim();
  if(dayDiff(end,start)<0){ toast('結束日不能早於開始日'); return; }

  const existing = await getPeriodRecords();
  if(existing.some(r=>r.start===start && r.end===end)){
    toast('這段經期已經記錄過了，不會重複新增。');
    return;
  }

  try{
    if(db) await cloudInsert('period_records', {start_date:start, end_date:end, note});
    else {
      const records=(await getPeriodRecords()).filter(r=>!(r.start===start && r.end===end));
      records.push({id:Date.now(), start, end, note});
      setPeriodRecords(dedupePeriodRecords(records));
    }
  }catch(e){
    console.error('period insert failed', e);
    toast('經期紀錄沒有寫入成功，請檢查 Supabase 權限。');
    return;
  }
  $('#periodNote').value='';
  toast('經期紀錄已寫入 Supabase，畫面即將重新整理。');
  refreshAfterCloudWrite('period');
}
async function deletePeriodRecord(idOrStart){
  try{
    if(db) await cloudDelete('period_records', idOrStart);
    else setPeriodRecords((await getPeriodRecords()).filter(r=>String(r.id)!==String(idOrStart) && r.start!==idOrStart));
    await renderPeriod(); await renderCareSummary(); toast('已刪除這筆經期紀錄');
  }catch(e){ console.error(e); toast('刪除失敗，請檢查 Supabase 權限。');}
}
function getPeriodWarning(){ return pickFromDate(periodWarnings, todayISO(), 7) || periodWarnings[0]; }
function getDailyAngryPhoto(){ return pickFromDate(angryPhotos, todayISO(), 13) || angryPhotos[0]; }
function isPeriodAlertActive(info, active){ return (info.warningDays >= 0 && info.warningDays <= 3) || !!active; }
function showPeriodAlertPopup(mood, warningText, force=false){
  if(!mood || !$('#modal') || !$('#modalContent')) return;
  const key = `ourMemories.periodPopupSeen.v8.1.${todayISO()}`;
  if(!force && sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key,'1');
  setTimeout(()=>{
    $('#modalContent').innerHTML = `<div class="period-popup-card">
      <img src="${assetUrl(mood.src)}" alt="${mood.title}">
      <div class="period-popup-body">
        <div class="badge-row">
          <span class="badge">🚨 小舜警報</span>
          <span class="badge">前三天 / 經期中</span>
        </div>
        <h2>${mood.title}</h2>
        <p>${warningText}</p>
        <div class="story">${mood.caption}</div>
        <button type="button" class="period-popup-close" onclick="document.querySelector('#modal')?.close()">收到，立刻切換照顧模式</button>
      </div>
    </div>`;
    $('#modal').showModal();
    bindImageFallbacks($('#modal'));
  }, 450);
}

async function showHomePeriodPopup(force=false){
  try{
    const info = await getPeriodPrediction();
    info.records = dedupePeriodRecords(info.records);
    const active = findActivePeriod(info.records);
    const alertActive = isPeriodAlertActive(info, active);
    if(!alertActive) return;
    const mood = getDailyAngryPhoto();
    const warningText = getPeriodWarning();
    showPeriodAlertPopup(mood, warningText, force);
  }catch(e){
    console.warn('首頁經期警報載入失敗', e);
  }
}


async function renderPeriod(){
  const info=await getPeriodPrediction();
  info.records = dedupePeriodRecords(info.records);
  const active=findActivePeriod(info.records);
  const alertActive = isPeriodAlertActive(info, active);
  const today=todayISO();
  const dayOfActive = active ? dayDiff(today, active.start)+1 : null;
  const pillReminder = active && dayOfActive===5;
  const mood = getDailyAngryPhoto();
  const warningText = getPeriodWarning();
  $('#periodCard').innerHTML = `${alertActive ? `<div class="period-img-wrap"><img class="feature-img" src="${assetUrl(mood.src)}" alt="小舜警報照片"><div class="period-alert-chip">🚨 PERIOD ALERT</div></div>` : renderCutePeriodImage()}
    <div class="feature-body"><div class="badge-row"><span class="badge">平均週期 ${info.cycle} 天</span><span class="badge">平均經期 ${info.avgDays} 天</span><span class="badge">下次 ${fmt(info.nextStart)}～${fmt(info.nextEnd)}</span></div><h3>${alertActive?'小舜警報已啟動':'小舜平時是如此乖巧可愛！'}</h3><p>${alertActive ? warningText : `過去月份現在只作為統計資料，不會再每天確認。小舜警報圖庫與 popup 只會在預估經期前三天，或經期已開始時出現。`}</p>${alertActive?`<div class="period-alert-note"><b>${mood.title}</b>：${mood.caption}</div>`:''}${pillReminder?`<div class="danger-story">第 5 天提醒：記得開始吃避孕藥！但請以醫囑與藥袋標示為準。</div>`:`<div class="story">${cloudReady?'資料會同步到 Supabase；換瀏覽器也能讀到相同紀錄。':'目前使用本機備援；請確認 Supabase SQL 權限。'}</div>`}</div>`;
  const rows = [...info.records].sort((a,b)=>b.start.localeCompare(a.start)).map(r=>{
    const days=dayDiff(r.end,r.start)+1;
    return `<div class="record-row"><div><b>${fmt(r.start)}～${fmt(r.end)}</b><p>${days} 天${r.note?`・${r.note}`:''}</p></div><button onclick="deletePeriodRecord('${r.id||r.start}')">刪除</button></div>`;
  }).join('');
  $('#periodTable').innerHTML = `<div class="period-table glass"><div class="period-table-head"><b>經期歷史數據</b><span>固定週期 ${info.cycle} 天 / 平均 ${info.avgDays} 天</span></div>${rows || '<div class="empty-card">尚無經期紀錄。</div>'}</div>`;
}


async function getMoodPosts(){
  if(!db) return loadJSON('ourMemories.moodPosts.local.v1', []);
  const { data, error } = await db
    .from('mood_posts')
    .select('*, mood_replies(*)')
    .eq('space_id', CLOUD_SPACE_ID)
    .order('created_at', { ascending:false });
  if(error){ console.warn(error); return loadJSON('ourMemories.moodPosts.local.v1', []); }
  return data || [];
}
async function addMoodPost(){
  const author = $('#moodAuthor').value;
  const mood = $('#moodValue').value;
  const message = $('#moodMessage').value.trim();
  if(!message){ toast('先寫一點今天想說的話'); return; }
  try{
    if(db){
      await cloudInsert('mood_posts', {author, mood, message, mood_date: todayISO()});
    }else{
      const local=loadJSON('ourMemories.moodPosts.local.v1', []);
      local.unshift({id:Date.now(), author, mood, message, mood_date:todayISO(), created_at:new Date().toISOString(), mood_replies:[]});
      saveJSON('ourMemories.moodPosts.local.v1', local);
    }
  }catch(e){
    console.error('mood insert failed', e);
    toast('心情沒有寫入成功，請檢查 Supabase 權限。');
    return;
  }
  $('#moodMessage').value='';
  toast('今日心情已寫入 Supabase，畫面即將重新整理。');
  refreshAfterCloudWrite('mood');
}
async function addMoodReply(postId){
  const input = document.querySelector(`[data-reply-input="${postId}"]`);
  const authorSel = document.querySelector(`[data-reply-author="${postId}"]`);
  const message = input?.value.trim();
  const author = authorSel?.value || '懷寶';
  if(!message){ toast('先寫回覆內容'); return; }
  try{
    if(db) await cloudInsert('mood_replies', {post_id:postId, author, message});
    else{
      const local=loadJSON('ourMemories.moodPosts.local.v1', []);
      const post=local.find(p=>String(p.id)===String(postId));
      if(post){ post.mood_replies=post.mood_replies||[]; post.mood_replies.push({id:Date.now(), author, message, created_at:new Date().toISOString()}); }
      saveJSON('ourMemories.moodPosts.local.v1', local);
    }
    input.value='';
    toast('已回覆');
    await renderMoodBoard();
  }catch(e){ console.error(e); toast('回覆失敗，請確認 Supabase SQL 已執行。');}
}
async function deleteMoodPost(id){
  try{
    if(db) await cloudDelete('mood_posts', id);
    else saveJSON('ourMemories.moodPosts.local.v1', loadJSON('ourMemories.moodPosts.local.v1', []).filter(p=>String(p.id)!==String(id)));
    toast('已刪除心情');
    await renderMoodBoard();
  }catch(e){ console.error(e); toast('刪除失敗');}
}
function fmtDateTime(s){
  if(!s) return '';
  const d=new Date(s);
  if(Number.isNaN(d.getTime())) return s;
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
async function renderMoodBoard(){
  const posts = await getMoodPosts();
  $('#moodBoard').innerHTML = posts.length ? posts.map(p=>`
    <article class="mood-post glass">
      <div class="mood-post-head">
        <div><b>${p.mood}</b><span>${p.author}・${fmtDateTime(p.created_at || p.mood_date)}</span></div>
        <button onclick="deleteMoodPost('${p.id}')">刪除</button>
      </div>
      <p>${p.message}</p>
      <div class="reply-list">${(p.mood_replies||[]).sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at))).map(r=>`<div class="reply"><b>${r.author}</b><span>${r.message}</span></div>`).join('')}</div>
      <div class="reply-box">
        <select data-reply-author="${p.id}"><option value="蕭小舜">蕭小舜</option><option value="懷寶">懷寶</option></select>
        <input data-reply-input="${p.id}" placeholder="回覆這則心情…" />
        <button onclick="addMoodReply('${p.id}')">回覆</button>
      </div>
    </article>
  `).join('') : `<div class="empty-card">還沒有今日心情。可以先發第一則：「今天想被抱抱」。</div>`;
}

function openEvent(id){
  const ev=events.find(e=>e.id===id); const ph=photoByEvent(id);
  $('#modalContent').innerHTML=`${ph?`<img class="modal-img" src="${assetUrl(ph.src)}" alt="${ev.title}">`:''}<div class="modal-body"><div class="badge-row"><span class="badge">${ev.date||'日期待補'}</span><span class="badge">${ev.category}</span></div><h2>${ev.title}</h2><p>${ev.summary}</p>${(ev.chatFragments||[]).map(x=>`<div class="story">${x}</div>`).join('')}</div>`;
  $('#modal').showModal();
}
function openPhoto(id){
  const p=photos.find(x=>x.id===id); const ev=events.find(e=>e.id===p.eventId);
  const m=p.metadata;
  $('#modalContent').innerHTML=`<img class="modal-img" src="${assetUrl(p.src)}" alt="${p.title}"><div class="modal-body"><div class="badge-row"><span class="badge">${p.rank}</span><span class="badge">${p.date||'日期待補'}</span></div><h2>${p.title}</h2><p>${ev?.summary||p.description}</p><div class="meta-grid">
    <div class="meta"><b>原始尺寸</b>${m.originalSize}</div><div class="meta"><b>網站尺寸</b>${m.webSize}</div><div class="meta"><b>方向</b>${m.orientation}</div><div class="meta"><b>比例</b>${m.aspectRatio}</div><div class="meta"><b>EXIF時間</b>${m.exifDateTime}</div><div class="meta"><b>檔案壓縮</b>${Math.round(m.originalBytes/1024)}KB → ${Math.round(m.webpBytes/1024)}KB</div>
  </div></div>`;
  $('#modal').showModal();
}

/* =========================
   v7.4 Major Update Overrides
   ========================= */

const PERIOD_DAILY_LOG_KEY = 'ourMemories.periodDailyLogs.v1';
const DAILY_COUPLE_ANSWER_KEY = 'ourMemories.dailyCoupleAnswers.v1';

const shunPrettyPhotos = [
  {
    "id": "SHUN-PRETTY-01",
    "src": "images/shun_pretty01.webp",
    "title": "漂亮小舜 01",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "3E0126F9-370F-4851-A549-BFA1BDF870C8.jpeg",
    "originalSize": "1206x1809",
    "webSize": "1067x1600"
  },
  {
    "id": "SHUN-PRETTY-02",
    "src": "images/shun_pretty02.webp",
    "title": "漂亮小舜 02",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "C69E2EA3-5CEF-475E-BC4E-A0BEB0F3BA92.jpeg",
    "originalSize": "1206x1809",
    "webSize": "1067x1600"
  },
  {
    "id": "SHUN-PRETTY-03",
    "src": "images/shun_pretty03.webp",
    "title": "漂亮小舜 03",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "IMG_2499.jpeg",
    "originalSize": "3024x4032",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-04",
    "src": "images/shun_pretty04.webp",
    "title": "漂亮小舜 04",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "IMG_2917.jpeg",
    "originalSize": "3024x4032",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-05",
    "src": "images/shun_pretty05.webp",
    "title": "漂亮小舜 05",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1761946409134.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-06",
    "src": "images/shun_pretty06.webp",
    "title": "漂亮小舜 06",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1763876652966.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-07",
    "src": "images/shun_pretty07.webp",
    "title": "漂亮小舜 07",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1768549859452.jpeg",
    "originalSize": "2160x3840",
    "webSize": "900x1600"
  },
  {
    "id": "SHUN-PRETTY-08",
    "src": "images/shun_pretty08.webp",
    "title": "漂亮小舜 08",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1771482128685.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-09",
    "src": "images/shun_pretty09.webp",
    "title": "漂亮小舜 09",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1771751236267.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-10",
    "src": "images/shun_pretty10.webp",
    "title": "漂亮小舜 10",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1772281772750.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-11",
    "src": "images/shun_pretty11.webp",
    "title": "漂亮小舜 11",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1772381496386.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-12",
    "src": "images/shun_pretty12.webp",
    "title": "漂亮小舜 12",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1773832418789.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-13",
    "src": "images/shun_pretty13.webp",
    "title": "漂亮小舜 13",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1773925186039.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-14",
    "src": "images/shun_pretty14.webp",
    "title": "漂亮小舜 14",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1773997933667.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-15",
    "src": "images/shun_pretty15.webp",
    "title": "漂亮小舜 15",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1774148399429.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-16",
    "src": "images/shun_pretty16.webp",
    "title": "漂亮小舜 16",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1775115319528.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-17",
    "src": "images/shun_pretty17.webp",
    "title": "漂亮小舜 17",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1776851437220.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-18",
    "src": "images/shun_pretty18.webp",
    "title": "漂亮小舜 18",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1777463243605.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-19",
    "src": "images/shun_pretty19.webp",
    "title": "漂亮小舜 19",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1777996854165.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-20",
    "src": "images/shun_pretty20.webp",
    "title": "漂亮小舜 20",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1779864387896.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-21",
    "src": "images/shun_pretty21.webp",
    "title": "漂亮小舜 21",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "beauty_1782545420272.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "id": "SHUN-PRETTY-22",
    "src": "images/shun_pretty22.webp",
    "title": "漂亮小舜 22",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "classicu 2025-11-07 204535.582.jpeg",
    "originalSize": "2689x4034",
    "webSize": "1067x1600"
  },
  {
    "id": "SHUN-PRETTY-23",
    "src": "images/shun_pretty23.webp",
    "title": "漂亮小舜 23",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "classicu 2025-11-07 205222.374.jpeg",
    "originalSize": "2688x4033",
    "webSize": "1066x1600"
  },
  {
    "id": "SHUN-PRETTY-24",
    "src": "images/shun_pretty24.webp",
    "title": "漂亮小舜 24",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "dclassic 2026-05-28 173245824E6D6A75F3.jpeg",
    "originalSize": "2687x4032",
    "webSize": "1066x1600"
  },
  {
    "id": "SHUN-PRETTY-25",
    "src": "images/shun_pretty25.webp",
    "title": "漂亮小舜 25",
    "caption": "今天的小舜也漂亮又可愛。",
    "originalFilename": "平拍 27.jpeg",
    "originalSize": "4160x6240",
    "webSize": "1067x1600"
  }
];

const shunPrettyCompliments = [
  "小舜就是這麼漂亮又可愛，看看你多幸運。",
  "小舜漂亮得很不講理，懷寶請好好珍惜。",
  "這麼可愛的小舜出現在你的生命裡，根本是宇宙級幸運。",
  "小舜不只是漂亮，是漂亮到值得被反覆稱讚。",
  "看看這個小舜，漂亮、可愛、聰明，全部都在。",
  "小舜可愛成這樣，懷寶真的要每天心存感激。",
  "這張小舜太漂亮，建議懷寶立刻補一句稱讚。",
  "小舜就是漂亮寶寶本人，請懷寶不要身在福中不知福。",
  "這麼可愛的小舜願意愛你，張懷你真的賺爛。",
  "漂亮小舜出現，請懷寶自動進入寵愛模式。",
  "小舜好看得像收藏級回憶，請好好保存。",
  "小舜就是這麼漂亮，這不是誇張，是事實。",
  "小舜漂亮又可愛，懷寶的幸運值直接爆表。",
  "看到這張小舜，請懷寶立刻承認自己很幸運。",
  "小舜可愛到不像話，漂亮到很值得驕傲。"
];

const dailyCoupleQuestionBank = [
  {category:'興趣', question:'如果明天突然多出一整天空白時間，你最想做什麼？你猜對方會想做什麼？'},
  {category:'愛好', question:'最近最想跟對方分享的一個興趣是什麼？'},
  {category:'照顧', question:'當你很累的時候，最希望對方用什麼方式照顧你？'},
  {category:'約會', question:'如果只能選一種約會，你會選吃飯、散步、看展、看電影、在家耍廢，還是其他？'},
  {category:'默契', question:'你覺得對方最近最常需要的是抱抱、稱讚、陪伴、空間，還是安全感？'},
  {category:'生活', question:'你覺得對方生活裡最可愛的小習慣是什麼？'},
  {category:'價值觀', question:'如果之後一起住，你最在意家裡哪個角落或哪件事？'},
  {category:'情緒', question:'吵架後你最希望對方做的第一件事是什麼？'},
  {category:'未來', question:'如果今年只能一起完成一件事，你最想完成什麼？'},
  {category:'飲食', question:'你最近最想帶對方去吃什麼？你猜對方會想吃什麼？'},
  {category:'收藏', question:'如果要送對方一個小禮物，你覺得他現在最想收到什麼？'},
  {category:'了解彼此', question:'有什麼關於你的喜好，是你希望對方一定要記住的？'},
  {category:'關係', question:'你覺得我們最近最值得被稱讚的一件事是什麼？'},
  {category:'旅行', question:'如果可以立刻出發兩天一夜，你會想去哪裡？'},
  {category:'安全感', question:'哪一句話最能讓你感覺被愛、被接住？'}
];

const angryPhotosExtraV74 = [
  {
    "src": "images/anger11.webp",
    "title": "小舜警報 11",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_1671.jpeg",
    "originalSize": "4032x3024",
    "webSize": "1600x1200"
  },
  {
    "src": "images/anger12.webp",
    "title": "小舜警報 12",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_2221.jpeg",
    "originalSize": "2316x3088",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger13.webp",
    "title": "小舜警報 13",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_3703.jpeg",
    "originalSize": "3024x4032",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger14.webp",
    "title": "小舜警報 14",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_4643.jpeg",
    "originalSize": "1108x1477",
    "webSize": "1108x1477"
  },
  {
    "src": "images/anger15.webp",
    "title": "小舜警報 15",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_6940.jpeg",
    "originalSize": "2316x3088",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger16.webp",
    "title": "小舜警報 16",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_7073.jpeg",
    "originalSize": "2316x3088",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger17.webp",
    "title": "小舜警報 17",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_7303.jpeg",
    "originalSize": "2316x3088",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger18.webp",
    "title": "小舜警報 18",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_7321.jpeg",
    "originalSize": "4032x3024",
    "webSize": "1600x1200"
  },
  {
    "src": "images/anger19.webp",
    "title": "小舜警報 19",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_7360.jpeg",
    "originalSize": "2316x3088",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger20.webp",
    "title": "小舜警報 20",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_8060.jpeg",
    "originalSize": "1774x2364",
    "webSize": "1201x1600"
  },
  {
    "src": "images/anger21.webp",
    "title": "小舜警報 21",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_8901.jpeg",
    "originalSize": "1536x2730",
    "webSize": "900x1600"
  },
  {
    "src": "images/anger22.webp",
    "title": "小舜警報 22",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_9560.jpeg",
    "originalSize": "2316x3088",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger23.webp",
    "title": "小舜警報 23",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "IMG_9707.jpeg",
    "originalSize": "2316x3088",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger24.webp",
    "title": "小舜警報 24",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "beauty_1765285766102.jpeg",
    "originalSize": "2160x3840",
    "webSize": "900x1600"
  },
  {
    "src": "images/anger25.webp",
    "title": "小舜警報 25",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "beauty_1769940731132.jpeg",
    "originalSize": "2160x3840",
    "webSize": "900x1600"
  },
  {
    "src": "images/anger26.webp",
    "title": "小舜警報 26",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "beauty_1771491904929.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger27.webp",
    "title": "小舜警報 27",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "beauty_1772381527664.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger28.webp",
    "title": "小舜警報 28",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "beauty_1773413528107.jpeg",
    "originalSize": "2160x2880",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger29.webp",
    "title": "小舜警報 29",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "classicu 2025-08-29 210821.593.jpeg",
    "originalSize": "2688x3584",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger30.webp",
    "title": "小舜警報 30",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "fxn 2025-02-01 170440.905.jpeg",
    "originalSize": "3024x4032",
    "webSize": "1200x1600"
  },
  {
    "src": "images/anger31.webp",
    "title": "小舜警報 31",
    "caption": "警報啟動，請懷寶立刻切換溫柔模式。",
    "originalFilename": "平拍 76.jpeg",
    "originalSize": "4160x6240",
    "webSize": "1067x1600"
  }
];
const periodWarningsExtraV74 = [
  "警告：小舜能量進入紅色警戒，懷寶請先閉嘴再抱抱。",
  "系統提示：現在不是講道理的時候，是溫柔求生的時候。",
  "小舜警報啟動，請立刻準備抱抱、熱飲與正常講話能力。",
  "前方高壓警戒，懷寶請不要皮、不要辯、不要裝傻。",
  "小舜進入不好惹模式，建議懷寶自動切換乖巧男友設定。",
  "注意：這不是普通生氣，這是『你最好知道自己錯哪』等級。",
  "小舜耐心條偏低，請勿嘗試白目發言。",
  "警報：小舜需要被哄，不需要被分析。",
  "懷寶請注意，現在一句『妳不要想太多』可能造成災難。",
  "小舜目前是珍貴易碎又會咬人的漂亮寶寶，請輕拿輕放。",
  "紅色警戒：請先說我在，再說我陪妳，最後給抱抱。",
  "小舜情緒雲正在打雷，請不要站在雷區講幹話。",
  "現在的任務不是勝利，是讓小舜覺得被愛。",
  "警告：小舜已經累到快炸掉，請立刻降低刺激源。",
  "懷寶請把白目值歸零，把溫柔值拉滿。",
  "這張臉代表：你可以解釋，但最好先道歉。",
  "小舜不是難搞，是身體和心情都在開大型會議。",
  "危險提示：不要問『妳到底想怎樣』，請改問『我可以怎麼陪妳』。",
  "小舜警報中，請勿冷處理、消失、裝沒事。",
  "懷寶生存指南：嘴甜一點、靠近一點、不要讓她等太久。"
];

try {
  angryPhotosExtraV74.forEach(p => angryPhotos.push(p));
  periodWarningsExtraV74.forEach(t => periodWarnings.push(t));
} catch(e) {
  console.warn('v7.4 extra assets failed', e);
}

function monthKey(dateStr){
  if(!isISODate(dateStr)) return 'unknown';
  return dateStr.slice(0,7);
}
function monthTitle(key, suffix='紀錄'){
  if(!/^\d{4}-\d{2}$/.test(key)) return `未分類${suffix}`;
  const [y,m] = key.split('-');
  const names = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  return `${Number(y)}年${names[Number(m)-1]}${suffix}`;
}
function groupByMonth(records, field='date'){
  const map = new Map();
  (records||[]).forEach(r=>{
    const key = monthKey(r[field]);
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  });
  return [...map.entries()].sort((a,b)=>String(b[0]).localeCompare(String(a[0])));
}

function getCycleLength(records){
  const sorted = (records||[]).filter(r=>isISODate(r.start)).sort((a,b)=>a.start.localeCompare(b.start));
  const diffs = [];
  for(let i=1;i<sorted.length;i++){
    const d = dayDiff(sorted[i].start, sorted[i-1].start);
    if(d >= 21 && d <= 40) diffs.push(d);
  }
  if(!diffs.length) return 30;
  const recent = diffs.slice(-6);
  let weightedTotal = 0, weightSum = 0;
  recent.forEach((d,i)=>{ const w=i+1; weightedTotal += d*w; weightSum += w; });
  return Math.round(weightedTotal / weightSum);
}

function getPrettyShunMemory(){
  const photo = pickFromDate(shunPrettyPhotos, todayISO(), 31) || shunCutePhotos[0];
  const compliment = pickFromDate(shunPrettyCompliments, todayISO(), 57) || '小舜就是這麼漂亮又可愛，看看你多幸運。';
  return {photo, compliment};
}

function renderCutePeriodImage(){
  const pick = getPrettyShunMemory();
  const p = pick.photo;
  return `<div class="alert-placeholder pretty-shun-card">
    <img src="${p.src}?v=${APP_VERSION}" alt="${p.title||'漂亮小舜'}">
    <div class="cute-overlay"><b>漂亮小舜隨機回憶</b><p>${pick.compliment}</p></div>
  </div>`;
}

async function cloudSelectPeriodDailyLogs(){
  if(!db) return null;
  const { data, error } = await db.from('period_daily_logs').select('*').eq('space_id', CLOUD_SPACE_ID).order('log_date', { ascending:false });
  if(error){ console.warn('period_daily_logs unavailable', error); return null; }
  return data || [];
}
function normalizePeriodDailyLogs(rows){
  return (rows||[]).map(r=>({
    id:r.id, date:r.log_date || r.date, has_period: r.has_period,
    flow:r.flow||'', pain:r.pain ?? '', mood:r.mood||'', symptoms:r.symptoms||'', note:r.note||''
  })).filter(r=>isISODate(r.date)).sort((a,b)=>b.date.localeCompare(a.date));
}
async function getPeriodDailyLogs(){
  const cloud = await cloudSelectPeriodDailyLogs();
  if(cloud) return normalizePeriodDailyLogs(cloud);
  return loadJSON(PERIOD_DAILY_LOG_KEY, []);
}
async function savePeriodDailyLog() {
  const button = document.querySelector('#periodDailyLogBtn');

  const date = document.querySelector('#periodLogDate')?.value || todayISO();
  const has_period =
    document.querySelector('#periodLogHas')?.value === 'yes';
  const flow =
    document.querySelector('#periodLogFlow')?.value || '';
  const pain = Number(
    document.querySelector('#periodLogPain')?.value || 0
  );
  const mood =
    document.querySelector('#periodLogMood')?.value || '';
  const symptoms =
    document.querySelector('#periodLogSymptoms')?.value?.trim() || '';
  const note =
    document.querySelector('#periodLogNote')?.value?.trim() || '';

  if (button) {
    button.disabled = true;
    button.textContent = '儲存中…';
  }

  try {
    const payload = {
      log_date: date,
      has_period,
      flow,
      pain,
      mood,
      symptoms,
      note
    };

    if (db) {
      const timeout = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Supabase 寫入逾時，請檢查網路或資料表權限'));
        }, 12000);
      });

      await Promise.race([
        cloudInsert('period_daily_logs', payload),
        timeout
      ]);
    } else {
      const logs = loadJSON(PERIOD_DAILY_LOG_KEY, []);

      logs.unshift({
        id: Date.now(),
        date,
        has_period,
        flow,
        pain,
        mood,
        symptoms,
        note
      });

      saveJSON(PERIOD_DAILY_LOG_KEY, logs.slice(0, 300));
    }

    toast('已儲存小舜當天狀況');

    await Promise.race([
      renderPeriod(),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]);

    await renderCareSummary().catch(() => {});
  } catch (error) {
    console.error('period daily log save failed:', error);

    toast(
      error?.message ||
      '當天狀況儲存失敗，請查看 Console 錯誤'
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = '儲存當天狀況';
    }
  }
}
async function deletePeriodDailyLog(id){
  try {
    if(db) await cloudDelete('period_daily_logs', id);
    else saveJSON(PERIOD_DAILY_LOG_KEY, loadJSON(PERIOD_DAILY_LOG_KEY, []).filter(r=>String(r.id)!==String(id)));
    toast('已刪除當天狀況');
    await renderPeriod();
  } catch(e) { console.error(e); toast('刪除失敗'); }
}

function summarizePeriodMonth(records, logs){
  const days = logs.length;
  const painVals = logs.map(l=>Number(l.pain)).filter(n=>!Number.isNaN(n) && n>0);
  const avgPain = painVals.length ? Math.round((painVals.reduce((a,b)=>a+b,0)/painVals.length)*10)/10 : '—';
  const symptoms = logs.flatMap(l=>String(l.symptoms||'').split(/[、,，\s]+/)).filter(Boolean);
  const topSymptoms = [...new Set(symptoms)].slice(0,3).join('、') || '待補';
  return `紀錄 ${days} 天｜平均疼痛 ${avgPain}｜主要狀態：${topSymptoms}`;
}

async function renderPeriod(){
  const info=await getPeriodPrediction();
  info.records = dedupePeriodRecords(info.records);
  const logs = await getPeriodDailyLogs();
  const active=findActivePeriod(info.records);
  const alertActive = isPeriodAlertActive(info, active);
  const today=todayISO();
  const dayOfActive = active ? dayDiff(today, active.start)+1 : null;
  const pillReminder = active && dayOfActive===5;
  const mood = getDailyAngryPhoto();
  const warningText = getPeriodWarning();

  $('#periodCard').innerHTML = `${alertActive ? `<div class="period-img-wrap"><img class="feature-img" src="${mood.src}?v=${APP_VERSION}" alt="小舜警報照片"><div class="period-alert-chip">🚨 PERIOD ALERT</div></div>` : renderCutePeriodImage()}
    <div class="feature-body"><div class="badge-row"><span class="badge">智慧預估週期 ${info.cycle} 天</span><span class="badge">平均經期 ${info.avgDays} 天</span><span class="badge">下次 ${fmt(info.nextStart)}～${fmt(info.nextEnd)}</span></div><h3>${alertActive?'🚨 今日警報':'🌸 漂亮小舜'}</h3><p>${alertActive ? warningText : `小舜就是這麼漂亮可愛，看看懷寶多幸運！系統會依照過去經期開始日智慧預估下一次，不再強制固定 30 天。`}</p>${alertActive?`<div class="period-alert-note"><b>${mood.title}</b>：${mood.caption}</div>`:''}${pillReminder?`<div class="danger-story">第 5 天提醒：記得開始吃避孕藥！但請以醫囑與藥袋標示為準。</div>`:`<div class="story">${cloudReady?'資料會同步到 Supabase；換瀏覽器也能讀到相同紀錄。':'目前使用本機備援；請確認 Supabase SQL 權限。'}</div>`}</div>`;

  const logForm = $('#periodDailyLogForm');
  if(logForm){
    $('#periodLogDate').value = $('#periodLogDate').value || todayISO();
    const btn = $('#periodDailyLogBtn');
    if(btn) btn.onclick = savePeriodDailyLog;
  }

  const groupedLogs = groupByMonth(logs, 'date');
  const groupedRanges = groupByMonth(info.records, 'start');
  const allKeys = [...new Set([...groupedLogs.map(x=>x[0]), ...groupedRanges.map(x=>x[0])])].sort().reverse();

  $('#periodTable').innerHTML = `<div class="period-table glass"><div class="period-table-head"><b>經期歷史數據</b><span>智慧週期 ${info.cycle} 天 / 平均 ${info.avgDays} 天</span></div>
    ${allKeys.length ? allKeys.map(key=>{
      const monthLogs = (groupedLogs.find(x=>x[0]===key)||[key,[]])[1];
      const monthRanges = (groupedRanges.find(x=>x[0]===key)||[key,[]])[1];
      const summary = summarizePeriodMonth(monthRanges, monthLogs);
      return `<details class="month-accordion"><summary><b>${monthTitle(key,'經期狀況')}</b><span>${summary}</span></summary>
        ${monthRanges.map(r=>`<div class="record-row"><div><b>${fmt(r.start)}～${fmt(r.end)}</b><p>${dayDiff(r.end,r.start)+1} 天${r.note?`・${r.note}`:''}</p></div><button onclick="deletePeriodRecord('${r.id||r.start}')">刪除</button></div>`).join('')}
        ${monthLogs.map(l=>`<div class="record-row daily-log-row"><div><b>${fmt(l.date)}｜${l.has_period?'有來':'未來/觀察'}</b><p>流量：${l.flow||'—'}｜疼痛：${l.pain||0}｜情緒：${l.mood||'—'}${l.symptoms?`<br>狀況：${l.symptoms}`:''}${l.note?`<br>備註：${l.note}`:''}</p></div><button onclick="deletePeriodDailyLog('${l.id}')">刪除</button></div>`).join('')}
      </details>`;
    }).join('') : '<div class="empty-card">尚無經期紀錄。</div>'}
  </div>`;

}

async function renderKapi(){
  const records=(await getKapiRecords()).filter(r=>r && r.date && r.status && ((r.food||'').trim() || (r.amount||'').trim() || (r.note||'').trim())).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const last=records[0];
  const range=nextKapiRange(last);
  $('#kapiCard').innerHTML = `${renderKapiCarousel()}<div class="feature-body"><div class="badge-row"><span class="badge">🦎 Pet</span><span class="badge">生日 ${KAPI_BIRTHDAY}</span><span class="badge">${cloudReady?'Supabase 雲端':'本機備援'}</span><span class="badge">月份折疊紀錄</span></div><h3>卡皮照護雷達</h3><p>${kapiStatusText(range)}</p>${last?`<div class="story">上次紀錄：${fmt(last.date)}｜${last.status==='fed'?'有吃飯':'未進食'}${last.food?`｜${last.food}`:''}${last.amount?`｜${last.amount}`:''}</div>`:''}</div>`;

  const grouped = groupByMonth(records, 'date');
  $('#kapiHistory').innerHTML = grouped.length ? grouped.map(([key, rows])=>{
    const fed = rows.filter(r=>r.status==='fed').length;
    const refused = rows.filter(r=>r.status==='refused').length;
    const recent = rows[0];
    return `<details class="month-accordion kapi-month"><summary><b>${monthTitle(key,'卡皮餵食紀錄')}</b><span>有吃 ${fed} 次｜未進食 ${refused} 次｜最近一次 ${recent?fmt(recent.date):'—'}</span></summary>
      ${rows.map(r=>{
        const nr=nextKapiRange(r);
        return `<div class="record-row"><div><b>${fmt(r.date)} ${r.status==='fed'?'✅ 有吃飯':'🥲 未進食'}</b><p>${r.food||'未填食物'} ${r.amount?`・${r.amount}`:''}${r.note?`<br>${r.note}`:''}</p><small>下次：${fmt(nr.start)}～${fmt(nr.end)} ${nr.type}</small></div><button onclick="deleteKapiRecord('${r.id}')">刪除</button></div>`;
      }).join('')}
    </details>`;
  }).join('') : `<div class="empty-card">還沒有卡皮餵食紀錄。輸入日期後按「有吃」或「未進食」就會開始推算。</div>`;
  startKapiCarousel();
}

function monthKey(date=todayISO()){
  return String(date).slice(0,7);
}
function introducedQuestionPool(){
  const currentMonth = monthKey();
  return (dailyQuestionBank || []).filter(item =>
    item?.active !== false && item?.id && item?.question &&
    (!item.introduced_month || item.introduced_month <= currentMonth)
  );
}
function deterministicQuestionPick(items, date=todayISO()){
  if(!items.length) return null;
  const seed = hashString(`${date}|our-memories-v10.4|${items.length}`);
  return items[seed % items.length];
}
async function getDailyQuestionAssignments(){
  if(db){
    const {data, error} = await db.from('daily_question_assignments').select('*')
      .eq('space_id', CLOUD_SPACE_ID).order('question_date', {ascending:false}).limit(500);
    if(!error) return data || [];
    console.warn('daily_question_assignments unavailable', error);
  }
  return loadJSON(DAILY_QUESTION_ASSIGNMENT_KEY, []);
}
async function getDailyCoupleQuestion(){
  const today = todayISO();
  if(db){
    const {data:existing,error} = await db.from('daily_question_assignments').select('*')
      .eq('space_id',CLOUD_SPACE_ID).eq('question_date',today).maybeSingle();
    if(!error && existing){
      return {id:existing.question_id,question:existing.question,category:existing.category,introduced_month:existing.month_key};
    }
  }else{
    const existing=loadJSON(DAILY_QUESTION_ASSIGNMENT_KEY,[]).find(item=>item.question_date===today);
    if(existing) return existing;
  }
  const assignments=await getDailyQuestionAssignments();
  const usedIds=new Set(assignments.map(item=>item.question_id).filter(Boolean));
  const recentCategories=new Set(assignments.filter(item=>{
    const diff=dayDiff(today,item.question_date); return diff>=0 && diff<=7;
  }).map(item=>item.category).filter(Boolean));
  const pool=introducedQuestionPool();
  let candidates=pool.filter(item=>!usedIds.has(item.id) && !recentCategories.has(item.category));
  if(!candidates.length) candidates=pool.filter(item=>!usedIds.has(item.id));
  if(!candidates.length){
    const recentIds=new Set(assignments.filter(item=>{
      const diff=dayDiff(today,item.question_date); return diff>=0 && diff<=180;
    }).map(item=>item.question_id));
    candidates=pool.filter(item=>!recentIds.has(item.id) && !recentCategories.has(item.category));
  }
  if(!candidates.length) candidates=pool.filter(item=>!recentCategories.has(item.category));
  if(!candidates.length) candidates=pool;
  const chosen=deterministicQuestionPick(candidates,today) || dailyCoupleQuestionBank[0];
  const assignment={question_date:today,question_id:chosen.id||`LEGACY-${today}`,question:chosen.question,category:chosen.category||'更了解彼此',month_key:chosen.introduced_month||monthKey()};
  if(db){
    const {data,error}=await db.from('daily_question_assignments').upsert({...assignment,space_id:CLOUD_SPACE_ID},{onConflict:'space_id,question_date'}).select().single();
    if(!error && data) return {id:data.question_id,question:data.question,category:data.category,introduced_month:data.month_key};
    console.warn('daily assignment save failed', error);
  }else{
    const local=loadJSON(DAILY_QUESTION_ASSIGNMENT_KEY,[]).filter(item=>item.question_date!==today);
    local.push(assignment); saveJSON(DAILY_QUESTION_ASSIGNMENT_KEY,local.slice(-500));
  }
  return chosen;
}
async function getDailyCoupleAnswers(){
  if(db){
    const {data, error} = await db.from('daily_couple_answers').select('*').eq('space_id', CLOUD_SPACE_ID).eq('question_date', todayISO()).order('created_at', {ascending:true});
    if(!error) return data || [];
    console.warn('daily_couple_answers unavailable', error);
  }
  return loadJSON(DAILY_COUPLE_ANSWER_KEY, []).filter(a=>a.question_date===todayISO());
}
async function saveDailyCoupleAnswer(){
  const q = await getDailyCoupleQuestion();
  const author = $('#dailyCoupleAuthor')?.value || '蕭小舜';
  const self_answer = $('#dailyCoupleSelf')?.value.trim() || '';
  const guess_partner_answer = $('#dailyCoupleGuess')?.value.trim() || '';
  if(!self_answer || !guess_partner_answer){ toast('自己的答案和猜對方答案都要填唷'); return; }
  try {
    if(db){
      await cloudInsert('daily_couple_answers', {question_date:todayISO(), question_id:q.id||null, question:q.question, category:q.category, author, self_answer, guess_partner_answer});
    } else {
      const local = loadJSON(DAILY_COUPLE_ANSWER_KEY, []);
      const rest = local.filter(a=>!(a.question_date===todayISO() && a.author===author));
      rest.push({id:Date.now(), question_date:todayISO(), question_id:q.id||null, question:q.question, category:q.category, author, self_answer, guess_partner_answer, created_at:new Date().toISOString()});
      saveJSON(DAILY_COUPLE_ANSWER_KEY, rest);
    }
    toast('每日必達問題已送出');
    await renderDailyCoupleChallenge();
  } catch(e) { console.error(e); toast('每日必達沒有寫入成功，請檢查 Supabase 權限。'); }
}
async function getAllDailyCoupleAnswers(){
  if(db){
    const {data, error} = await db
      .from('daily_couple_answers')
      .select('*')
      .eq('space_id', CLOUD_SPACE_ID)
      .order('question_date', {ascending:false})
      .limit(300);

    if(!error) return data || [];
    console.warn('all daily_couple_answers unavailable', error);
  }

  return loadJSON(DAILY_COUPLE_ANSWER_KEY, []);
}

function generatedQuestionsFromCoupleAnswers(allAnswers){
  const grouped = new Map();

  for(const answer of (allAnswers || [])){
    if(!answer?.question_date || !answer?.question || !answer?.author || !answer?.self_answer) continue;
    if(dayDiff(todayISO(), answer.question_date) < 3) continue;

    const key = `${answer.question_date}::${answer.question}`;
    if(!grouped.has(key)){
      grouped.set(key, {
        question_date: answer.question_date,
        question: answer.question,
        category: answer.category || '更了解彼此',
        answers: {}
      });
    }

    grouped.get(key).answers[answer.author] = answer;
  }

  return [...grouped.values()]
    .filter(group => group.answers['蕭小舜'] && group.answers['懷寶'])
    .slice(0, 60)
    .map((group, index) => {
      const shun = group.answers['蕭小舜'];
      const wayne = group.answers['懷寶'];

      return {
        id: `DQ-${group.question_date}-${index}`,
        type: 'open',
        question: `每日必答回顧：關於「${group.question}」，你還記得彼此當時怎麼回答嗎？`,
        options: [],
        answer: null,
        image: '',
        story:
          `蕭小舜：${shun.self_answer}｜猜懷寶：${shun.guess_partner_answer || '未填'}\n` +
          `懷寶：${wayne.self_answer}｜猜小舜：${wayne.guess_partner_answer || '未填'}`,
        tags: ['每日必答', '默契', group.category],
        source: 'daily'
      };
    });
}

async function mergeDailyAnswersIntoQuestionPool(){
  try{
    const allAnswers = await getAllDailyCoupleAnswers();
    const generated = generatedQuestionsFromCoupleAnswers(allAnswers);
    const existingIds = new Set(questions.map(question => question.id));
    const uniqueGenerated = generated.filter(question => !existingIds.has(question.id));
    questions = [...questions, ...uniqueGenerated];
    return uniqueGenerated.length;
  }catch(error){
    console.warn('daily answers question merge failed', error);
    return 0;
  }
}
async function renderDailyCoupleChallenge(){
  const el = $('#dailyCoupleCard');
  if(!el) return;
  const q = await getDailyCoupleQuestion();
  const answers = await getDailyCoupleAnswers();
  const shun = answers.find(a=>a.author==='蕭小舜');
  const wayne = answers.find(a=>a.author==='懷寶');
  const bothDone = !!(shun && wayne);
  el.innerHTML = `<div class="daily-couple-head"><div><p class="eyebrow">Daily Must Answer</p><h2>今日必達問題</h2></div><span>${q.category}</span></div>
    <div class="story">${q.question}</div>
    <div class="daily-answer-status"><span>蕭小舜：${shun?'已回答':'未回答'}</span><span>懷寶：${wayne?'已回答':'未回答'}</span></div>
    ${bothDone ? `<div class="couple-result-grid">
      ${[shun,wayne].map(a=>`<div class="couple-result"><b>${a.author}</b><p><strong>自己的答案：</strong>${a.self_answer}</p><p><strong>猜對方：</strong>${a.guess_partner_answer}</p></div>`).join('')}
      <div class="story full">這題會在 3 天後進入一般遊戲題庫，不會生成回顧卡。</div>
    </div>` : `<form class="daily-couple-form">
      <label>我是<select id="dailyCoupleAuthor"><option value="蕭小舜">蕭小舜</option><option value="懷寶">懷寶</option></select></label>
      <label>我的答案<textarea id="dailyCoupleSelf" rows="2" placeholder="寫下自己的真實答案"></textarea></label>
      <label>我猜對方的答案<textarea id="dailyCoupleGuess" rows="2" placeholder="猜對方會怎麼回答"></textarea></label>
      <button type="button" id="dailyCoupleSaveBtn">送出今日必答</button>
    </form>`}`;
  const btn = $('#dailyCoupleSaveBtn');
  if(btn) btn.onclick = saveDailyCoupleAnswer;
}



function lunarMonthDay(date){
  try{
    const parts=new Intl.DateTimeFormat('en-u-ca-chinese',{timeZone:'Asia/Taipei',month:'numeric',day:'numeric'}).formatToParts(date);
    return {month:Number(parts.find(p=>p.type==='month')?.value),day:Number(parts.find(p=>p.type==='day')?.value)};
  }catch(error){console.warn('Chinese calendar unavailable',error);return {month:null,day:null};}
}
function qixiDateForYear(year){
  const start=new Date(year,6,1), end=new Date(year,9,15);
  for(let date=new Date(start);date<=end;date.setDate(date.getDate()+1)){
    const lunar=lunarMonthDay(date);
    if(lunar.month===7 && lunar.day===7){
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    }
  }
  return null;
}
function specialEventOccurrences(fromDate=todayISO()){
  const year=Number(fromDate.slice(0,4)); const rows=[];
  for(const eventYear of [year,year+1]){
    for(const event of (specialEvents||[])){
      let date=null;
      if(event.type==='fixed') date=`${eventYear}-${String(event.month).padStart(2,'0')}-${String(event.day).padStart(2,'0')}`;
      else if(event.type==='lunar') date=qixiDateForYear(eventYear);
      if(date) rows.push({...event,date,year:eventYear});
    }
  }
  return rows.filter(event=>dayDiff(event.date,fromDate)>=0).sort((a,b)=>a.date.localeCompare(b.date));
}
function getNextSpecialEvent(){return specialEventOccurrences(todayISO())[0]||null;}
function specialEventCountdownText(event){if(!event)return '尚無日期';const days=dayDiff(event.date,todayISO());return days===0?'就是今天！':`剩 ${days} 天`;}

/* =========================================================
   V8.2.4 PERIOD + MEMORY OVERRIDES
   ========================================================= */

const MEMORY_RECENT_KEY = 'ourMemories.recentDailyPhotos.v8.2.4';
const PERIOD_ALERT_SEEN_KEY = 'ourMemories.periodDailyAlertSeen.v8.2.4';
const PERIOD_PILL_SEEN_KEY = 'ourMemories.periodPillAlertSeen.v8.2.4';

function recentPhotoHistory(){
  return loadJSON(MEMORY_RECENT_KEY, []);
}
function rememberDailyPhoto(src){
  if(!src) return;
  const list = recentPhotoHistory().filter(x=>x && x.src !== src);
  list.unshift({src, date:todayISO()});
  saveJSON(MEMORY_RECENT_KEY, list.slice(0,14));
}
function pickUnseenPhoto(){
  const seen = new Set(recentPhotoHistory().map(x=>x.src));
  const candidates = photos.filter(p=>p?.src && !seen.has(p.src));
  const pool = candidates.length ? candidates : photos.filter(p=>p?.src);
  if(!pool.length) return null;
  const p = pickFromDate(pool, todayISO(), 213) || pool[0];
  rememberDailyPhoto(p.src);
  return p;
}
function pickDailyMemory(){
  if(!events.length && !photos.length){
    return {event:{id:'empty',title:'尚未載入回憶',summary:'請確認資料檔案已上傳。',category:'system',rank:'—'},title:'今日回憶錄'};
  }
  const iso = todayISO();
  const today = localDate(iso);
  const lastYear = String(today.getFullYear()-1)+iso.slice(4);
  let match = events.find(e=>isISODate(e.date) && e.date===lastYear);
  if(match) return {event:match,title:'一年前的今天'};
  match = events.find(e=>sameMonthDay(e.date,iso));
  if(match) return {event:match,title:'今天的回憶紀念日'};

  const photo = pickUnseenPhoto();
  if(photo){
    return {
      title:'今日照片回憶',
      event:{
        id:`PHOTO-${photo.id||photo.src}`,
        title:photo.title||'今日照片回憶',
        summary:photo.description||photo.title||'一起留下的回憶。',
        category:'照片',
        rank:photo.rank||'memory',
        __photo:photo
      }
    };
  }

  const pool = events.filter(e=>e.rank==='legendary');
  return {event:pickFromDate(pool.length?pool:events,iso,77)||events[0],title:'今日回憶錄'};
}
function renderFlashback(ev){
  const ph = ev?.__photo || photoByEvent(ev.id);
  $('#flashbackCard').innerHTML = `
    ${ph ? `<img class="feature-img" src="${assetUrl(ph.src)}" alt="${ev.title}">` : `<div class="feature-symbol"><span>${eventIcon(ev)}</span><b>${isDialogueEvent(ev)?'LINE MEMORY':'TEXT MEMORY'}</b></div>`}
    <div class="feature-body">
      <div class="badge-row"><span class="badge">${ev.rank||'memory'}</span><span class="badge">${ev.category||'回憶'}</span></div>
      <h3>${ev.title}</h3><p>${ev.summary||''}</p>
      ${(ev.chatFragments||[]).slice(0,2).map(x=>`<div class="story">${x}</div>`).join('')}
    </div>`;
  bindImageFallbacks($('#flashbackCard'));
}

async function getRecordedPeriodState(){
  const logs = (await getPeriodDailyLogs())
    .filter(l => isISODate(l.date))
    .sort((a,b) => a.date.localeCompare(b.date));

  const periodLogs = logs.filter(l => l.has_period);
  if(!periodLogs.length){
    return {active:false, ended:false, day:null, start:null, end:null, logs};
  }

  const today = todayISO();
  const recentTrueLogs = periodLogs.filter(l => {
    const diff = dayDiff(today, l.date);
    return diff >= 0 && diff <= 14;
  });

  if(!recentTrueLogs.length){
    return {active:false, ended:true, day:null, start:null, end:null, logs};
  }

  // 同一段經期內，即使中間漏記 1～2 天，也不會被誤判成下一次。
  let clusterStart = recentTrueLogs[0].date;
  for(let i=1;i<recentTrueLogs.length;i++){
    if(dayDiff(recentTrueLogs[i].date, recentTrueLogs[i-1].date) > 3){
      clusterStart = recentTrueLogs[i].date;
    }
  }

  const falseAfterStart = logs
    .filter(l => !l.has_period && dayDiff(l.date, clusterStart) >= 0)
    .sort((a,b) => a.date.localeCompare(b.date))[0] || null;

  const day = dayDiff(today, clusterStart) + 1;
  const explicitlyEnded = !!falseAfterStart;
  const withinReasonableLength = day >= 1 && day <= 10;

  return {
    active: !explicitlyEnded && withinReasonableLength,
    ended: explicitlyEnded,
    day,
    start: clusterStart,
    end: falseAfterStart ? addDaysISO(falseAfterStart.date, -1) : null,
    logs
  };
}

function canUseNotifications(){
  return 'Notification' in window;
}
async function requestPeriodNotifications(){
  try{
    if(typeof window.enablePushNotifications !== 'function'){
      throw new Error('Firebase 推播模組尚未載入，請重新整理後再試。');
    }
    const result = await window.enablePushNotifications();
    toast(`已為 ${result.owner} 開啟手機推播`);
  }catch(e){
    console.error('push registration failed',e);
    toast(e.message || '手機推播開啟失敗');
  }
}
function sendPeriodSystemNotification(title, body, tag){
  if(!canUseNotifications() || Notification.permission !== 'granted') return;
  try{
    new Notification(title,{body,tag,icon:'images/anger01.jpg'});
  }catch(e){
    console.warn('system notification failed',e);
  }
}

function showPeriodAlertPopup(mood, warningText, day, force=false){
  if(!mood || !$('#modal') || !$('#modalContent')) return;
  const key = `${PERIOD_ALERT_SEEN_KEY}.${todayISO()}`;
  if(!force && localStorage.getItem(key)) return;
  localStorage.setItem(key,'1');
  setTimeout(()=>{
    $('#modalContent').innerHTML = `<div class="period-popup-card">
      <img src="${assetUrl(mood.src)}" alt="${mood.title}">
      <div class="period-popup-body">
        <div class="badge-row">
          <span class="badge">🚨 小舜警報</span>
          <span class="badge">經期第 ${day} 天</span>
        </div>
        <h2>${mood.title}</h2>
        <p>${warningText}</p>
        <div class="story">${mood.caption}</div>
        <button type="button" class="period-popup-close" onclick="document.querySelector('#modal')?.close()">收到，立刻切換照顧模式</button>
      </div>
    </div>`;
    $('#modal').showModal();
    bindImageFallbacks($('#modal'));
  },450);
  sendPeriodSystemNotification(`🚨 小舜經期第 ${day} 天`,warningText,`period-day-${day}-${todayISO()}`);
}
function showPillAlertPopup(force=false){
  if(!$('#modal') || !$('#modalContent')) return;
  const key = `${PERIOD_PILL_SEEN_KEY}.${todayISO()}`;
  if(!force && localStorage.getItem(key)) return;
  localStorage.setItem(key,'1');
  setTimeout(()=>{
    $('#modalContent').innerHTML = `<div class="pill-alert-full">
      <div class="pill-alert-icon">💊</div>
      <p class="pill-alert-kicker">經期第 5 天</p>
      <h1>記得開始吃避孕藥</h1>
      <p>這是高優先提醒。實際服用方式仍請以醫師指示與藥袋標示為準。</p>
      <button type="button" onclick="document.querySelector('#modal')?.close()">我知道了</button>
    </div>`;
    $('#modal').showModal();
  },250);
  sendPeriodSystemNotification('💊 經期第 5 天提醒','記得依醫師指示開始服用避孕藥。',`pill-${todayISO()}`);
}

async function showHomePeriodPopup(force=false){
  try{
    const state = await getRecordedPeriodState();
    if(!state.active) return;
    if(state.day === 5){
      showPillAlertPopup(force);
      return;
    }
    showPeriodAlertPopup(getDailyAngryPhoto(),getPeriodWarning(),state.day,force);
  }catch(e){
    console.warn('首頁經期警報載入失敗',e);
  }
}

async function renderPeriod(){
  const info = await getPeriodPrediction();
  info.records = dedupePeriodRecords(info.records);
  const logs = await getPeriodDailyLogs();
  const state = await getRecordedPeriodState();
  const alertActive = state.active;
  const pillReminder = state.day === 5;
  const mood = getDailyAngryPhoto();
  const warningText = getPeriodWarning();

  $('#periodCard').innerHTML = `${alertActive ? `<div class="period-img-wrap"><img class="feature-img" src="${assetUrl(mood.src)}" alt="小舜警報照片"><div class="period-alert-chip">🚨 經期第 ${state.day} 天</div></div>` : renderCutePeriodImage()}
    <div class="feature-body">
      <div class="badge-row">
        <span class="badge">智慧週期 ${info.cycle} 天</span>
        <span class="badge">平均經期 ${info.avgDays} 天</span>
        ${state.active
          ? `<span class="badge">本次經期第 ${state.day} 天・尚未結束</span>`
          : `<span class="badge">下次預估 ${fmt(info.nextStart)}～${fmt(info.nextEnd)}</span>`}
      </div>
      <h3>${state.active ? `🚨 本次經期進行中・第 ${state.day} 天` : '🌸 漂亮小舜'}</h3>
      <p>${state.active
        ? `${warningText} 系統不會把這段算成下一次經期；直到你記錄「未來／觀察」，才會視為本次結束並重新顯示下次預估。`
        : '當天第一次記錄「有來／經期中」後，系統會把該日視為本次第 1 天。記錄「未來／觀察」後，才會結束本次週期並顯示下一次預估。'}</p>
      ${pillReminder ? `<div class="pill-inline-alert">💊 第 5 天：記得依醫囑開始吃避孕藥</div>` : ''}
      <button type="button" class="notification-enable-btn" onclick="requestPeriodNotifications()">開啟手機通知</button>
    </div>`;

  const groupedLogs = groupByMonth(logs,'date');
  const groupedRanges = groupByMonth(info.records,'start');
  const allKeys = [...new Set([...groupedLogs.map(x=>x[0]),...groupedRanges.map(x=>x[0])])].sort().reverse();

  $('#periodTable').innerHTML = `<div class="period-table glass">
    <div class="period-table-head"><b>經期歷史數據</b><span>智慧週期 ${info.cycle} 天 / 平均 ${info.avgDays} 天</span></div>
    ${allKeys.length ? allKeys.map(key=>{
      const monthLogs=(groupedLogs.find(x=>x[0]===key)||[key,[]])[1];
      const monthRanges=(groupedRanges.find(x=>x[0]===key)||[key,[]])[1];
      return `<details class="month-accordion"><summary><b>${monthTitle(key,'經期狀況')}</b><span>${summarizePeriodMonth(monthRanges,monthLogs)}</span></summary>
        ${monthRanges.map(r=>`<div class="record-row"><div><b>${fmt(r.start)}～${fmt(r.end)}</b><p>${dayDiff(r.end,r.start)+1} 天${r.note?`・${r.note}`:''}</p></div><button onclick="deletePeriodRecord('${r.id||r.start}')">刪除</button></div>`).join('')}
        ${monthLogs.map(l=>`<div class="record-row daily-log-row"><div><b>${fmt(l.date)}｜${l.has_period?'有來':'未來/觀察'}</b><p>流量：${l.flow||'—'}｜疼痛：${l.pain||0}｜情緒：${l.mood||'—'}${l.symptoms?`<br>狀況：${l.symptoms}`:''}${l.note?`<br>備註：${l.note}`:''}</p></div><button onclick="deletePeriodDailyLog('${l.id}')">刪除</button></div>`).join('')}
      </details>`;
    }).join('') : '<div class="empty-card">尚無經期紀錄。</div>'}
  </div>`;
  const periodLogDate = $('#periodLogDate');
  if (periodLogDate && !periodLogDate.value) {
    periodLogDate.value = todayISO();
  }

  const periodDailyLogBtn = $('#periodDailyLogBtn');
  if (periodDailyLogBtn) {
    periodDailyLogBtn.onclick = savePeriodDailyLog;
    periodDailyLogBtn.disabled = false;
    periodDailyLogBtn.textContent = '儲存當天狀況';
  }

  bindImageFallbacks($('#periodCard'));
}

loadData();

window.addEventListener('error', (event)=>{
  console.error('Global error:', event.error || event.message);
  const line = $('#todayLine');
  if(line) line.textContent = '網站偵測到錯誤，請確認已上傳 v7.4 全部檔案。';
});
